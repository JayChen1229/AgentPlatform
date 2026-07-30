import React from 'react';
import { ModelProvider, VirtualKey, FallbackRule } from '../../types';
import { formatCurrency, formatTokens } from '../../lib/formatters';
import { 
  Network, 
  KeyRound, 
  ArrowRightLeft, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface GatewayViewProps {
  providers: ModelProvider[];
  virtualKeys: VirtualKey[];
  fallbackRules: FallbackRule[];
  onOpenCreateKeyModal: () => void;
  onDeleteKey: (keyId: string) => void;
}

export const GatewayView: React.FC<GatewayViewProps> = ({
  providers,
  virtualKeys,
  fallbackRules,
  onOpenCreateKeyModal,
  onDeleteKey,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-mono text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>對標：LITELLM 管理介面與 PORTKEY 路由配置器</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">模型路由與網關治理</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              透過統一的 LiteLLM 代理層管理虛擬金鑰、各團隊預算上限、速率限制 (RPM/TPM)、模型降級備援以及多模型提供者負載平衡。
            </p>
          </div>
          <button
            id="button-mint-virtual-key"
            onClick={onOpenCreateKeyModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-blue-900/40 transition-all flex items-center space-x-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>簽發虛擬金鑰</span>
          </button>
        </div>
      </div>

      {/* 1. Model Provider Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>上游 AI 模型提供者</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">已整合 {providers.length} 家提供者</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-blue-400 text-lg">
                    {provider.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">
                      {provider.name}
                    </h3>
                    <p className="font-mono text-[11px] text-slate-400">{provider.apiKeyMasked}</p>
                  </div>
                </div>

                <div className={`px-2 py-0.5 text-[11px] font-semibold rounded-full flex items-center space-x-1 ${
                  provider.status === 'active'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${provider.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{provider.status === 'active' ? '運作正常' : '性能下降'}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">平均延遲</span>
                  <span className="font-mono text-slate-200 font-medium">{provider.latencyMs}ms</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">可用模型數量</span>
                  <span className="font-mono text-slate-200 font-medium">{provider.modelsCount} 個模型</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Virtual Keys Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            <span>虛擬 API 金鑰與團隊隔離</span>
          </h2>
          <span className="text-xs text-slate-400">LiteLLM 代理 Token 計費與配額</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs font-mono uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">虛擬金鑰名稱</th>
                  <th className="px-4 py-3.5">歸屬團隊</th>
                  <th className="px-4 py-3.5">每月支出 / 預算</th>
                  <th className="px-4 py-3.5">速率限制 (RPM / TPM)</th>
                  <th className="px-4 py-3.5">允許呼叫模型</th>
                  <th className="px-4 py-3.5">狀態</th>
                  <th className="px-4 py-3.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {virtualKeys.map((vk) => {
                  const spendPercent = Math.min(100, (vk.budgetSpentCurrent / vk.budgetLimitMonthly) * 100);
                  const isOverBudget = vk.budgetSpentCurrent >= vk.budgetLimitMonthly;

                  return (
                    <tr key={vk.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">{vk.name}</div>
                        <div className="font-mono text-[11px] text-amber-400/90">{vk.keyPrefix}...</div>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-300 text-xs">{vk.team}</td>
                      <td className="px-4 py-4 min-w-[180px]">
                        <div className="flex items-center justify-between text-xs font-mono mb-1">
                          <span className={isOverBudget ? 'text-red-400 font-bold' : 'text-slate-200'}>
                            {formatCurrency(vk.budgetSpentCurrent)}
                          </span>
                          <span className="text-slate-500">/ {formatCurrency(vk.budgetLimitMonthly)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              spendPercent > 90 ? 'bg-red-500' : spendPercent > 75 ? 'bg-amber-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${spendPercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">
                        <div className="text-slate-200">{vk.rpmLimit} RPM</div>
                        <div className="text-slate-500 text-[11px]">{formatTokens(vk.tpmLimit)} TPM</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {vk.allowedModels.map((m) => (
                            <span key={m} className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${
                          vk.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${vk.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <span>{vk.status === 'active' ? '已啟用' : '已超額'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => onDeleteKey(vk.id)}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                          title="撤銷虛擬金鑰"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Fallback & Failover Rules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            <span>模型自動降級備援與故障轉移鏈</span>
          </h2>
          <span className="text-xs text-slate-400">Portkey 路由器格式</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fallbackRules.map((fb) => (
            <div key={fb.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-mono font-bold text-indigo-400">{fb.id}</span>
                <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                  允許重試 {fb.retryAttempts} 次
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">首選目標模型</span>
                <div className="font-mono text-sm font-semibold text-white bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
                  {fb.primaryModel}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">降級故障轉移鏈</span>
                <div className="space-y-1">
                  {fb.fallbackModels.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs font-mono text-slate-300 bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
                      <span className="text-indigo-400 text-[10px]">#{i + 1}</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>觸發 HTTP 狀態碼：</span>
                <span className="font-mono text-amber-400 font-bold">{fb.triggerOnStatusCodes.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
