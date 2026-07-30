import React from 'react';
import { VirtualKey, Trace } from '../../types';
import { formatCurrency, formatTokens } from '../../lib/formatters';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Layers, 
  Users, 
  Sparkles,
  PieChart,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface AnalyticsViewProps {
  virtualKeys: VirtualKey[];
  traces: Trace[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ virtualKeys, traces }) => {
  const totalSpentMonthly = virtualKeys.reduce((acc, k) => acc + k.budgetSpentCurrent, 0);
  const totalTokensProcessed = traces.reduce((acc, t) => acc + t.totalTokens, 0);
  const totalCostTraces = traces.reduce((acc, t) => acc + t.totalCost, 0);
  const avgCostPerExecution = traces.length > 0 ? totalCostTraces / traces.length : 0;

  // Group cost by team
  const teamCosts: Record<string, { spent: number; budget: number }> = {};
  virtualKeys.forEach((k) => {
    if (!teamCosts[k.team]) {
      teamCosts[k.team] = { spent: 0, budget: 0 };
    }
    teamCosts[k.team].spent += k.budgetSpentCurrent;
    teamCosts[k.team].budget += k.budgetLimitMonthly;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>對標：LANGFUSE 成本分析儀與 PORTKEY 數據分析 dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-white">成本歸因與數據分析 Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              精確追蹤跨團隊的 LLM 支出歸因、Token 消耗趨勢、模型成本佔比以及預算警報觸發狀況。
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>每月總支出</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatCurrency(totalSpentMonthly)}</div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1 font-mono">
            <ArrowUpRight className="w-3 h-3" />
            <span>較上月增加 +12.4%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>總處理 Token 數</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatTokens(totalTokensProcessed)}</div>
          <div className="text-[11px] text-purple-300 font-mono">
            <span>平均 1,420 Token / 次調用</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>單次執行平均成本</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{formatCurrency(avgCostPerExecution)}</div>
          <div className="text-[11px] text-blue-300 font-mono">
            <span>Gemini 3.6 Flash 省下約 68% 成本</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>預算警報觸發</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">1 個團隊預算超額</div>
          <div className="text-[11px] text-slate-400 font-mono">
            <span>研發實驗室（已觸發硬性限制）</span>
          </div>
        </div>
      </div>

      {/* Team Cost Breakdown Bar Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>團隊層級成本歸因分析 (Team Cost Attribution)</span>
          </h2>

          <div className="space-y-4 pt-2">
            {Object.entries(teamCosts).map(([teamName, data]) => {
              const percent = Math.min(100, (data.spent / data.budget) * 100);
              const isOver = data.spent >= data.budget;

              return (
                <div key={teamName} className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-white">{teamName}</span>
                    <span className={isOver ? 'text-red-400 font-bold' : 'text-slate-400'}>
                      {formatCurrency(data.spent)} / {formatCurrency(data.budget)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        isOver ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Expenditure Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            <span>模型支出分佈占比 (Model Expenditure Split)</span>
          </h2>

          <div className="space-y-3 font-mono text-xs pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-slate-200">Google Gemini 3.6 Flash</span>
              </div>
              <span className="text-emerald-400 font-bold">$1,240.00 (48%)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-slate-200">Google Gemini 3.1 Pro Preview</span>
              </div>
              <span className="text-purple-300 font-bold">$890.50 (34%)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-200">OpenAI GPT-4o</span>
              </div>
              <span className="text-slate-300 font-bold">$460.00 (18%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
