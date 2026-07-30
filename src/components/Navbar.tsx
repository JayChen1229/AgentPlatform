import React from 'react';
import { ActiveTab } from '../types';
import { 
  Network, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  BarChart3, 
  Sparkles,
  Zap,
  Globe,
  KeyRound,
  Workflow
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tracesCount: number;
  activeKeysCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  tracesCount,
  activeKeysCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number; benchmark: string; isOpenSource: boolean; category: 'build' | 'govern' }[] = [
    { id: 'builder', label: '視覺化建構器 (Flow)', icon: Workflow, badge: 'Low-Code', benchmark: 'Langflow / Dify', isOpenSource: true, category: 'build' },
    { id: 'gateway', label: '網關與路由', icon: Network, badge: activeKeysCount, benchmark: 'LiteLLM / Portkey', isOpenSource: true, category: 'govern' },
    { id: 'traces', label: '可觀測性與追蹤', icon: Activity, badge: tracesCount, benchmark: 'Langfuse v3', isOpenSource: true, category: 'govern' },
    { id: 'registry', label: 'Agent 與工具註冊表', icon: Cpu, benchmark: 'TrueFoundry / AgentCore', isOpenSource: false, category: 'govern' },
    { id: 'policy', label: '策略與權限治理', icon: ShieldCheck, badge: '21 權限點', benchmark: 'Cedar-OPA / Loom', isOpenSource: false, category: 'govern' },
    { id: 'playground', label: 'Agent 測試場', icon: Terminal, benchmark: 'LangSmith / Portkey', isOpenSource: false, category: 'govern' },
    { id: 'analytics', label: '成本與數據分析', icon: BarChart3, benchmark: 'Langfuse / Portkey', isOpenSource: true, category: 'govern' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner & Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-800/80 gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1 rounded-md text-white font-semibold shadow-inner">
            <Sparkles className="w-4 h-4" />
            <span className="tracking-wide">企業級 AGENT 核心平台</span>
          </div>
          <span className="text-slate-400 font-mono hidden sm:inline-block">v3.8.0-prod</span>
          <div className="h-3 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px]">LiteLLM + Langflow + AgentCore 運行中</span>
          </div>
          <div className="flex items-center space-x-1.5 text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-full hidden md:flex">
            <Globe className="w-3 h-3 text-indigo-400" />
            <span className="font-medium text-[11px]">Dify / Langflow 視覺化建構 + Langfuse 追蹤雙管道</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-400">
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>虛擬金鑰：<strong className="text-slate-200">{activeKeysCount} 個啟用中</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>代理延遲：<strong className="text-slate-200">18ms</strong></span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {/* Build Section Badge */}
          <div className="flex items-center space-x-1 px-1.5 py-1 text-[10px] uppercase font-mono tracking-wider text-purple-400 bg-purple-950/50 border border-purple-800/60 rounded hidden md:flex shrink-0">
            <span>Build 開發面</span>
          </div>

          {tabs.filter(t => t.category === 'build').map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-button-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap group relative border ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-lg shadow-purple-900/40 font-semibold ring-2 ring-purple-400/30'
                    : 'bg-purple-950/30 border-purple-900/60 text-purple-200 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-300 group-hover:text-purple-200'}`} />
                <span>{tab.label}</span>

                {tab.badge !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded font-bold ${
                    isActive ? 'bg-purple-800 text-purple-100' : 'bg-purple-900/80 text-purple-200 border border-purple-700/50'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="h-6 w-px bg-slate-800 shrink-0 mx-1 hidden md:block" />

          {/* Govern Section Badge */}
          <div className="flex items-center space-x-1 px-1.5 py-1 text-[10px] uppercase font-mono tracking-wider text-blue-400 bg-blue-950/50 border border-blue-800/60 rounded hidden md:flex shrink-0">
            <span>Govern 治理面</span>
          </div>

          {tabs.filter(t => t.category === 'govern').map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-button-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span>{tab.label}</span>

                {tab.badge !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded-full font-bold ${
                    isActive ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}

                {/* Benchmark Tag & Open Source Badge */}
                <div className="ml-1 flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  {tab.isOpenSource && (
                    <span className="text-[9px] bg-emerald-900/90 text-emerald-200 px-1 rounded border border-emerald-700 font-semibold hidden xl:inline-block">
                      開源
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

