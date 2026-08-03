# 🏗️ 企業級 Agent 核心平台 — 功能全覽與競品對標手冊

> **版本**: v3.8.0-prod  
> **技術棧**: React + TypeScript + Vite + TailwindCSS  
> **部署模式**: 靜態前端 SPA (可部署於 Netlify / Cloud Run / Vercel)

---

## 📌 平台定位

本平台是一套**企業級 AI Agent 全生命週期管理平台**，從**視覺化建構 → 模型路由 → 可觀測性追蹤 → 工具與 Agent 註冊表 → 策略權限治理 → 即時測試場 → 成本分析**，涵蓋 Agent 的 Build（開發面）與 Govern（治理面）共 **7 大模組**。

### 🎯 核心架構理念

| 層級 | 能力 | 對標產品 |
|------|------|----------|
| **Build 開發面** | 視覺化 Flow 拖拉建構、RAG 知識庫、版本發佈 | Langflow / Dify / Flowise |
| **Govern 治理面** | 網關路由、追蹤、註冊表、策略、測試場、分析 | LiteLLM + Langfuse + AgentCore + Cedar-OPA |

---

## 🗂️ 七大功能模組詳細介紹

---

### 模組一：🔀 視覺化建構器 (Flow Builder)

> **對標平台**: [Langflow](https://www.langflow.org/) / [Dify](https://dify.ai/) / [Flowise](https://flowiseai.com/) / [LangGraph Studio](https://www.langchain.com/langgraph)

#### 功能概述

以 Low-Code 拖拉式畫布建構多步驟 Agent 工作流，無需撰寫程式碼即可完成複雜 Agent 管線的設計、測試與發佈。

#### 詳細功能清單

| 功能 | 說明 |
|------|------|
| **節點類型支援** | 9 種節點類型：`Start 觸發點`、`LLM 推理`、`Tool MCP 工具調用`、`Skill Agent 擴充包`、`Agent 子嵌套 (Multi-Agent)`、`Router 條件分流`、`RAG 向量知識庫`、`Prompt 語意模版`、`Output 最終輸出` |
| **節點拖拉排序** | 支援 Drag & Drop 重新排列流程順序，自動重建節點間連線邊 |
| **節點參數配置面板** | 每個選中節點可在右側面板中調整詳細參數（模型選擇、temperature、system prompt、top-K 等） |
| **新增 / 刪除節點** | 按一鍵新增任意類型節點至畫布，支援一鍵刪除與自動解除連線 |
| **RAG 知識庫管理** | 建立知識庫、設定切塊大小 (chunk size)、重疊窗口 (overlap)、選擇 Embedding 模型 (text-embedding-004)、向量資料庫 (Qdrant / Pgvector)、上傳文件、預覽切塊內容 |
| **版本管理與發佈** | 將工作流發佈為版本（如 v1.3.0），產生可調用的 REST API 端點，支援版本歷史瀏覽與狀態標籤（published / draft / archived） |
| **一鍵發佈至 Agent Registry** | 從 Builder 直接將 Flow 發佈為註冊的 Agent，自動同步至「Agent 與工具註冊表」模組 |
| **嵌入式測試執行器** | 輸入測試 Prompt 即可在畫布內逐節點執行，即時顯示每個節點的執行動畫與最終 Trace 結果 |
| **cURL 端點複製** | 發佈後產生的 API URL 可一鍵複製 cURL 指令 |

#### 競品對標分析

| 功能 | 本平台 | Langflow | Dify | Flowise |
|------|--------|----------|------|---------|
| 視覺化 Flow 畫布 | ✅ | ✅ | ✅ | ✅ |
| RAG 知識庫整合 | ✅ | ✅ | ✅ | ✅ |
| Multi-Agent 子嵌套 | ✅ | ⚠️ 有限 | ✅ | ❌ |
| Skill 擴充包系統 | ✅ | ❌ | ✅ (Plugin) | ❌ |
| 條件分流 Router | ✅ | ✅ | ✅ | ✅ |
| 版本管理 & API 發佈 | ✅ | ⚠️ 有限 | ✅ | ❌ |
| 一鍵同步至 Agent 註冊表 | ✅ | ❌ | ❌ | ❌ |
| 嵌入式逐節點測試動畫 | ✅ | ⚠️ 有限 | ✅ | ⚠️ 有限 |

---

### 模組二：🌐 網關與路由 (Gateway & Routing)

> **對標平台**: [LiteLLM](https://www.litellm.ai/) / [Portkey](https://portkey.ai/) / [Helicone](https://www.helicone.ai/)

#### 功能概述

統一的 AI 模型代理層，透過虛擬金鑰 (Virtual Key) 實現跨團隊的預算控制、速率限制、模型降級備援與多供應商負載平衡。

#### 詳細功能清單

| 功能 | 說明 |
|------|------|
| **上游模型提供者管理** | 整合 6 家 AI 模型提供者：Google Gemini、OpenAI、Anthropic Claude、DeepSeek、AWS Bedrock、Ollama 本地集群 |
| **即時狀態監控** | 每家提供者顯示運作狀態（`運作正常` / `性能下降`）、延遲 (ms)、支援模型數量、遮蔽 API Key |
| **虛擬金鑰 (Virtual Key) 簽發** | 為各團隊簽發虛擬 API 金鑰，設定月度預算上限、RPM/TPM 速率限制、允許的模型白名單、降級備援模型鏈 |
| **團隊預算隔離** | 每把金鑰綁定團隊，精確追蹤已使用 / 剩餘預算，超額金鑰自動標記為 `exceeded` |
| **模型降級備援規則** | 定義主模型 → 備援模型鏈，當主模型返回指定 HTTP 錯誤碼（429、500、502、503）時自動降級 |
| **重試策略** | 每條降級規則可設定最大重試次數 |
| **虛擬金鑰 CRUD** | 支援新增與刪除虛擬金鑰，即時更新 UI 狀態 |

#### 競品對標分析

| 功能 | 本平台 | LiteLLM | Portkey | Helicone |
|------|--------|---------|---------|----------|
| 多供應商統一代理 | ✅ | ✅ | ✅ | ⚠️ 有限 |
| 虛擬金鑰管理 | ✅ | ✅ | ✅ | ❌ |
| 團隊預算隔離 | ✅ | ✅ | ✅ | ⚠️ 有限 |
| RPM/TPM 速率限制 | ✅ | ✅ | ✅ | ❌ |
| 模型降級備援 | ✅ | ✅ | ✅ | ❌ |
| 模型白名單 / 黑名單 | ✅ | ✅ | ✅ | ❌ |
| 本地模型 (Ollama) 支援 | ✅ | ✅ | ❌ | ❌ |

---

### 模組三：📊 可觀測性與追蹤 (Observability & Tracing)

> **對標平台**: [Langfuse v3](https://langfuse.com/) / [LangSmith](https://www.langchain.com/langsmith) / [Arize Phoenix](https://phoenix.arize.com/)

#### 功能概述

全鏈路分佈式追蹤系統，以樹狀 Span 結構完整記錄每次 Agent 執行的推理路徑、工具調用、安全護欄結果與成本明細。

#### 詳細功能清單

| 功能 | 說明 |
|------|------|
| **Trace 列表面板** | 左側顯示所有歷史 Trace 列表，含狀態圖標（✅ 成功 / ❌ 錯誤 / ⚠️ 警告）、Agent 名稱、延遲、Token 數、成本 |
| **全文搜尋與篩選** | 支援按 Prompt 內容、Agent 名稱、Trace ID 搜尋，並按狀態（all / success / error / warning）篩選 |
| **分佈式 Span 樹狀視圖** | 選中 Trace 後展開完整 Span 樹，每個 Span 顯示類型（Agent / LLM / MCP Tool / Guardrail / Retrieval）、狀態、延遲、Token 與成本 |
| **五種 Span 類型** | `agent`（Agent 根節點）、`llm`（LLM 模型調用）、`mcp_tool`（MCP 工具調用）、`guardrail`（安全護欄檢查）、`retrieval`（向量檢索） |
| **Span 展開/折疊** | 可遞迴展開或折疊任意 Span 的子節點 |
| **Input / Output 原始資料** | 每個 Span 可查看原始 JSON Input 與 Output，包括 Prompt 內容、工具參數、檢索結果等 |
| **Trace 元數據** | Trace ID、Session ID、時間戳、Tags（如 `environment:playground`、`model:gemini-3.6-flash`） |
| **Playground 自動追蹤** | 從測試場發送的每次對話自動生成完整 Trace 並加入追蹤列表 |

#### 競品對標分析

| 功能 | 本平台 | Langfuse v3 | LangSmith | Arize Phoenix |
|------|--------|-------------|-----------|---------------|
| 分佈式 Span 追蹤 | ✅ | ✅ | ✅ | ✅ |
| 樹狀 Span 視圖 | ✅ | ✅ | ✅ | ✅ |
| 搜尋 & 篩選 | ✅ | ✅ | ✅ | ✅ |
| 成本歸因追蹤 | ✅ | ✅ | ✅ | ⚠️ 有限 |
| Guardrail Span | ✅ | ⚠️ 有限 | ⚠️ 有限 | ❌ |
| MCP 工具調用 Span | ✅ | ⚠️ 有限 | ✅ | ✅ |
| 即時 Playground 整合 | ✅ | ❌ | ✅ | ❌ |

---

### 模組四：🗄️ Agent 與工具註冊表 (Registry)

> **對標平台**: [TrueFoundry](https://www.truefoundry.com/) / [AWS AgentCore](https://aws.amazon.com/ai/agentcore/) / [MintMCP](https://www.mintlify.com/) / [Composio](https://composio.dev/)

#### 功能概述

集中管理所有 Agent、Agent Skill 擴充包、MCP 工具服務器與個別工具的註冊表，提供搜尋、啟停控制、Schema 檢視等企業級治理能力。

#### 四個子面板

##### 4.1 Agent Skills（Agent 擴充包）

| 功能 | 說明 |
|------|------|
| **Skill 卡片展示** | 每個 Skill 顯示名稱、代碼名稱、分類標籤（代碼沙盒 / 金融審計 / 數據處理 / 安全防護 / 網路檢索 / 頻道通訊）、版本、作者、使用次數 |
| **System Prompt 注入指令** | 每個 Skill 綁定一段注入 System Prompt 的指令，Agent 掛載後自動獲得該能力 |
| **所需工具依賴** | 明確列出該 Skill 依賴的 MCP 工具清單 |
| **參數 Schema** | JSON 格式定義 Skill 運行時參數（如 `timeout_seconds`、`max_memory_mb`、`packages_allowed`） |
| **啟用/停用開關** | 一鍵啟停 Skill，即時生效 |
| **新增 Skill Modal** | 透過表單填寫 Skill 名稱、代碼名、類別、版本、作者、描述、System Prompt 指令、關聯工具、參數 Schema |

**內建 Skill 範例**:
- 🐍 **Python Code Interpreter** — 沙盒內執行 Python 數據分析
- 💰 **FinOps Auditor** — 金融總帳與異常發票審計
- 🔒 **SOC2 PII Sanitizer** — 敏感資料自動脫敏
- 🌐 **Web Search & Scraper** — 即時搜尋與網頁內文提煉

##### 4.2 MCP 工具服務器

| 功能 | 說明 |
|------|------|
| **服務器卡片展示** | 顯示服務器名稱、類型（OpenAPI / Smithy / Lambda / MCP JSON-RPC / Postgres）、端點 URL、狀態（🟢 online / 🔴 offline / 🟡 warning）、延遲、工具數、認證方式 |
| **認證類型** | 支援 OAuth2、Bearer Token、mTLS、無認證四種模式 |
| **新增 MCP 服務器 Modal** | 表單填寫名稱、類型、端點、認證方式、描述 |

**內建服務器範例**:
- **AgentCore 核心網關 (Smithy)** — mTLS 認證，42ms 延遲
- **總帳 PostgreSQL MCP** — 直接 SQL 執行
- **Slack Ops 運維 MCP** — OAuth2 頻道管理
- **Qdrant 知識庫向量 MCP** — Lambda 部署的向量檢索
- **GitHub 代碼運維 MCP** — Pull Request 自動化

##### 4.3 工具管理 (Tools)

| 功能 | 說明 |
|------|------|
| **工具列表** | 顯示工具名稱、所屬 MCP 服務器、類別、版本、所需權限點、啟停狀態、超時設定、平均延遲 |
| **Input / Output Schema** | JSON Schema 格式定義工具的輸入參數與輸出格式 |
| **啟用/停用開關** | 一鍵啟停工具 |

**內建工具範例**:
- `db_search_user_ledger` — 總帳查詢
- `slack_post_channel` — Slack 訊息發佈
- `vector_search_policies` — 向量語意檢索
- `github_create_pull_request` — GitHub PR 建立

##### 4.4 Agent 管理

| 功能 | 說明 |
|------|------|
| **Agent 卡片展示** | 顯示名稱、代碼名、描述、主要模型、所屬團隊、狀態（deployed / staging / deprecated）、分配工具、虛擬金鑰綁定、安全護欄啟用狀態 |
| **System Prompt 預覽** | 可查看每個 Agent 的完整 System Prompt |
| **新增 Agent Modal** | 表單填寫名稱、代碼名、描述、主模型、團隊、工具分配、虛擬金鑰、System Prompt、護欄開關 |

**內建 Agent 範例**:
- 🤖 **FinOps 總帳審計 Agent** — 自動核對總帳、發送異常警報
- 🛡️ **資安分流處置機器人** — CVE 監控、自動修補 PR
- 💬 **客戶服務禮賓 Agent** — 政策查詢與帳戶檢索

#### 競品對標分析

| 功能 | 本平台 | TrueFoundry | AWS AgentCore | Composio |
|------|--------|-------------|---------------|----------|
| Agent 註冊與管理 | ✅ | ✅ | ✅ | ⚠️ 有限 |
| MCP 服務器註冊 | ✅ | ⚠️ 有限 | ✅ | ✅ |
| 工具 Schema 檢視 | ✅ | ✅ | ✅ | ✅ |
| Skill 擴充包系統 | ✅ | ❌ | ⚠️ 有限 | ❌ |
| 啟停控制 (Kill Switch) | ✅ | ✅ | ✅ | ⚠️ 有限 |
| 多認證模式 (OAuth2/mTLS) | ✅ | ✅ | ✅ | ✅ |

---

### 模組五：🛡️ 策略與權限治理 (Policy & Governance)

> **對標平台**: [Loom AI](https://www.loom.com/) / [Cedar (AWS)](https://www.cedarpolicy.com/) / [OPA (Open Policy Agent)](https://www.openpolicyagent.org/) / [Permit.io](https://www.permit.io/)

#### 功能概述

企業級 RBAC/ABAC 細粒度權限管理系統，結合 21 個權限點授權矩陣、角色綁定與即時安全護欄。

#### 詳細功能清單

##### 5.1 實時安全護欄 (Guardrails)

| 護欄 | 說明 | 可開關 |
|------|------|--------|
| **PII 敏感數據脫敏** | 自動辨識並遮蔽信用卡號、身分證字號、Email、API Key | ✅ |
| **Prompt 注入防禦** | 偵測並攔截惡意 Prompt 注入攻擊（Jailbreak、DAN 等） | ✅ |
| **毒性內容過濾** | 識別並過濾仇恨言論、暴力、歧視等有害內容 | ✅ |
| **幻覺檢測** | 交叉比對 Agent 輸出與知識庫來源，標記未經驗證的資訊 | ✅ |
| **單次輸出成本上限** | 設定單次推導最大允許成本（預設 $0.50） | ✅ |
| **禁止話題清單** | 定義 Agent 禁止討論的敏感主題（如 internal_salaries、private_crypto_keys） | ✅ |

##### 5.2 21 個細粒度權限點 (Permission Scopes)

跨 5 大類別的完整權限矩陣：

| 類別 | 權限點數 | 範例 |
|------|---------|------|
| **LLM** | 4 個 | 調用標準模型、Pro 模型、微調端點、啟用流式輸出 |
| **MCP_TOOL** | 5 個 | 執行資料庫/Slack/GitHub/支付工具、註冊 MCP 服務器 |
| **DATA** | 4 個 | 讀取 PII 脫敏欄位、原始未脫敏資料、寫入審計日誌、匯入向量文檔 |
| **SYSTEM** | 4 個 | 簽發/撤銷金鑰、開關護欄、修改降級鏈 |
| **ADMIN** | 4 個 | 分配角色、匯出審計紀錄、覆蓋預算、編譯 Cedar/OPA 引擎 |

##### 5.3 角色綁定 (Role Bindings)

| 功能 | 說明 |
|------|------|
| **角色定義** | 為每個角色名稱綁定團隊與允許的權限點集合 |
| **Agent 綁定計數** | 顯示每個角色已綁定的 Agent 數量 |
| **互動式權限矩陣** | 選中角色後，以高亮方式顯示該角色在 21 個權限點中被允許與被拒絕的項目 |
| **分類篩選** | 可按 ALL / LLM / MCP_TOOL / DATA / SYSTEM / ADMIN 過濾權限點顯示 |

#### 競品對標分析

| 功能 | 本平台 | AWS AgentCore (Bedrock Guardrails) | Cedar (AWS) | OPA | Permit.io |
|------|--------|-------------------------------------|-------------|-----|-----------|
| 細粒度權限點 (21 個) | ✅ | ✅ (IAM + Cedar 整合) | ✅ | ✅ | ✅ |
| RBAC 角色綁定 | ✅ | ✅ (IAM Role) | ✅ | ✅ | ✅ |
| PII 脫敏護欄 | ✅ | ✅ (Bedrock Guardrails 內建) | ❌ | ❌ | ❌ |
| Prompt 注入防禦 | ✅ | ✅ (Bedrock Guardrails 內建) | ❌ | ❌ | ❌ |
| 毒性內容過濾 | ✅ | ✅ (Bedrock Guardrails 內建) | ❌ | ❌ | ❌ |
| 幻覺檢測 (Grounding Check) | ✅ | ✅ (Bedrock Guardrails Grounding) | ❌ | ❌ | ❌ |
| 禁止話題清單 | ✅ | ✅ (Denied Topics 功能) | ❌ | ❌ | ❌ |
| 單次輸出成本上限 | ✅ | ⚠️ 需搭配 Budgets API | ❌ | ❌ | ❌ |
| 可視化授權矩陣 UI | ✅ | ❌ (需透過 Console/CLI) | ❌ | ❌ | ✅ |

> [!NOTE]
> AWS AgentCore 透過整合 **Bedrock Guardrails** 已涵蓋多數安全護欄能力（PII 脫敏、Prompt 注入、毒性過濾、幻覺檢測、禁止話題）。Cedar 與 OPA 則專注於策略授權引擎，不涉及 AI 安全護欄層。本平台的差異化在於將**策略授權 + AI 護欄**整合於同一可視化 UI，無需在多個 AWS 服務間切換。

---

### 模組六：🧪 Agent 測試場 (Playground)

> **對標平台**: [LangSmith Playground](https://www.langchain.com/langsmith) / [Portkey Playground](https://portkey.ai/) / [Google AI Studio](https://aistudio.google.com/)

#### 功能概述

互動式即時測試場，支援選擇 Agent、配置模型參數、掛載工具，並產生完整的追蹤記錄以便偵錯。

#### 詳細功能清單

| 功能 | 說明 |
|------|------|
| **Agent 選擇器** | 下拉選單切換已註冊 Agent，自動載入對應的 System Prompt |
| **模型選擇** | 支援 gemini-3.6-flash / gemini-3.1-pro-preview / gpt-4o / claude-3-5-sonnet / deepseek-v3 / ollama-llama3.3 |
| **Temperature 滑桿** | 即時調整模型推導溫度 (0.0 ~ 1.0) |
| **工具掛載** | 勾選測試場可用的 MCP 工具，Agent 在推導時可自動調用 |
| **System Prompt 編輯** | 可即時修改 System Prompt 以測試不同 Agent 行為 |
| **即時對話介面** | 輸入 Prompt 後即時獲得 Agent 回應，顯示完整的執行統計（延遲、Token 數、成本） |
| **對話歷史** | 完整保留多輪對話記錄 |
| **即時追蹤面板** | 每次執行後可直接查看生成的完整 Trace 與 Span 樹，無需切換至追蹤模組 |
| **一鍵清除對話** | 重置對話歷史與追蹤面板 |
| **自動 Trace 同步** | 測試場產生的 Trace 自動同步至可觀測性模組列表 |

#### 競品對標分析

| 功能 | 本平台 | LangSmith | Portkey | Google AI Studio |
|------|--------|-----------|---------|------------------|
| 多模型切換 | ✅ | ✅ | ✅ | ⚠️ Google only |
| 工具掛載測試 | ✅ | ✅ | ⚠️ 有限 | ❌ |
| 即時 Trace 面板 | ✅ | ✅ | ⚠️ 有限 | ❌ |
| System Prompt 即時編輯 | ✅ | ✅ | ✅ | ✅ |
| 成本即時追蹤 | ✅ | ✅ | ✅ | ❌ |
| 多輪對話保留 | ✅ | ⚠️ 有限 | ✅ | ✅ |

---

### 模組七：📈 成本與數據分析 (Analytics Dashboard)

> **對標平台**: [Langfuse Analytics](https://langfuse.com/) / [Portkey Analytics](https://portkey.ai/) / [Helicone Dashboard](https://www.helicone.ai/)

#### 功能概述

精確追蹤跨團隊的 LLM 支出歸因、Token 消耗趨勢、模型成本佔比以及預算警報觸發狀況。

#### 詳細功能清單

| 功能 | 說明 |
|------|------|
| **KPI 指標卡片** | 4 個核心 KPI：每月總支出（含月增率）、總處理 Token 數、單次平均成本、預算超額警報 |
| **團隊成本歸因分析** | 以進度條視覺化呈現每個團隊的支出 vs 預算上限，超額團隊以紅色標示 |
| **模型支出分佈占比** | 以色塊呈現各模型（Gemini Flash / Pro / GPT-4o）的支出比例 |
| **預算警報系統** | 自動偵測超額團隊，觸發硬性限制警報 |

#### 競品對標分析

| 功能 | 本平台 | Langfuse | Portkey | Helicone |
|------|--------|----------|---------|----------|
| 跨團隊成本歸因 | ✅ | ✅ | ✅ | ⚠️ 有限 |
| 模型支出分佈 | ✅ | ✅ | ✅ | ✅ |
| 預算超額警報 | ✅ | ⚠️ 有限 | ✅ | ❌ |
| Token 消耗統計 | ✅ | ✅ | ✅ | ✅ |
| KPI Dashboard | ✅ | ✅ | ✅ | ✅ |

---

## 🔗 跨模組整合關係

平台 7 大模組並非各自獨立，而是深度整合形成完整閉環：

```
┌──────────────────────────────────────────────────────────────────┐
│                    企業級 Agent 核心平台                            │
│                                                                  │
│  ┌─────────────┐    發佈     ┌─────────────────┐                  │
│  │  Flow Builder │──────────▶│  Agent Registry  │                  │
│  │  (視覺化建構) │            │  (Agent/工具註冊) │                  │
│  └──────┬──────┘            └────────┬────────┘                  │
│         │ 測試執行                     │ Agent 選擇                  │
│         ▼                            ▼                           │
│  ┌─────────────┐            ┌─────────────────┐                  │
│  │   Traces     │◀───────────│   Playground     │                  │
│  │  (追蹤系統)   │  自動同步    │  (Agent 測試場)   │                  │
│  └──────┬──────┘            └─────────────────┘                  │
│         │ 成本資料                                                  │
│         ▼                                                        │
│  ┌─────────────┐    預算控制   ┌─────────────────┐                  │
│  │  Analytics   │◀───────────│    Gateway       │                  │
│  │  (成本分析)   │            │  (網關與路由)      │                  │
│  └─────────────┘            └────────┬────────┘                  │
│                                      │ 權限驗證                    │
│                              ┌───────▼────────┐                  │
│                              │     Policy      │                  │
│                              │  (策略與權限治理)  │                  │
│                              └────────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🏢 功能對標：主要 Agent 平台總覽

下表列出本平台與主流 Agent 平台在各能力維度的完整對標：

| 能力維度 | 本平台 | Dify | Langflow | LiteLLM | Langfuse | LangSmith | Portkey | TrueFoundry | AWS AgentCore |
|---------|--------|------|----------|---------|----------|-----------|---------|-------------|---------------|
| 視覺化 Flow 建構 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| RAG 知識庫管理 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| 多供應商模型路由 | ✅ | ⚠️ | ❌ | ✅ | ❌ | ❌ | ✅ | ⚠️ | ⚠️ |
| 虛擬金鑰與預算 | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| 分佈式 Trace 追蹤 | ✅ | ⚠️ | ❌ | ❌ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| MCP 工具協議 | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Agent Skill 擴充包 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| RBAC 21 權限點 | ✅ | ⚠️ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 安全護欄 (Guardrails) | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | ✅ |
| 互動式 Playground | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ⚠️ | ❌ |
| 成本歸因 Dashboard | ✅ | ⚠️ | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |
| 版本管理與 API 發佈 | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

> **圖例**: ✅ 完整支援 ｜ ⚠️ 部分支援 ｜ ❌ 不支援

---

## 🔑 平台差異化優勢

1. **一站式整合** — 市面多數平台僅專注單一領域（如 LiteLLM 僅做路由、Langfuse 僅做追蹤），本平台將 7 大模組整合至單一 UI，消除多工具切換摩擦。

2. **MCP 原生支持** — 採用 Model Context Protocol 標準化工具調用，支援 OpenAPI、Smithy、Lambda、JSON-RPC、Postgres 五種連接器類型。

3. **21 權限點細粒度治理** — 超越多數平台的粗粒度 RBAC，提供 LLM / MCP_TOOL / DATA / SYSTEM / ADMIN 五大類共 21 個精確權限控制點。

4. **Agent Skill 擴充包系統** — 獨創的 Skill 抽象層，將工具 + System Prompt 指令 + 參數 Schema 封裝為可插拔的能力包，實現 Agent 能力的模組化擴展。

5. **Build ↔ Govern 雙面板架構** — 開發者使用 Build 面板快速搭建，管理者使用 Govern 面板監控治理，各取所需。

6. **安全護欄內建** — PII 脫敏、Prompt 注入防禦、毒性過濾、幻覺檢測、成本限制、話題禁令六重防護，開箱即用。

---

## 📁 專案結構

```
AgentPlatform/
├── src/
│   ├── App.tsx                        # 主應用組件 (狀態管理中心)
│   ├── types.ts                       # TypeScript 完整類型定義
│   ├── main.tsx                       # 入口點
│   ├── index.css                      # 全域樣式
│   ├── data/
│   │   └── initialData.ts            # 模擬數據 (Providers / Keys / Agents / Traces...)
│   ├── lib/
│   │   └── formatters.ts             # 格式化工具函數 (貨幣、Token、延遲、日期)
│   └── components/
│       ├── Navbar.tsx                 # 頂部導覽列 (Build / Govern 雙面板)
│       ├── views/
│       │   ├── BuilderView.tsx        # 模組一：視覺化建構器
│       │   ├── GatewayView.tsx        # 模組二：網關與路由
│       │   ├── TracesView.tsx         # 模組三：可觀測性與追蹤
│       │   ├── RegistryView.tsx       # 模組四：Agent 與工具註冊表
│       │   ├── PolicyView.tsx         # 模組五：策略與權限治理
│       │   ├── PlaygroundView.tsx     # 模組六：Agent 測試場
│       │   └── AnalyticsView.tsx      # 模組七：成本與數據分析
│       └── modals/
│           ├── CreateKeyModal.tsx     # 虛擬金鑰簽發表單
│           ├── CreateMcpModal.tsx     # MCP 服務器註冊表單
│           ├── CreateSkillModal.tsx   # Agent Skill 建立表單
│           └── CreateAgentModal.tsx   # Agent 建立表單
├── server.ts                          # Express 後端 (可選，靜態部署可略過)
├── vite.config.ts                     # Vite 建構配置
├── package.json                       # 依賴管理
└── public/
    └── _redirects                     # Netlify SPA 路由重導
```

---

## 🚀 快速啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構生產版本
npm run build
```

---

> **文件更新日期**: 2026-08-03  
> **維護者**: Agent Platform Engineering Team
