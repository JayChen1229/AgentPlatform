import React, { useState } from 'react';
import { X, Bot, Cpu, Key, Wrench, ShieldCheck, Sparkles } from 'lucide-react';
import { Agent, Tool, VirtualKey } from '../../types';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTools: Tool[];
  virtualKeys: VirtualKey[];
  onCreateAgent: (agent: Omit<Agent, 'id' | 'updatedAt'>) => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  availableTools,
  virtualKeys,
  onCreateAgent,
}) => {
  const [name, setName] = useState('');
  const [codeName, setCodeName] = useState('');
  const [description, setDescription] = useState('');
  const [primaryModel, setPrimaryModel] = useState('gemini-3.6-flash');
  const [teamOwner, setTeamOwner] = useState('FinTech Core Team');
  const [status, setStatus] = useState<Agent['status']>('deployed');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [virtualKeyId, setVirtualKeyId] = useState(virtualKeys[0]?.id || 'key-01');
  const [guardrailsEnabled, setGuardrailsEnabled] = useState(true);

  if (!isOpen) return null;

  const handleToggleTool = (toolId: string) => {
    if (selectedTools.includes(toolId)) {
      setSelectedTools(selectedTools.filter((t) => t !== toolId));
    } else {
      setSelectedTools([...selectedTools, toolId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !codeName.trim()) return;

    onCreateAgent({
      name: name.trim(),
      codeName: codeName.trim().toLowerCase().replace(/\s+/g, '_'),
      description: description.trim() || '企業級獨立微服務 Agent 模組',
      primaryModel,
      teamOwner,
      status,
      assignedTools: selectedTools,
      virtualKeyId,
      systemPrompt: systemPrompt.trim() || '你是一位具備審計與高階決策能力的企業 Agent。',
      guardrailsEnabled,
    });

    setName('');
    setCodeName('');
    setDescription('');
    setSystemPrompt('');
    setSelectedTools([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">手動註冊全新 Agent (Agent Registry)</h3>
            <p className="text-xs text-slate-400">將外部微服務、Python LangChain/LlamaIndex 或獨立 API Agent 登記至平台統一管理</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Agent 名稱 *</label>
              <input
                type="text"
                required
                placeholder="例如：全球跨境合規對帳 Agent"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!codeName) {
                    setCodeName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">識別 Code Name *</label>
              <input
                type="text"
                required
                placeholder="crossborder_compliance_agent"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">主要路由 LLM 模型</label>
              <select
                value={primaryModel}
                onChange={(e) => setPrimaryModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="gemini-3.6-flash">Gemini 3.6 Flash (預設高優速度)</option>
                <option value="gemini-3.1-pro">Gemini 3.1 Pro (高階推理)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gpt-4o">GPT-4o Enterprise</option>
                <option value="deepseek-r1">DeepSeek R1 Reasoner</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">歸屬團隊 (Team Owner)</label>
              <input
                type="text"
                value={teamOwner}
                onChange={(e) => setTeamOwner(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">部署狀態</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="deployed">已上線部署 (Deployed)</option>
                <option value="staging">預發布測試 (Staging)</option>
                <option value="deprecated">已下線 (Deprecated)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Agent 職責與描述</label>
            <textarea
              rows={2}
              placeholder="說明此 Agent 的核心功能與作業範圍..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">System Prompt 角色引導詞</label>
            <textarea
              rows={3}
              placeholder="例如：你是一位專注於金融交易風險審查的 AI Agent..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">綁定配額虛擬金鑰 (Virtual Key)</label>
              <select
                value={virtualKeyId}
                onChange={(e) => setVirtualKeyId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              >
                {virtualKeys.map((vk) => (
                  <option key={vk.id} value={vk.id}>
                    {vk.name} ({vk.keyPrefix}...) - ${vk.budgetLimitMonthly}/月
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardrailsEnabled}
                  onChange={(e) => setGuardrailsEnabled(e.target.checked)}
                  className="rounded border-slate-800 text-blue-600 focus:ring-0"
                />
                <span className="text-slate-300 font-medium">啟用 Cedar/OPA 護欄與 PII 脫敏檢查</span>
              </label>
            </div>
          </div>

          {/* Tools selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
              <span>分配依賴的 MCP 工具 ({selectedTools.length} 個已選擇)</span>
              <span className="text-[10px] text-slate-400">授權此 Agent 調用的 MCP 工具列表</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-lg">
              {availableTools.map((t) => {
                const isChecked = selectedTools.includes(t.id);
                return (
                  <label
                    key={t.id}
                    onClick={() => handleToggleTool(t.id)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition ${
                      isChecked
                        ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <div className="truncate">
                      <span className="font-mono font-bold block truncate">{t.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{t.mcpServerName}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-900/40 flex items-center space-x-2"
            >
              <Bot className="w-4 h-4" />
              <span>確認註冊 Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
