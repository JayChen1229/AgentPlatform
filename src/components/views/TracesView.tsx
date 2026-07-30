import React, { useState } from 'react';
import { Trace, Span } from '../../types';
import { formatCurrency, formatTokens, formatLatency, formatDate } from '../../lib/formatters';
import { 
  Activity, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  DollarSign, 
  Zap, 
  Code, 
  Sparkles,
  Bot,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';

interface TracesViewProps {
  traces: Trace[];
}

export const TracesView: React.FC<TracesViewProps> = ({ traces }) => {
  const [selectedTraceId, setSelectedTraceId] = useState<string>(traces[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error' | 'warning'>('all');
  const [expandedSpanIds, setExpandedSpanIds] = useState<Record<string, boolean>>({ 'sp-root-1': true, 'sp-root-2': true });

  const filteredTraces = traces.filter((t) => {
    const matchesSearch = t.userPrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTrace = traces.find((t) => t.id === selectedTraceId) || traces[0];

  const toggleSpanExpand = (spanId: string) => {
    setExpandedSpanIds((prev) => ({ ...prev, [spanId]: !prev[spanId] }));
  };

  const renderSpanNode = (span: Span, depth: number = 0) => {
    const hasChildren = span.children && span.children.length > 0;
    const isExpanded = expandedSpanIds[span.id] !== false;

    const getIcon = (type: Span['type']) => {
      switch (type) {
        case 'agent': return <Bot className="w-4 h-4 text-blue-400" />;
        case 'llm': return <Sparkles className="w-4 h-4 text-purple-400" />;
        case 'mcp_tool': return <Cpu className="w-4 h-4 text-amber-400" />;
        case 'guardrail': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
        default: return <Layers className="w-4 h-4 text-slate-400" />;
      }
    };

    return (
      <div key={span.id} className="space-y-1">
        <div 
          onClick={() => hasChildren && toggleSpanExpand(span.id)}
          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
            hasChildren ? 'hover:bg-slate-800/80' : ''
          } bg-slate-900 border-slate-800`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            {hasChildren && (
              <span className="text-slate-400">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            )}
            {getIcon(span.type)}
            <span className="font-semibold text-slate-200 truncate">{span.name}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-800 text-slate-400 uppercase">
              {span.type}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] shrink-0">
            <span className="text-slate-400">{formatLatency(span.durationMs)}</span>
            {span.tokensPrompt > 0 && (
              <span className="text-purple-300">{formatTokens(span.tokensPrompt + span.tokensCompletion)} tok</span>
            )}
            <span className="text-emerald-400">{formatCurrency(span.cost)}</span>
            <span className={`w-2 h-2 rounded-full ${span.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1 border-l border-slate-800/80 pl-2">
            {span.children!.map((child) => renderSpanNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const statusLabels: Record<string, string> = {
    all: '全部',
    success: '成功',
    error: '錯誤',
    warning: '警告',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>對標：LANGFUSE V3 追蹤引擎 (OTEL 規範)</span>
            </div>
            <h1 className="text-2xl font-black text-white">可觀測性與多步驟追蹤樹</h1>
            <p className="text-slate-400 text-sm mt-1">
              深入檢視 Token 消耗拆解、延遲瀑布圖、工具調用鏈、輸入與輸出 Prompt，以及安全護欄的 Span 詳情。
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3 bg-slate-950/80 border border-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-slate-400 text-[10px]">Langfuse v3 狀態</div>
              <div className="text-emerald-400 font-bold">100% 追蹤涵蓋率</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋 Prompt、Agent、追蹤 ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">狀態過濾：</span>
          {(['all', 'success', 'error', 'warning'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {statusLabels[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Screen: Trace List + Trace Detail Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[650px]">
          <div className="p-3 bg-slate-800/60 border-b border-slate-800 font-mono text-xs text-slate-400 flex items-center justify-between">
            <span>執行紀錄 ({filteredTraces.length})</span>
            <span>排序：最新優先</span>
          </div>

          <div className="divide-y divide-slate-800/80 overflow-y-auto flex-1">
            {filteredTraces.map((t) => {
              const isSelected = t.id === selectedTraceId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTraceId(t.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/50 border-l-4 border-l-indigo-500 text-white'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-indigo-400">{t.id}</span>
                    <span className="text-slate-500 text-[11px]">{formatDate(t.timestamp)}</span>
                  </div>

                  <div className="font-semibold text-sm text-slate-100 line-clamp-1 mb-1">
                    {t.name}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 italic mb-2">
                    "{t.userPrompt}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400">{t.agentName}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-purple-300">{formatTokens(t.totalTokens)} tok</span>
                      <span className="text-emerald-400">{formatCurrency(t.totalCost)}</span>
                      <span className={t.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                        {t.status === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Trace DAG Tree & Prompt Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-[650px] overflow-y-auto space-y-6">
          {selectedTrace ? (
            <>
              {/* Selected Trace Summary */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 font-bold">{selectedTrace.id}</span>
                    <h2 className="text-lg font-bold text-white">{selectedTrace.name}</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedTrace.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono py-1">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">耗時</span>
                    <span className="text-slate-200 font-bold">{formatLatency(selectedTrace.totalDurationMs)}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Token 總數</span>
                    <span className="text-purple-300 font-bold">{formatTokens(selectedTrace.totalTokens)}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">預估成本</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(selectedTrace.totalCost)}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Session ID</span>
                    <span className="text-slate-300 font-bold text-[10px] truncate block">{selectedTrace.sessionId}</span>
                  </div>
                </div>
              </div>

              {/* Multi-Step Span Tree (Langfuse Tree Visualizer) */}
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Langfuse 多步驟 Span 有向無環圖 (DAG)</span>
                </h3>
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
                  {renderSpanNode(selectedTrace.rootSpan)}
                </div>
              </div>

              {/* Input Prompt vs Output Response */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-400 mb-1">使用者 Prompt 輸入</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono whitespace-pre-wrap">
                    {selectedTrace.userPrompt}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-emerald-400 mb-1">Agent 最終回答產出</label>
                  <div className="bg-slate-950 border border-emerald-900/50 rounded-lg p-3 text-xs text-slate-200 font-mono whitespace-pre-wrap">
                    {selectedTrace.finalResponse}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              請從左側清單選擇一筆追蹤紀錄，以檢視詳細的 DAG Span 結構。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
