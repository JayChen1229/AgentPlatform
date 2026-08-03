import React, { useState } from 'react';
import { Agent, AgentSkill, MCPServer, ReviewStatus, Tool } from '../../types';
import { formatLatency } from '../../lib/formatters';
import { 
  Cpu, 
  Bot, 
  Server, 
  Wrench, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Code, 
  ChevronRight,
  Shield,
  Layers,
  Check,
  BookOpen,
  Terminal,
  Zap,
  Sliders,
  RefreshCw,
  Filter,
  Loader2
} from 'lucide-react';

interface RegistryViewProps {
  agents: Agent[];
  mcpServers: MCPServer[];
  tools: Tool[];
  skills: AgentSkill[];
  onOpenCreateMcpModal: () => void;
  onOpenCreateSkillModal: () => void;
  onOpenCreateAgentModal: () => void;
  onToggleTool: (toolId: string, enabled: boolean) => void;
  onToggleSkill: (skillId: string, enabled: boolean) => void;
  onDiscoverTools?: (mcpServerId: string) => void;
  isDiscovering?: string | null;
}

const getReviewStatusBadge = (status: ReviewStatus) => {
  switch (status) {
    case 'draft': return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-slate-800 text-slate-400 border border-slate-700">草稿</span>;
    case 'pending_review': return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-amber-950 text-amber-400 border border-amber-800">待審核</span>;
    case 'approved': return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-950 text-emerald-400 border border-emerald-800">已核准</span>;
    case 'rejected': return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-red-950 text-red-400 border border-red-800">已退回</span>;
  }
};

