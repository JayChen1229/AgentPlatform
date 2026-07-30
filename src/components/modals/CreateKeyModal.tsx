import React, { useState } from 'react';
import { X, KeyRound, DollarSign, Shield, Zap } from 'lucide-react';

interface CreateKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (keyData: {
    name: string;
    team: string;
    budgetLimitMonthly: number;
    rpmLimit: number;
    tpmLimit: number;
    allowedModels: string[];
    fallbackModels: string[];
  }) => void;
}

export const CreateKeyModal: React.FC<CreateKeyModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('金融工程團隊');
  const [budget, setBudget] = useState(1000);
  const [rpm, setRpm] = useState(500);
  const [tpm, setTpm] = useState(200000);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini-3.6-flash', 'gemini-3.1-pro-preview']);

  if (!isOpen) return null;

  const availableModels = [
    { id: 'gemini-3.6-flash', name: 'Google Gemini 3.6 Flash (極速推導)' },
    { id: 'gemini-3.1-pro-preview', name: 'Google Gemini 3.1 Pro (深度推理)' },
    { id: 'gpt-4o', name: 'OpenAI GPT-4o' },
    { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini' },
    { id: 'claude-3-5-sonnet', name: 'Anthropic Claude 3.5 Sonnet' },
    { id: 'deepseek-r1', name: 'DeepSeek R1 Reasoner' },
  ];

  const handleToggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(m => m !== modelId));
      }
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      team,
      budgetLimitMonthly: Number(budget),
      rpmLimit: Number(rpm),
      tpmLimit: Number(tpm),
      allowedModels: selectedModels,
      fallbackModels: selectedModels.slice(0, 1),
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">簽發全新虛擬 API 金鑰</h3>
            <p className="text-xs text-slate-400">LiteLLM 代理金鑰隔離與速率限制規範</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">金鑰識別名稱 (Key Name)</label>
            <input
              type="text"
              required
              placeholder="例如：金融科技客服 Agent 金鑰"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">歸屬團隊 (Owner Team)</label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="金融工程團隊">金融工程團隊</option>
                <option value="客戶成功團隊">客戶成功團隊</option>
                <option value="資安維運與合規團隊">資安維運與合規團隊</option>
                <option value="研發實驗室">研發實驗室</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">每月預算上限 ($)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">RPM 速率限制 (Req/Min)</label>
              <input
                type="number"
                min="10"
                step="50"
                value={rpm}
                onChange={(e) => setRpm(Number(e.target.value))}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">TPM 速率限制 (Tokens/Min)</label>
              <input
                type="number"
                min="10000"
                step="50000"
                value={tpm}
                onChange={(e) => setTpm(Number(e.target.value))}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">允許調用的模型</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {availableModels.map((m) => {
                const isSelected = selectedModels.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleToggleModel(m.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-900/40 border-blue-500/60 text-blue-200'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{m.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/30 flex items-center space-x-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>確認簽發虛擬金鑰</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
