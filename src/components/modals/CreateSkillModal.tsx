import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Code, Wrench, ShieldCheck } from 'lucide-react';
import { AgentSkill, Tool } from '../../types';

interface CreateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTools: Tool[];
  onCreateSkill: (skill: Omit<AgentSkill, 'id' | 'usageCount' | 'updatedAt'>) => void;
}

export const CreateSkillModal: React.FC<CreateSkillModalProps> = ({
  isOpen,
  onClose,
  availableTools,
  onCreateSkill,
}) => {
  const [name, setName] = useState('');
  const [codeName, setCodeName] = useState('');
  const [category, setCategory] = useState<AgentSkill['category']>('code_execution');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0.0');
  const [author, setAuthor] = useState('Enterprise AI Architect');
  const [systemPromptInstruction, setSystemPromptInstruction] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [paramTimeout, setParamTimeout] = useState('30');

  const [submitted, setSubmitted] = useState(false);

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

    onCreateSkill({
      name: name.trim(),
      codeName: codeName.trim().toLowerCase().replace(/\s+/g, '_'),
      category,
      description: description.trim() || '自訂企業級 Agent 擴充技能 Package',
      version: version.trim() || 'v1.0.0',
      author: author.trim() || 'Internal AI Team',
      systemPromptInstruction: systemPromptInstruction.trim() || '當調用此 Skill 時，遵照對應模組進行邏輯推理與工具執行。',
      requiredTools: selectedTools,
      parametersSchema: {
        timeout_seconds: parseInt(paramTimeout) || 30,
        mode: 'enforced_sandbox',
      },
      enabled: true,
      reviewStatus: 'pending_review',
    });

    setSubmitted(true);
  };

  const handleFinishClose = () => {
    setSubmitted(false);
    setName('');
    setCodeName('');
    setDescription('');
    setSystemPromptInstruction('');
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
          <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">註冊全新 Agent Skill 擴充模組</h3>
            <p className="text-xs text-slate-400">封裝專屬 Prompt 指令集、必備 MCP 工具與 Schema 參數至 Skill Package</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-950/80 border border-amber-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">已提交審核，將於審核通過後上線</h4>
              <p className="text-xs text-slate-400 mt-1">目前 Agent Skill 狀態為<span className="text-amber-400 font-bold">「待審核 (Pending Review)」</span>，已自動加入治理團隊審核佇列。</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs font-mono space-y-1 text-slate-300 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Skill 名稱:</span>
                <span className="font-bold text-white">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Code Name:</span>
                <span className="text-purple-300">{codeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">審核進度:</span>
                <span className="text-amber-400">等待審核者核准權限點與 SOP</span>
              </div>
            </div>
            <button
              onClick={handleFinishClose}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shadow-lg transition"
            >
              完成並返回技能庫
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Skill 展示名稱 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：發票憑證自動核對 Skill"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!codeName) {
                      setCodeName(e.target.value.toLowerCase().replace(/[^a-z0-0_]/g, '_'));
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">系統識別代號 (Code Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="invoice_audit_skill"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">技能分類</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="code_execution">代碼沙盒執行 (Code Exec)</option>
                  <option value="financial_audit">金融與審計 (FinOps)</option>
                  <option value="data_processing">數據分析與清洗 (Data)</option>
                  <option value="security">合規與安全防護 (Security)</option>
                  <option value="web_search">網路搜尋與抓取 (Search)</option>
                  <option value="communication">通訊與頻道通知 (Comm)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">版本號</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">維護團隊 / 作者</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">技能描述</label>
              <textarea
                rows={2}
                placeholder="說明此 Skill 的核心能力、適用場景與限制..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Skill System Prompt 系統引導指令</label>
              <textarea
                rows={3}
                placeholder="例如：當調用此技能時，必須遵守以下標準作業流程 (SOP)..."
                value={systemPromptInstruction}
                onChange={(e) => setSystemPromptInstruction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Bound MCP Tools Selection */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
                <span>依賴的 MCP 工具綁定 ({selectedTools.length} 個已選擇)</span>
                <span className="text-[10px] text-slate-400">當載入此 Skill 時自動掛載對應工具</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-lg">
                {availableTools.map((t) => {
                  const isChecked = selectedTools.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      onClick={() => handleToggleTool(t.id)}
                      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition ${
                        isChecked
                          ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-purple-600 focus:ring-0"
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/40 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>確認註冊 Agent Skill</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