export const RegistryView: React.FC<RegistryViewProps> = ({
  agents,
  mcpServers,
  tools,
  skills,
  onOpenCreateMcpModal,
  onOpenCreateSkillModal,
  onOpenCreateAgentModal,
  onToggleTool,
  onToggleSkill,
  onDiscoverTools,
  isDiscovering,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolSchema, setSelectedToolSchema] = useState<Tool | null>(tools.find(t => t.reviewStatus === 'approved') || tools[0] || null);
  const [selectedSkill, setSelectedSkill] = useState<AgentSkill | null>(skills.find(s => s.reviewStatus === 'approved') || skills[0] || null);
  const [activeTab, setActiveTab] = useState<'skills' | 'tools' | 'mcp' | 'agents'>('skills');
  const [copiedAgentId, setCopiedAgentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');

  const filteredSkills = skills.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.codeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.reviewStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTools = tools.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mcpServerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.reviewStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const categoryBadge: Record<AgentSkill['category'], { label: string; color: string }> = {
    code_execution: { label: '代碼沙盒', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    financial_audit: { label: '金融審計', color: 'bg-blue-950 text-blue-300 border-blue-800' },
    data_processing: { label: '數據處理', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    security: { label: '安全防護', color: 'bg-rose-950 text-rose-300 border-rose-800' },
    web_search: { label: '網路檢索', color: 'bg-purple-950 text-purple-300 border-purple-800' },
    communication: { label: '頻道通訊', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
  };

  const statusFilterOptions = [
    { value: 'all' as const, label: '全部' },
    { value: 'approved' as const, label: '已核准' },
    { value: 'pending_review' as const, label: '待審核' },
    { value: 'rejected' as const, label: '已退回' },
    { value: 'draft' as const, label: '草稿' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>對標：AGENT SKILL 模組註冊與 MINTMCP 治理框架</span>
            </div>
            <h1 className="text-2xl font-black text-white">Agent Skill & MCP 工具註冊表</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              包含企業可重用 Agent Skill 擴充包、MCP 工具協議目標 (Smithy / OpenAPI / Lambda) 以及執行 Schema 結構圖的統一管理註冊中心。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenCreateAgentModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>註冊全新 Agent</span>
            </button>
            <button
              onClick={onOpenCreateSkillModal}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-purple-900/40 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>註冊 Agent Skill</span>
            </button>
            <button
              onClick={onOpenCreateMcpModal}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold text-sm transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>註冊 MCP 目標服務器</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'skills' ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-900/40' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Agent Skill 技能庫 ({skills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'tools' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>工具目錄 ({tools.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mcp')}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'mcp' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>MCP 服務器目標 ({mcpServers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all ${
            activeTab === 'agents' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Agent 集群 Fleet ({agents.length})</span>
        </button>
      </div>

      {/* 0. Skills Tab */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Skill List (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="搜尋 Skill 名稱、CodeName、描述或分類..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const isSelected = selectedSkill?.id === skill.id;
                const badge = categoryBadge[skill.category] || { label: '擴充技能', color: 'bg-slate-800 text-slate-300' };

                return (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    } ${skill.reviewStatus !== 'approved' ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 bg-purple-900/50 text-purple-400 rounded-lg border border-purple-800/60">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-white">{skill.name}</h3>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-purple-300">{skill.codeName}</span>
                        </div>
                      </div>

                      {getReviewStatusBadge(skill.reviewStatus)}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{skill.description}</p>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/80 text-slate-400">
                      <span>版本：{skill.version}</span>
                      <span>調用次數：{skill.usageCount.toLocaleString()} 次</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Skill Detail & Configuration Viewer (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            {selectedSkill ? (
              <>
                <div className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-purple-400 font-bold">{selectedSkill.codeName}</span>
                    <span className="text-xs font-mono text-slate-400">作者：{selectedSkill.author}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedSkill.name}</h2>
                  <p className="text-xs text-slate-300 mt-1">{selectedSkill.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">分類領域</span>
                    <span className="text-purple-300 font-bold">{selectedSkill.category}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">綁定 MCP 工具數</span>
                    <span className="text-indigo-400 font-bold">{selectedSkill.requiredTools.length} 個工具</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Skill System Prompt 系統引導指令</span>
                  </h4>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-purple-200 leading-relaxed">
                    "{selectedSkill.systemPromptInstruction}"
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                    <span>關聯的依賴 MCP 工具清單</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.requiredTools.map((toolId) => {
                      const toolObj = tools.find((t) => t.id === toolId);
                      return (
                        <div key={toolId} className="bg-slate-950 border border-indigo-900/50 px-2.5 py-1 rounded-lg text-xs font-mono flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span className="text-indigo-300">{toolObj ? toolObj.name : toolId}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Parameters Schema 執行參數架構</span>
                  </h4>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                    {JSON.stringify(selectedSkill.parametersSchema, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 text-xs py-12">
                請選擇一個 Agent Skill 以檢視詳細結構。
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. Tools Tab */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tool List (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="依據名稱、描述或 MCP 服務器搜尋工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredTools.map((tool) => {
                const isSelected = selectedToolSchema?.id === tool.id;
                return (
                  <div
                    key={tool.id}
                    onClick={() => setSelectedToolSchema(tool)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    } ${tool.reviewStatus !== 'approved' ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-indigo-900/50 text-indigo-400 rounded-lg border border-indigo-800/60">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-mono font-bold text-sm text-white">{tool.name}</h3>
                          <span className="text-[11px] text-slate-400">{tool.mcpServerName}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getReviewStatusBadge(tool.reviewStatus)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{tool.description}</p>

                    <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/80 text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300">{tool.scopeRequired}</span>
                      <span>平均延遲：{formatLatency(tool.avgLatencyMs)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Tool JSON Schema Viewer (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            {selectedToolSchema ? (
              <>
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-indigo-400 font-bold">{selectedToolSchema.id}</span>
                  <h2 className="text-lg font-mono font-black text-white">{selectedToolSchema.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedToolSchema.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">MCP 目標服務器</span>
                    <span className="text-slate-200 font-bold">{selectedToolSchema.mcpServerName}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">安全治理所需權限點</span>
                    <span className="text-indigo-400 font-bold">{selectedToolSchema.scopeRequired}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    <span>OpenAPI / Smithy 輸入 Schema 結構圖</span>
                  </h4>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-52">
                    {JSON.stringify(selectedToolSchema.inputSchema, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-400" />
                    <span>輸出 Schema 規範定義</span>
                  </h4>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-purple-300 overflow-x-auto max-h-40">
                    {JSON.stringify(selectedToolSchema.outputSchema, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 text-xs py-12">
                請選擇一個工具以檢視 OpenAPI / Smithy Schema 定義。
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MCP Servers Tab */}
      {activeTab === 'mcp' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mcpServers.map((server) => (
            <div key={server.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                    {server.type} 目標
                  </span>
                  <h3 className="font-bold text-white text-base mt-1">{server.name}</h3>
                </div>

                {getReviewStatusBadge(server.reviewStatus)}
              </div>

              <p className="text-xs text-slate-400">{server.description}</p>

              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-indigo-300 truncate">
                {server.endpoint}
              </div>

              {/* Discovered tools count */}
              {(server.discoveredToolsCount ?? 0) > 0 && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                  <span>已發現 <strong className="text-indigo-300">{server.discoveredToolsCount}</strong> 個工具</span>
                  <span>{server.approvedToolsCount ?? 0} 已核准 / {server.pendingToolsCount ?? 0} 待審核</span>
                </div>
              )}

              {onDiscoverTools && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDiscoverTools(server.id); }}
                  disabled={isDiscovering === server.id}
                  className="w-full flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  {isDiscovering === server.id ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>探索中...</span></>
                  ) : (
                    <><RefreshCw className="w-3.5 h-3.5 text-indigo-400" /><span>重新探索工具清單</span></>
                  )}
                </button>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>延遲：{formatLatency(server.latencyMs)}</span>
                <span>驗證方式：<strong className="text-slate-200">{server.authType}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Agents Fleet Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Agent 種類說明:</span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono">
                🎨 畫布 Flow 建構產出
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono">
                🔌 外部獨立微服務 API
              </span>
            </div>
            <div className="text-xs text-slate-400">
              共計 <strong className="text-white font-mono">{agents.length}</strong> 個已登記 Agent
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => {
              const isFlowBuilt = agent.id.includes('flow') || agent.description.includes('Flow') || agent.name.includes('Flow');
              const endpointUrl = `https://ais-dev-avjdfwuq6esg46d2eujl2c-222795270304.asia-east1.run.app/api/v1/agents/${agent.codeName}/run`;

              return (
                <div key={agent.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-lg border ${
                          isFlowBuilt ? 'bg-purple-600/20 text-purple-300 border-purple-500/30' : 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                        }`}>
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">{agent.name}</h3>
                          <span className="font-mono text-[11px] text-slate-400">{agent.codeName}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        {getReviewStatusBadge(agent.reviewStatus)}
                        <span className={`px-1.5 py-0.2 text-[9px] font-mono rounded ${
                          isFlowBuilt ? 'bg-purple-950/80 text-purple-300 border border-purple-800' : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                        }`}>
                          {isFlowBuilt ? '🎨 畫布建構' : '🔌 獨立微服務'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 min-h-[36px] line-clamp-2">{agent.description}</p>

                    <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2.5 text-xs space-y-1 font-mono">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>API 端點 REST URL</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`curl -X POST ${endpointUrl} \\
  -H "Authorization: Bearer vk_live_fintech_7a8d" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Hi Agent"}'`);
                            setCopiedAgentId(agent.id);
                            setTimeout(() => setCopiedAgentId(null), 2000);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 text-[10px] underline"
                        >
                          {copiedAgentId === agent.id ? '已複製 cURL！' : '複製 cURL'}
                        </button>
                      </div>
                      <div className="text-indigo-300 truncate text-[11px] font-mono">{endpointUrl}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block">路由 LLM 模型</span>
                        <span className="text-blue-400 font-bold text-[11px]">{agent.primaryModel}</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block">Cedar 護欄檢查</span>
                        <span className={`font-bold text-[11px] ${agent.guardrailsEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {agent.guardrailsEnabled ? '已安全開啟' : '停用'}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <span className="font-semibold text-slate-300 text-[11px]">系統提示詞 (System Prompt):</span>
                      <p className="italic bg-slate-950/60 p-2 rounded border border-slate-800/80 line-clamp-2 text-[11px] font-mono">
                        "{agent.systemPrompt}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">指派的 MCP 工具與 Skill:</span>
                      <div className="flex flex-wrap gap-1">
                        {agent.assignedTools.length > 0 ? (
                          agent.assignedTools.map((tId) => (
                            <span key={tId} className="px-1.5 py-0.5 bg-slate-950 text-indigo-300 border border-slate-800 rounded font-mono text-[10px]">
                              {tId.replace('tool-', '')}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">無特定限制</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>團隊：<strong className="text-slate-200">{agent.teamOwner}</strong></span>
                    <span className="text-slate-500 text-[10px]">{agent.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
