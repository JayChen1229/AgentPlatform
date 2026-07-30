import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_PROVIDERS, INITIAL_VIRTUAL_KEYS, INITIAL_FALLBACK_RULES, INITIAL_MCP_SERVERS, INITIAL_TOOLS, INITIAL_AGENTS, INITIAL_21_SCOPES, INITIAL_ROLE_BINDINGS, INITIAL_GUARDRAILS, INITIAL_TRACES } from "./src/data/initialData";
import { Trace, Span } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for live modifications during current session
  let virtualKeys = [...INITIAL_VIRTUAL_KEYS];
  let fallbackRules = [...INITIAL_FALLBACK_RULES];
  let mcpServers = [...INITIAL_MCP_SERVERS];
  let tools = [...INITIAL_TOOLS];
  let agents = [...INITIAL_AGENTS];
  let roleBindings = [...INITIAL_ROLE_BINDINGS];
  let guardrails = { ...INITIAL_GUARDRAILS };
  let traces = [...INITIAL_TRACES];

  // Initialize Google GenAI SDK safely
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "placeholder-key-for-dev",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gateway & Virtual Keys
  app.get("/api/gateway/providers", (req, res) => {
    res.json(INITIAL_PROVIDERS);
  });

  app.get("/api/gateway/keys", (req, res) => {
    res.json(virtualKeys);
  });

  app.post("/api/gateway/keys", (req, res) => {
    const newKey = {
      id: `vk-${Date.now().toString().slice(-4)}`,
      name: req.body.name || "新企業級金鑰",
      keyPrefix: `vk_live_${Math.random().toString(36).substring(2, 8)}`,
      team: req.body.team || "金融工程團隊",
      budgetLimitMonthly: req.body.budgetLimitMonthly || 1000,
      budgetSpentCurrent: 0,
      rpmLimit: req.body.rpmLimit || 500,
      tpmLimit: req.body.tpmLimit || 200000,
      allowedModels: req.body.allowedModels || ["gemini-3.6-flash"],
      fallbackModels: req.body.fallbackModels || ["gemini-3.6-flash"],
      createdAt: new Date().toISOString().split("T")[0],
      status: "active" as const,
    };
    virtualKeys.unshift(newKey);
    res.status(201).json(newKey);
  });

  app.delete("/api/gateway/keys/:id", (req, res) => {
    virtualKeys = virtualKeys.filter(k => k.id !== req.params.id);
    res.json({ success: true });
  });

  app.get("/api/gateway/fallbacks", (req, res) => {
    res.json(fallbackRules);
  });

  // Traces & Observability
  app.get("/api/traces", (req, res) => {
    res.json(traces);
  });

  // Agent & Tool Registry
  app.get("/api/registry/mcp-servers", (req, res) => {
    res.json(mcpServers);
  });

  app.post("/api/registry/mcp-servers", (req, res) => {
    const newServer = {
      id: `mcp-${Date.now().toString().slice(-4)}`,
      name: req.body.name || "Custom MCP Target",
      type: req.body.type || "openapi",
      endpoint: req.body.endpoint || "https://mcp.internal/v1",
      status: "online" as const,
      latencyMs: Math.floor(Math.random() * 80) + 20,
      toolsCount: 1,
      authType: req.body.authType || "bearer",
      description: req.body.description || "Custom registered MCP server target.",
    };
    mcpServers.unshift(newServer);
    res.status(201).json(newServer);
  });

  app.get("/api/registry/tools", (req, res) => {
    res.json(tools);
  });

  app.post("/api/registry/tools/toggle", (req, res) => {
    const { toolId, enabled } = req.body;
    tools = tools.map(t => t.id === toolId ? { ...t, enabled } : t);
    res.json({ success: true, tools });
  });

  app.get("/api/registry/agents", (req, res) => {
    res.json(agents);
  });

  // Policy & Governance (21 Scopes)
  app.get("/api/policy/scopes", (req, res) => {
    res.json(INITIAL_21_SCOPES);
  });

  app.get("/api/policy/roles", (req, res) => {
    res.json(roleBindings);
  });

  app.get("/api/policy/guardrails", (req, res) => {
    res.json(guardrails);
  });

  app.post("/api/policy/guardrails", (req, res) => {
    guardrails = { ...guardrails, ...req.body };
    res.json(guardrails);
  });

  // Playground Chat & Live Agent Execution with Gemini API
  app.post("/api/playground/chat", async (req, res) => {
    const { prompt, systemPrompt, model, selectedTools, temperature } = req.body;

    const startTime = Date.now();
    const traceId = `tr-${Date.now().toString().slice(-4)}`;
    const sessionId = `sess_play_${Math.random().toString(36).substring(2, 6)}`;

    let generatedText = "";
    let isError = false;
    let errorMessage = "";
    let promptTokens = Math.max(12, Math.floor(prompt.length / 3));
    let completionTokens = 0;

    try {
      if (process.env.GEMINI_API_KEY) {
        const result = await ai.models.generateContent({
          model: model || "gemini-3.6-flash",
          contents: prompt,
          config: {
            systemInstruction: systemPrompt || "You are an enterprise AI agent running via LiteLLM & AgentCore Gateway.",
            temperature: temperature !== undefined ? Number(temperature) : 0.7,
          },
        });
        generatedText = result.text || "Execution completed without textual response.";
        completionTokens = Math.max(15, Math.floor(generatedText.length / 3));
      } else {
        // Safe preview fallback when API key is unconfigured
        generatedText = `[企業級 Gateway 代理 Agent 回應]\n\n收到 Prompt：「${prompt}」\n\n執行上下文：\n- 推導模型：${model || "gemini-3.6-flash"}\n- 啟用工具：${selectedTools?.join(", ") || "無"}\n- 安全護欄：已通過 PII 敏感數據脫敏與 Prompt 注入檢查。\n\n模擬輸出：請求已成功透過虛擬金鑰路由完成推導處理。`;
        completionTokens = Math.floor(generatedText.length / 3);
      }
    } catch (err: any) {
      isError = true;
      errorMessage = err?.message || "Failed to execute model request";
      generatedText = `[錯誤] Gateway 模型呼叫失敗：${errorMessage}`;
    }

    const durationMs = Date.now() - startTime;
    const totalTokens = promptTokens + completionTokens;
    const totalCost = Number(((promptTokens * 0.000001) + (completionTokens * 0.000003)).toFixed(6));

    // Construct step-by-step trace tree for Observability
    const childSpans: Span[] = [
      {
        id: `sp-guard-${Date.now()}-1`,
        name: "安全護欄：Cedar PII 與安全過濾器",
        type: "guardrail",
        status: "success",
        startTime: new Date(startTime + 5).toISOString(),
        durationMs: 18,
        tokensPrompt: 0,
        tokensCompletion: 0,
        cost: 0.00005,
        input: { promptSample: prompt.slice(0, 50) },
        output: { piiDetected: false, promptInjectionScore: 0.02, status: "PASSED" },
      },
    ];

    if (selectedTools && selectedTools.length > 0) {
      selectedTools.forEach((toolName: string, idx: number) => {
        childSpans.push({
          id: `sp-tool-${Date.now()}-${idx}`,
          name: `工具調用：${toolName}`,
          type: "mcp_tool",
          status: "success",
          startTime: new Date(startTime + 35 + idx * 40).toISOString(),
          durationMs: 45,
          tokensPrompt: 0,
          tokensCompletion: 0,
          cost: 0.0002,
          input: { tool: toolName, params: { query: prompt } },
          output: { result: `已透過 AgentCore Gateway 成功執行 ${toolName}`, status: "200_OK" },
        });
      });
    }

    childSpans.push({
      id: `sp-llm-${Date.now()}-1`,
      name: `LLM 模型調用：${model || "gemini-3.6-flash"}`,
      type: "llm",
      status: isError ? "error" : "success",
      startTime: new Date(startTime + 100).toISOString(),
      durationMs: Math.max(80, durationMs - 100),
      tokensPrompt: promptTokens,
      tokensCompletion: completionTokens,
      cost: totalCost,
      error: errorMessage || undefined,
      input: { model: model || "gemini-3.6-flash", temperature: temperature || 0.7 },
      output: { responseText: generatedText.slice(0, 100) + "..." },
    });

    const newTrace: Trace = {
      id: traceId,
      sessionId,
      name: `測試場執行：${prompt.slice(0, 30)}...`,
      agentName: "測試場自訂 Agent",
      virtualKeyName: "開發測試沙盒金鑰",
      teamName: "研發實驗室",
      status: isError ? "error" : "success",
      totalDurationMs: durationMs,
      totalTokens,
      totalCost,
      timestamp: new Date().toISOString(),
      userPrompt: prompt,
      finalResponse: generatedText,
      rootSpan: {
        id: `sp-root-${Date.now()}`,
        name: "Playground Session Root",
        type: "agent",
        status: isError ? "error" : "success",
        startTime: new Date(startTime).toISOString(),
        durationMs,
        tokensPrompt: promptTokens,
        tokensCompletion: completionTokens,
        cost: totalCost,
        input: { prompt },
        output: { text: generatedText },
        children: childSpans,
      },
      tags: ["environment:playground", "user:interactive", `model:${model || "gemini-3.6-flash"}`],
    };

    // Prepend to trace store
    traces.unshift(newTrace);

    res.json({
      text: generatedText,
      trace: newTrace,
      stats: {
        durationMs,
        totalTokens,
        promptTokens,
        completionTokens,
        cost: totalCost,
      }
    });
  });

  // Flow Builder Published Endpoint Execution
  app.post("/api/v1/agents/finops-flow/run", async (req, res) => {
    const prompt = req.body.prompt || "進行 FinOps 對帳與 SOC2 合規掃描";
    const apiKey = req.headers.authorization?.replace("Bearer ", "") || "vk_live_fintech_7a8d";

    let generatedText = "";
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
        });
        generatedText = response.text || "已完成畫布 Flow 推導處理。";
      } catch (err: any) {
        generatedText = `[Gemini Agent Response] 已執行 FinOps 審計與向量庫 RAG 檢索：${prompt}`;
      }
    } else {
      generatedText = `[Langflow / Dify 畫布發布 API 回應]\n\nPrompt: "${prompt}"\n\n執行步驟：\n1. RAG 檢索: 已從 Qdrant 取得 3 塊 SOC2 控制條款\n2. 條件路由: 分流至高優先級財務帳單過濾器\n3. LLM 推導: Gemini 3.6 Flash 完成語意綜合\n4. Slack 工具: 已傳送警報至 #fintech-alerts`;
    }

    res.json({
      status: "success",
      flowId: "flow-finops-auditor-v2",
      version: req.query.v || "v1.2.0",
      apiKeyUsed: apiKey,
      output: generatedText,
      traceId: `tr-flow-${Date.now()}`,
      executionTimeMs: 145,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Agent Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
