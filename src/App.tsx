import React, { useState } from 'react';
import { ActiveTab, Agent, AgentSkill, BatchAuthRequest, FallbackRule, FlowEdge, FlowNode, FlowReleaseVersion, GuardrailConfig, KnowledgeBase, MCPServer, ModelProvider, PermissionScope, RoleBinding, Span, Tool, Trace, VirtualKey } from './types';
import { Navbar } from './components/Navbar';
import { BuilderView } from './components/views/BuilderView';
import { GatewayView } from './components/views/GatewayView';
import { TracesView } from './components/views/TracesView';
import { RegistryView } from './components/views/RegistryView';
import { PolicyView } from './components/views/PolicyView';
import { PlaygroundView } from './components/views/PlaygroundView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReviewQueueView } from './components/views/ReviewQueueView';
import { CreateKeyModal } from './components/modals/CreateKeyModal';
import { CreateMcpModal } from './components/modals/CreateMcpModal';
import { CreateSkillModal } from './components/modals/CreateSkillModal';
import { CreateAgentModal } from './components/modals/CreateAgentModal';
import { 
  INITIAL_PROVIDERS, 
  INITIAL_VIRTUAL_KEYS, 
  INITIAL_FALLBACK_RULES, 
  INITIAL_MCP_SERVERS, 
  INITIAL_TOOLS, 
  INITIAL_SKILLS,
  INITIAL_AGENTS, 
  INITIAL_21_SCOPES, 
  INITIAL_ROLE_BINDINGS, 
  INITIAL_GUARDRAILS, 
  INITIAL_TRACES,
  INITIAL_NODES,
  INITIAL_EDGES,
  INITIAL_KNOWLEDGE_BASES,
  INITIAL_RELEASES,
  INITIAL_BATCH_AUTH_REQUESTS
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('builder');

  // Application State
  const [providers, setProviders] = useState<ModelProvider[]>(INITIAL_PROVIDERS);
  const [virtualKeys, setVirtualKeys] = useState<VirtualKey[]>(INITIAL_VIRTUAL_KEYS);
  const [fallbackRules, setFallbackRules] = useState<FallbackRule[]>(INITIAL_FALLBACK_RULES);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(INITIAL_MCP_SERVERS);
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [skills, setSkills] = useState<AgentSkill[]>(INITIAL_SKILLS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [batchAuthRequests, setBatchAuthRequests] = useState<BatchAuthRequest[]>(INITIAL_BATCH_AUTH_REQUESTS);
  const [scopes, setScopes] = useState<PermissionScope[]>(INITIAL_21_SCOPES);
  const [roles, setRoles] = useState<RoleBinding[]>(INITIAL_ROLE_BINDINGS);
  const [guardrails, setGuardrails] = useState<GuardrailConfig>(INITIAL_GUARDRAILS);
  const [traces, setTraces] = useState<Trace[]>(INITIAL_TRACES);

  // Builder State
  const [nodes, setNodes] = useState<FlowNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<FlowEdge[]>(INITIAL_EDGES);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(INITIAL_KNOWLEDGE_BASES);
  const [releases, setReleases] = useState<FlowReleaseVersion[]>(INITIAL_RELEASES);

  // Modals state
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  const currentUser = '資安合規官 (Reviewer)';
  const [isDiscovering, setIsDiscovering] = useState<string | null>(null);

  // Count pending items across agents, skills, mcpServers, tools, batchAuthRequests
  const pendingReviewsCount = 
    agents.filter((a) => a.reviewStatus === 'pending_review').length +
    skills.filter((s) => s.reviewStatus === 'pending_review').length +
    mcpServers.filter((m) => m.reviewStatus === 'pending_review').length +
    tools.filter((t) => t.reviewStatus === 'pending_review').length +
    batchAuthRequests.filter((b) => b.reviewStatus === 'pending_review').length;

  // Handler: Request Batch Authorization for MCP Server in Builder Flow
  const handleRequestBatchAuth = (mcpServerId: string, serverName: string, toolsIncluded: string[], unionScopes: string[]) => {
    const newReq: BatchAuthRequest = {
      id: `batch-auth-${Date.now().toString().slice(-4)}`,
      flowId: 'flow-finops-auditor-v2',
      flowName: 'Build 畫布當前 Flow',
      agentId: 'agent-finops',
      agentName: 'FinOps 總帳審計 Agent',
      mcpServerId,
      mcpServerName: serverName,
      toolsIncluded,
      unionScopesRequired: unionScopes,
      reviewStatus: 'pending_review',
      reviewRecord: {
        submittedBy: 'Flow Architect (Submitter)',
        submittedAt: new Date().toISOString(),
        version: 1,
        changeReason: 'Build 畫布整台伺服器 (Dynamic) 動態掛載批次授權申請',
      },
    };
    setBatchAuthRequests((prev) => [newReq, ...prev]);
  };

  // Handler: Issue Virtual Key (local-only)
  const handleCreateKey = async (keyData: {
    name: string;
    team: string;
    budgetLimitMonthly: number;
    rpmLimit: number;
    tpmLimit: number;
    allowedModels: string[];
    fallbackModels: string[];
  }) => {
    const localKey: VirtualKey = {
      id: `vk-${Date.now().toString().slice(-4)}`,
      name: keyData.name,
      keyPrefix: `vk_live_${Math.random().toString(36).substring(2, 8)}`,
      team: keyData.team,
      budgetLimitMonthly: keyData.budgetLimitMonthly,
      budgetSpentCurrent: 0,
      rpmLimit: keyData.rpmLimit,
      tpmLimit: keyData.tpmLimit,
      allowedModels: keyData.allowedModels,
      fallbackModels: keyData.fallbackModels,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setVirtualKeys((prev) => [localKey, ...prev]);
  };

  // Handler: Delete Virtual Key (local-only)
  const handleDeleteKey = async (keyId: string) => {
    setVirtualKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  // Handler: Register MCP Target with Auto Tool Discovery
  const handleCreateMcp = async (serverData: {
    name: string;
    type: 'openapi' | 'smithy' | 'lambda' | 'mcp_jsonrpc' | 'postgres';
    endpoint: string;
    authType: 'oauth2' | 'bearer' | 'mtls' | 'none';
    description: string;
  }) => {
    const serverId = `mcp-${Date.now().toString().slice(-4)}`;
    const localMcp: MCPServer = {
      id: serverId,
      name: serverData.name,
      type: serverData.type,
      endpoint: serverData.endpoint,
      status: 'online',
      latencyMs: 45,
      toolsCount: 3,
      authType: serverData.authType,
      description: serverData.description,
      reviewStatus: 'pending_review',
      reviewRecord: {
        submittedBy: 'DevOps Lead (Submitter)',
        submittedAt: new Date().toISOString(),
        version: 1,
      },
      discoveredToolsCount: 3,
      approvedToolsCount: 0,
      pendingToolsCount: 3,
    };
    setMcpServers((prev) => [localMcp, ...prev]);

    // Requirement D: Auto-discover tools and create pending tools
    const autoTools: Tool[] = [
      {
        id: `tool-auto-${Date.now()}-1`,
        name: `${serverData.name.toLowerCase().replace(/\s+/g, '_')}_fetch_data`,
        mcpServerId: serverId,
        mcpServerName: serverData.name,
        description: `從 ${serverData.name} 端點自動探索的數據檢索工具。`,
        version: '1.0.0',
        category: 'database',
        scopeRequired: 'mcp:tool:execute:db',
        enabled: false,
        inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        outputSchema: { type: 'object', properties: { results: { type: 'array' } } },
        timeoutSec: 5,
        avgLatencyMs: 120,
        reviewStatus: 'pending_review',
        reviewRecord: { submittedBy: 'System (MCP Auto-Discovery)', submittedAt: new Date().toISOString(), version: 1 },
        autoDiscovered: true,
      },
      {
        id: `tool-auto-${Date.now()}-2`,
        name: `${serverData.name.toLowerCase().replace(/\s+/g, '_')}_execute_action`,
        mcpServerId: serverId,
        mcpServerName: serverData.name,
        description: `針對 ${serverData.name} 觸發自動化操作的核心工具。`,
        version: '1.0.0',
        category: 'system',
        scopeRequired: 'mcp:tool:execute:code',
        enabled: false,
        inputSchema: { type: 'object', properties: { action: { type: 'string' }, payload: { type: 'object' } }, required: ['action'] },
        outputSchema: { type: 'object', properties: { status: { type: 'string' } } },
        timeoutSec: 10,
        avgLatencyMs: 250,
        reviewStatus: 'pending_review',
        reviewRecord: { submittedBy: 'System (MCP Auto-Discovery)', submittedAt: new Date().toISOString(), version: 1 },
        autoDiscovered: true,
      },
      {
        id: `tool-auto-${Date.now()}-3`,
        name: `${serverData.name.toLowerCase().replace(/\s+/g, '_')}_get_status`,
        mcpServerId: serverId,
        mcpServerName: serverData.name,
        description: `檢查 ${serverData.name} 連線與伺服器健康狀態。`,
        version: '1.0.0',
        category: 'system',
        scopeRequired: 'mcp:tool:execute:slack',
        enabled: false,
        inputSchema: { type: 'object', properties: { verbose: { type: 'boolean' } } },
        outputSchema: { type: 'object', properties: { healthy: { type: 'boolean' } } },
        timeoutSec: 3,
        avgLatencyMs: 40,
        reviewStatus: 'pending_review',
        reviewRecord: { submittedBy: 'System (MCP Auto-Discovery)', submittedAt: new Date().toISOString(), version: 1 },
        autoDiscovered: true,
      },
    ];
    setTools((prev) => [...autoTools, ...prev]);
  };

  // Handler: Manual Trigger Tool Rediscovery
  const handleDiscoverTools = (mcpServerId: string) => {
    setIsDiscovering(mcpServerId);
    setTimeout(() => {
      setIsDiscovering(null);
      alert('已完成 MCP 工具重新探索，已同步最新 tools/list 結果！');
    }, 1500);
  };

  // Handler: Create Agent
  const handleCreateAgent = (agentData: Omit<Agent, 'id' | 'updatedAt'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: `agent-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
      reviewStatus: 'pending_review',
      reviewRecord: {
        submittedBy: 'Agent Developer (Submitter)',
        submittedAt: new Date().toISOString(),
        version: 1,
      },
    };
    setAgents((prev) => [newAgent, ...prev]);
  };

  // Handler: Create Agent Skill
  const handleCreateSkill = (skillData: Omit<AgentSkill, 'id' | 'usageCount' | 'updatedAt'>) => {
    const newSkill: AgentSkill = {
      ...skillData,
      id: `skill-${Date.now()}`,
      usageCount: 0,
      updatedAt: new Date().toISOString().split('T')[0],
      reviewStatus: 'pending_review',
      reviewRecord: {
        submittedBy: 'Skill Author (Submitter)',
        submittedAt: new Date().toISOString(),
        version: 1,
      },
    };
    setSkills((prev) => [newSkill, ...prev]);
  };

  // Review Mechanism Handlers
  const handleApproveItem = (itemType: string, itemId: string) => {
    const now = new Date().toISOString();
    const comment = '審核通過，完成資安與權限檢核。已自動上線。';

    if (itemType === 'agent') {
      setAgents((prev) => prev.map((a) => a.id === itemId ? {
        ...a, reviewStatus: 'approved',
        reviewRecord: { ...a.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'approve' }
      } : a));
    } else if (itemType === 'skill') {
      setSkills((prev) => prev.map((s) => s.id === itemId ? {
        ...s, reviewStatus: 'approved', enabled: true,
        reviewRecord: { ...s.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'approve' }
      } : s));
    } else if (itemType === 'mcp_server') {
      setMcpServers((prev) => prev.map((m) => m.id === itemId ? {
        ...m, reviewStatus: 'approved',
        reviewRecord: { ...m.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'approve' }
      } : m));
    } else if (itemType === 'tool') {
      setTools((prev) => prev.map((t) => t.id === itemId ? {
        ...t, reviewStatus: 'approved', enabled: true,
        reviewRecord: { ...t.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'approve' }
      } : t));
    } else if (itemType === 'mcp_batch_auth') {
      setBatchAuthRequests((prev) => prev.map((b) => b.id === itemId ? {
        ...b, reviewStatus: 'approved',
        reviewRecord: { ...b.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'approve' }
      } : b));
    }
  };

  const handleRejectItem = (itemType: string, itemId: string, comment: string) => {
    const now = new Date().toISOString();
    if (itemType === 'agent') {
      setAgents((prev) => prev.map((a) => a.id === itemId ? {
        ...a, reviewStatus: 'rejected',
        reviewRecord: { ...a.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'reject' }
      } : a));
    } else if (itemType === 'skill') {
      setSkills((prev) => prev.map((s) => s.id === itemId ? {
        ...s, reviewStatus: 'rejected', enabled: false,
        reviewRecord: { ...s.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'reject' }
      } : s));
    } else if (itemType === 'mcp_server') {
      setMcpServers((prev) => prev.map((m) => m.id === itemId ? {
        ...m, reviewStatus: 'rejected',
        reviewRecord: { ...m.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'reject' }
      } : m));
    } else if (itemType === 'tool') {
      setTools((prev) => prev.map((t) => t.id === itemId ? {
        ...t, reviewStatus: 'rejected', enabled: false,
        reviewRecord: { ...t.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'reject' }
      } : t));
    } else if (itemType === 'mcp_batch_auth') {
      setBatchAuthRequests((prev) => prev.map((b) => b.id === itemId ? {
        ...b, reviewStatus: 'rejected',
        reviewRecord: { ...b.reviewRecord!, reviewedBy: currentUser, reviewedAt: now, reviewComment: comment, reviewAction: 'reject' }
      } : b));
    }
  };

  const handleRequestChanges = (itemType: string, itemId: string, comment: string) => {
    const now = new Date().toISOString();
    const updateRecord = (rec: any) => ({
      ...rec, reviewedBy: currentUser, reviewedAt: now, reviewComment: `[要求補充說明] ${comment}`, reviewAction: 'request_changes' as const
    });

    if (itemType === 'agent') {
      setAgents((prev) => prev.map((a) => a.id === itemId ? { ...a, reviewRecord: updateRecord(a.reviewRecord) } : a));
    } else if (itemType === 'skill') {
      setSkills((prev) => prev.map((s) => s.id === itemId ? { ...s, reviewRecord: updateRecord(s.reviewRecord) } : s));
    } else if (itemType === 'mcp_server') {
      setMcpServers((prev) => prev.map((m) => m.id === itemId ? { ...m, reviewRecord: updateRecord(m.reviewRecord) } : m));
    } else if (itemType === 'tool') {
      setTools((prev) => prev.map((t) => t.id === itemId ? { ...t, reviewRecord: updateRecord(t.reviewRecord) } : t));
    } else if (itemType === 'mcp_batch_auth') {
      setBatchAuthRequests((prev) => prev.map((b) => b.id === itemId ? { ...b, reviewRecord: updateRecord(b.reviewRecord) } : b));
    }
  };

  // Handler: Toggle Agent Skill Enabled State
  const handleToggleSkill = (skillId: string, enabled: boolean) => {
    setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...s, enabled } : s)));
  };

  // Handler: Toggle Tool Enabled State (local-only)
  const handleToggleTool = async (toolId: string, enabled: boolean) => {
    setTools((prev) => prev.map((t) => (t.id === toolId ? { ...t, enabled } : t)));
  };

  // Handler: Update Guardrails (local-only)
  const handleUpdateGuardrails = async (newConfig: Partial<GuardrailConfig>) => {
    const updated = { ...guardrails, ...newConfig };
    setGuardrails(updated);
  };

  // Handler: Execute Chat in Playground (local mock - no backend needed)
  const handleExecuteChat = async (payload: {
    prompt: string;
    systemPrompt: string;
    model: string;
    selectedTools: string[];
    temperature: number;
  }) => {
    const startTime = Date.now();
    const traceId = `tr-${Date.now().toString().slice(-4)}`;
    const sessionId = `sess_play_${Math.random().toString(36).substring(2, 6)}`;

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));

    const generatedText = `[企業級 Gateway 代理 Agent 回應]\n\n收到 Prompt：「${payload.prompt}」\n\n執行上下文：\n- 推導模型：${payload.model || 'gemini-3.6-flash'}\n- 啟用工具：${payload.selectedTools?.join(', ') || '無'}\n- 安全護欄：已通過 PII 敏感數據脫敏與 Prompt 注入檢查。\n\n模擬輸出：請求已成功透過虛擬金鑰路由完成推導處理。`;
    const promptTokens = Math.max(12, Math.floor(payload.prompt.length / 3));
    const completionTokens = Math.floor(generatedText.length / 3);
    const durationMs = Date.now() - startTime;
    const totalTokens = promptTokens + completionTokens;
    const totalCost = Number(((promptTokens * 0.000001) + (completionTokens * 0.000003)).toFixed(6));

    const childSpans: Span[] = [
      {
        id: `sp-guard-${Date.now()}-1`,
        name: '安全護欄：Cedar PII 與安全過濾器',
        type: 'guardrail',
        status: 'success',
        startTime: new Date(startTime + 5).toISOString(),
        durationMs: 18,
        tokensPrompt: 0,
        tokensCompletion: 0,
        cost: 0.00005,
        input: { promptSample: payload.prompt.slice(0, 50) },
        output: { piiDetected: false, promptInjectionScore: 0.02, status: 'PASSED' },
      },
    ];

    if (payload.selectedTools && payload.selectedTools.length > 0) {
      payload.selectedTools.forEach((toolName: string, idx: number) => {
        childSpans.push({
          id: `sp-tool-${Date.now()}-${idx}`,
          name: `工具調用：${toolName}`,
          type: 'mcp_tool',
          status: 'success',
          startTime: new Date(startTime + 35 + idx * 40).toISOString(),
          durationMs: 45,
          tokensPrompt: 0,
          tokensCompletion: 0,
          cost: 0.0002,
          input: { tool: toolName, params: { query: payload.prompt } },
          output: { result: `已透過 AgentCore Gateway 成功執行 ${toolName}`, status: '200_OK' },
        });
      });
    }

    childSpans.push({
      id: `sp-llm-${Date.now()}-1`,
      name: `LLM 模型調用：${payload.model || 'gemini-3.6-flash'}`,
      type: 'llm',
      status: 'success',
      startTime: new Date(startTime + 100).toISOString(),
      durationMs: Math.max(80, durationMs - 100),
      tokensPrompt: promptTokens,
      tokensCompletion: completionTokens,
      cost: totalCost,
      input: { model: payload.model || 'gemini-3.6-flash', temperature: payload.temperature || 0.7 },
      output: { responseText: generatedText.slice(0, 100) + '...' },
    });

    const newTrace: Trace = {
      id: traceId,
      sessionId,
      name: `測試場執行：${payload.prompt.slice(0, 30)}...`,
      agentName: '測試場自訂 Agent',
      virtualKeyName: '開發測試沙盒金鑰',
      teamName: '研發實驗室',
      status: 'success',
      totalDurationMs: durationMs,
      totalTokens,
      totalCost,
      timestamp: new Date().toISOString(),
      userPrompt: payload.prompt,
      finalResponse: generatedText,
      rootSpan: {
        id: `sp-root-${Date.now()}`,
        name: 'Playground Session Root',
        type: 'agent',
        status: 'success',
        startTime: new Date(startTime).toISOString(),
        durationMs,
        tokensPrompt: promptTokens,
        tokensCompletion: completionTokens,
        cost: totalCost,
        input: { prompt: payload.prompt },
        output: { text: generatedText },
        children: childSpans,
      },
      tags: ['environment:playground', 'user:interactive', `model:${payload.model || 'gemini-3.6-flash'}`],
    };

    setTraces((prev) => [newTrace, ...prev]);

    return {
      text: generatedText,
      trace: newTrace,
      stats: { durationMs, totalTokens, promptTokens, completionTokens, cost: totalCost },
    };
  };

  // Handler: Execute Test Flow in Builder (local mock)
  const handleRunTestFlow = async (prompt: string) => {
    const data = await handleExecuteChat({
      prompt,
      systemPrompt: '你是一位經由 Langflow / Dify 畫布建構的企業級 Agent。',
      model: 'gemini-3.6-flash',
      selectedTools: ['tool-slack-post', 'tool-qdrant-search'],
      temperature: 0.2,
    });
    return data.trace;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tracesCount={traces.length}
        activeKeysCount={virtualKeys.filter((k) => k.status === 'active').length}
        pendingReviewsCount={pendingReviewsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'builder' && (
          <BuilderView
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            knowledgeBases={knowledgeBases}
            setKnowledgeBases={setKnowledgeBases}
            releases={releases}
            setReleases={setReleases}
            tools={tools}
            skills={skills}
            agents={agents}
            mcpServers={mcpServers}
            onRunTestFlow={handleRunTestFlow}
            onNavigateToTraces={() => setActiveTab('traces')}
            onPublishAgentToRegistry={handleCreateAgent}
            onNavigateToRegistry={() => setActiveTab('registry')}
            onRequestBatchAuth={handleRequestBatchAuth}
          />
        )}

        {activeTab === 'gateway' && (
          <GatewayView
            providers={providers}
            virtualKeys={virtualKeys}
            fallbackRules={fallbackRules}
            onOpenCreateKeyModal={() => setIsKeyModalOpen(true)}
            onDeleteKey={handleDeleteKey}
          />
        )}

        {activeTab === 'traces' && <TracesView traces={traces} />}

        {activeTab === 'registry' && (
          <RegistryView
            agents={agents}
            mcpServers={mcpServers}
            tools={tools}
            skills={skills}
            onOpenCreateMcpModal={() => setIsMcpModalOpen(true)}
            onOpenCreateSkillModal={() => setIsSkillModalOpen(true)}
            onOpenCreateAgentModal={() => setIsAgentModalOpen(true)}
            onToggleTool={handleToggleTool}
            onToggleSkill={handleToggleSkill}
            onDiscoverTools={handleDiscoverTools}
            isDiscovering={isDiscovering}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewQueueView
            agents={agents}
            skills={skills}
            mcpServers={mcpServers}
            tools={tools}
            batchAuthRequests={batchAuthRequests}
            currentUser={currentUser}
            onApprove={handleApproveItem}
            onReject={handleRejectItem}
            onRequestChanges={handleRequestChanges}
          />
        )}

        {activeTab === 'policy' && (
          <PolicyView
            scopes={scopes}
            roles={roles}
            guardrails={guardrails}
            onUpdateGuardrails={handleUpdateGuardrails}
          />
        )}

        {activeTab === 'playground' && (
          <PlaygroundView
            agents={agents}
            tools={tools}
            onExecuteChat={handleExecuteChat}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView virtualKeys={virtualKeys} traces={traces} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>企業級 Agent 平台 Web UI • LiteLLM 網關 + Langfuse v3 追蹤 + AgentCore MCP + Cedar/OPA 策略治理</span>
        </div>
      </footer>

      {/* Modals */}
      <CreateKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onCreate={handleCreateKey}
      />

      <CreateMcpModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        onCreate={handleCreateMcp}
      />

      <CreateSkillModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        availableTools={tools}
        onCreateSkill={handleCreateSkill}
      />

      <CreateAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        availableTools={tools}
        virtualKeys={virtualKeys}
        onCreateAgent={handleCreateAgent}
      />
    </div>
  );
}
