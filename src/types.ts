export type ActiveTab = 'builder' | 'gateway' | 'traces' | 'registry' | 'policy' | 'playground' | 'analytics' | 'reviews';

// Review & Approval Workflow
export type ReviewStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export type ReviewAction = 'approve' | 'reject' | 'request_changes';

export interface ReviewRecord {
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  reviewAction?: ReviewAction;
  version: number;
  previousVersion?: number;
  changeReason?: string; // for schema-change re-reviews
}

export type ReviewableItemType = 'agent' | 'skill' | 'mcp_server' | 'tool' | 'mcp_batch_auth';

export interface BatchAuthRequest {
  id: string;
  flowId: string;
  flowName: string;
  agentId: string;
  agentName: string;
  mcpServerId: string;
  mcpServerName: string;
  toolsIncluded: string[];
  unionScopesRequired: string[];
  reviewStatus: ReviewStatus;
  reviewRecord: ReviewRecord;
  needsReconfirmation?: boolean;
}

export interface ReviewQueueItem {
  id: string;
  itemType: ReviewableItemType;
  name: string;
  description: string;
  reviewStatus: ReviewStatus;
  reviewRecord: ReviewRecord;
  // reference data for detail panel
  refData: Agent | AgentSkill | MCPServer | Tool | BatchAuthRequest;
}

// Visual Agent Builder (Langflow / Dify Style)
export type FlowNodeType = 'start' | 'llm' | 'tool' | 'skill' | 'agent' | 'router' | 'rag' | 'prompt' | 'output';

export interface ParameterMapping {
  fieldName: string;
  sourceNodeId: string;
  sourceVariable: string;
}

export interface FlowNodeConfig {
  mountMode?: 'deterministic' | 'dynamic';
  model?: string;
  systemPrompt?: string;
  userPromptTemplate?: string;
  temperature?: number;
  maxTokens?: number;
  toolId?: string;
  toolName?: string;
  mcpServerId?: string;
  mcpServerName?: string;
  skillId?: string;
  skillName?: string;
  subAgentId?: string;
  subAgentName?: string;
  condition?: string;
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  topK?: number;
  minScore?: number;
  embeddingModel?: string;
  vectorDb?: string;
  parameterMappings?: ParameterMapping[];
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  x: number;
  y: number;
  config: FlowNodeConfig;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  documentsCount: number;
  totalChunks: number;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  vectorDb: string;
  updatedAt: string;
  sampleChunks?: string[];
}

export interface FlowReleaseVersion {
  id: string;
  version: string;
  status: 'published' | 'draft' | 'archived';
  publishedAt: string;
  publisher: string;
  description: string;
  apiUrl: string;
}

export interface AgentSkill {
  id: string;
  name: string;
  codeName: string;
  category: 'code_execution' | 'financial_audit' | 'data_processing' | 'communication' | 'web_search' | 'security';
  description: string;
  version: string;
  author: string;
  systemPromptInstruction: string;
  requiredTools: string[];
  parametersSchema: Record<string, any>;
  enabled: boolean;
  usageCount: number;
  updatedAt: string;
  // Review fields
  reviewStatus: ReviewStatus;
  reviewRecord?: ReviewRecord;
}

// Gateway & Routing
export interface ModelProvider {
  id: string;
  name: string;
  logo: string;
  status: 'active' | 'degraded' | 'disabled';
  latencyMs: number;
  modelsCount: number;
  apiKeyMasked: string;
}

export interface VirtualKey {
  id: string;
  name: string;
  keyPrefix: string;
  team: string;
  budgetLimitMonthly: number;
  budgetSpentCurrent: number;
  rpmLimit: number;
  tpmLimit: number;
  allowedModels: string[];
  fallbackModels: string[];
  createdAt: string;
  status: 'active' | 'exceeded' | 'revoked';
}

export interface FallbackRule {
  id: string;
  primaryModel: string;
  fallbackModels: string[];
  triggerOnStatusCodes: number[];
  retryAttempts: number;
  enabled: boolean;
}

// Observability & Tracing (Langfuse Style)
export interface Span {
  id: string;
  parentId?: string;
  name: string;
  type: 'agent' | 'llm' | 'mcp_tool' | 'guardrail' | 'retrieval';
  status: 'success' | 'error' | 'running';
  startTime: string;
  endTime?: string;
  durationMs: number;
  tokensPrompt: number;
  tokensCompletion: number;
  cost: number;
  input: any;
  output: any;
  error?: string;
  metadata?: Record<string, any>;
  chosenTool?: string;
  modelReasoning?: string;
  children?: Span[];
}

export interface Trace {
  id: string;
  sessionId: string;
  name: string;
  agentName: string;
  virtualKeyName: string;
  teamName: string;
  status: 'success' | 'error' | 'warning';
  totalDurationMs: number;
  totalTokens: number;
  totalCost: number;
  timestamp: string;
  userPrompt: string;
  finalResponse: string;
  rootSpan: Span;
  tags: string[];
}

// Agent & Tool Registry (TrueFoundry / MintMCP / AgentCore)
export interface MCPServer {
  id: string;
  name: string;
  type: 'openapi' | 'smithy' | 'lambda' | 'mcp_jsonrpc' | 'postgres';
  endpoint: string;
  status: 'online' | 'offline' | 'warning';
  latencyMs: number;
  toolsCount: number;
  authType: 'oauth2' | 'bearer' | 'mtls' | 'none';
  description: string;
  // Review fields
  reviewStatus: ReviewStatus;
  reviewRecord?: ReviewRecord;
  discoveredToolsCount?: number;
  approvedToolsCount?: number;
  pendingToolsCount?: number;
}

export interface Tool {
  id: string;
  name: string;
  mcpServerId: string;
  mcpServerName: string;
  description: string;
  version: string;
  category: 'database' | 'search' | 'communication' | 'finance' | 'code' | 'system';
  scopeRequired: string;
  enabled: boolean;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  timeoutSec: number;
  avgLatencyMs: number;
  // Review fields
  reviewStatus: ReviewStatus;
  reviewRecord?: ReviewRecord;
  autoDiscovered?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  codeName: string;
  description: string;
  primaryModel: string;
  teamOwner: string;
  status: 'deployed' | 'staging' | 'deprecated';
  assignedTools: string[];
  virtualKeyId: string;
  systemPrompt: string;
  guardrailsEnabled: boolean;
  updatedAt: string;
  // Review fields
  reviewStatus: ReviewStatus;
  reviewRecord?: ReviewRecord;
}

// Policy & Governance (Loom / Cedar-OPA 21 Scopes)
export interface PermissionScope {
  id: string;
  code: string;
  category: 'LLM' | 'MCP_TOOL' | 'DATA' | 'SYSTEM' | 'ADMIN';
  name: string;
  description: string;
}

export interface RoleBinding {
  id: string;
  roleName: string;
  team: string;
  scopesAllowed: string[];
  agentsBoundCount: number;
}

export interface GuardrailConfig {
  piiMasking: boolean;
  promptInjectionDefense: boolean;
  toxicityFilter: boolean;
  hallucinationCheck: boolean;
  maxOutputBudgetDollars: number;
  bannedTopics: string[];
}

// Cost & Analytics
export interface CostAttribution {
  dimension: string;
  spent: number;
  budget: number;
  percentage: number;
  color: string;
}

export interface UsageTimeSeries {
  time: string;
  promptTokens: number;
  completionTokens: number;
  toolCost: number;
  modelCost: number;
}
