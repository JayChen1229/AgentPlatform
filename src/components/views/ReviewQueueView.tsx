import React, { useState } from 'react';
import { Agent, AgentSkill, BatchAuthRequest, MCPServer, ReviewableItemType, ReviewStatus, Tool } from '../../types';
import { formatLatency } from '../../lib/formatters';
import {
  ClipboardCheck,
  Search,
  Bot,
  Sparkles,
  Server,
  Wrench,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  User,
  ShieldCheck,
  Code,
  AlertTriangle,
  Filter,
  History,
  ChevronRight,
  Lock,
  Zap,
  Layers,
} from 'lucide-react';

interface ReviewQueueViewProps {
  agents: Agent[];
  skills: AgentSkill[];
  mcpServers: MCPServer[];
  tools: Tool[];
  batchAuthRequests?: BatchAuthRequest[];
  currentUser: string;
  onApprove: (itemType: ReviewableItemType, itemId: string) => void;
  onReject: (itemType: ReviewableItemType, itemId: string, comment: string) => void;
  onRequestChanges: (itemType: ReviewableItemType, itemId: string, comment: string) => void;
}

type QueueTab = 'pending' | 'history';
type FilterType = 'all' | ReviewableItemType;

interface QueueItem {
  id: string;
  name: string;
  description: string;
  itemType: ReviewableItemType;
  reviewStatus: ReviewStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  reviewAction?: string;
  changeReason?: string;
  version: number;
  refData: any;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  agents,
  skills,
  mcpServers,
  tools,
  batchAuthRequests = [],
  currentUser,
  onApprove,
  onReject,
  onRequestChanges,
}) => {
  const [queueTab, setQueueTab] = useState<QueueTab>('pending');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [changesComment, setChangesComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showChangesForm, setShowChangesForm] = useState(false);

  // Build unified queue items
  const buildQueueItems = (): QueueItem[] => {
    const items: QueueItem[] = [];

    agents.forEach((a) => {
      if (a.reviewRecord) {
        items.push({
          id: a.id, name: a.name, description: a.description,
          itemType: 'agent', reviewStatus: a.reviewStatus,
          submittedBy: a.reviewRecord.submittedBy, submittedAt: a.reviewRecord.submittedAt,
          reviewedBy: a.reviewRecord.reviewedBy, reviewedAt: a.reviewRecord.reviewedAt,
          reviewComment: a.reviewRecord.reviewComment, reviewAction: a.reviewRecord.reviewAction,
          version: a.reviewRecord.version, refData: a,
        });
      }
    });

    skills.forEach((s) => {
      if (s.reviewRecord) {
        items.push({
          id: s.id, name: s.name, description: s.description,
          itemType: 'skill', reviewStatus: s.reviewStatus,
          submittedBy: s.reviewRecord.submittedBy, submittedAt: s.reviewRecord.submittedAt,
          reviewedBy: s.reviewRecord.reviewedBy, reviewedAt: s.reviewRecord.reviewedAt,
          reviewComment: s.reviewRecord.reviewComment, reviewAction: s.reviewRecord.reviewAction,
          changeReason: s.reviewRecord.changeReason,
          version: s.reviewRecord.version, refData: s,
        });
      }
    });

    mcpServers.forEach((m) => {
      if (m.reviewRecord) {
        items.push({
          id: m.id, name: m.name, description: m.description,
          itemType: 'mcp_server', reviewStatus: m.reviewStatus,
          submittedBy: m.reviewRecord.submittedBy, submittedAt: m.reviewRecord.submittedAt,
          reviewedBy: m.reviewRecord.reviewedBy, reviewedAt: m.reviewRecord.reviewedAt,
          reviewComment: m.reviewRecord.reviewComment, reviewAction: m.reviewRecord.reviewAction,
          version: m.reviewRecord.version, refData: m,
        });
      }
    });

    tools.forEach((t) => {
      if (t.reviewRecord) {
        items.push({
          id: t.id, name: t.name, description: t.description,
          itemType: 'tool', reviewStatus: t.reviewStatus,
          submittedBy: t.reviewRecord.submittedBy, submittedAt: t.reviewRecord.submittedAt,
          reviewedBy: t.reviewRecord.reviewedBy, reviewedAt: t.reviewRecord.reviewedAt,
          reviewComment: t.reviewRecord.reviewComment, reviewAction: t.reviewRecord.reviewAction,
          changeReason: t.reviewRecord.changeReason,
          version: t.reviewRecord.version, refData: t,
        });
      }
    });

    batchAuthRequests.forEach((b) => {
      if (b.reviewRecord) {
        items.push({
          id: b.id, name: `[批次授權] ${b.flowName} → ${b.mcpServerName}`,
          description: `動態掛載整台 MCP 伺服器 (${b.mcpServerName}) 的 ${b.toolsIncluded.length} 個已核准工具`,
          itemType: 'mcp_batch_auth', reviewStatus: b.reviewStatus,
          submittedBy: b.reviewRecord.submittedBy, submittedAt: b.reviewRecord.submittedAt,
          reviewedBy: b.reviewRecord.reviewedBy, reviewedAt: b.reviewRecord.reviewedAt,
          reviewComment: b.reviewRecord.reviewComment, reviewAction: b.reviewRecord.reviewAction,
          changeReason: b.reviewRecord.changeReason,
          version: b.reviewRecord.version || 1, refData: b,
        });
      }
    });

    return items;
  };

  const allItems = buildQueueItems();
  const pendingItems = allItems.filter((i) => i.reviewStatus === 'pending_review');
  const historyItems = allItems.filter((i) => i.reviewStatus === 'approved' || i.reviewStatus === 'rejected');

  const displayItems = (queueTab === 'pending' ? pendingItems : historyItems)
    .filter((i) => filterType === 'all' || i.itemType === filterType)
    .filter((i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const selectedItem = allItems.find((i) => i.id === selectedItemId);

  const isSelfSubmitted = selectedItem && selectedItem.submittedBy.includes(currentUser.split(' ')[0]);

  const getTypeIcon = (type: ReviewableItemType) => {
    switch (type) {
      case 'agent': return <Bot className="w-4 h-4 text-blue-400" />;
      case 'skill': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'mcp_server': return <Server className="w-4 h-4 text-indigo-400" />;
      case 'tool': return <Wrench className="w-4 h-4 text-amber-400" />;
      case 'mcp_batch_auth': return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTypeLabel = (type: ReviewableItemType) => {
    switch (type) {
      case 'agent': return 'Agent';
      case 'skill': return 'Agent Skill';
      case 'mcp_server': return 'MCP 服務器';
      case 'tool': return 'MCP 工具';
      case 'mcp_batch_auth': return '批次授權';
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'draft': return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-slate-400 border border-slate-700">草稿</span>;
      case 'pending_review': return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-950 text-amber-400 border border-amber-800">待審核</span>;
      case 'approved': return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">已核准</span>;
      case 'rejected': return <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-red-950 text-red-400 border border-red-800">已退回</span>;
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  const handleApprove = () => {
    if (!selectedItem) return;
    onApprove(selectedItem.itemType, selectedItem.id);
    setSelectedItemId(null);
  };

  const handleReject = () => {
    if (!selectedItem || !rejectComment.trim()) return;
    onReject(selectedItem.itemType, selectedItem.id, rejectComment.trim());
    setRejectComment('');
    setShowRejectForm(false);
    setSelectedItemId(null);
  };

  const handleRequestChanges = () => {
    if (!selectedItem || !changesComment.trim()) return;
    onRequestChanges(selectedItem.itemType, selectedItem.id, changesComment.trim());
    setChangesComment('');
    setShowChangesForm(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs mb-1">
              <ClipboardCheck className="w-4 h-4" />
              <span>註冊審核治理 · AGENT / SKILL / MCP SERVER / TOOL / 批次授權 統一審核佇列</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">審核佇列 Pending Reviews</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              所有新註冊的 Agent、Skill、MCP 服務器與工具需經過審核通過後方可上線使用。審核者可核准、退回或要求補充說明。
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-amber-950/60 border border-amber-800 p-3 rounded-lg text-xs font-mono text-amber-200 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-amber-400 font-bold">{pendingItems.length} 項待審核</div>
                <div className="text-slate-400 text-[10px]">當前身份：{currentUser}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => { setQueueTab('pending'); setSelectedItemId(null); }}
            className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all ${
              queueTab === 'pending' ? 'bg-amber-600 text-white font-bold shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>待審核 ({pendingItems.length})</span>
          </button>
          <button
            onClick={() => { setQueueTab('history'); setSelectedItemId(null); }}
            className={`px-4 py-2 rounded-lg font-medium text-xs flex items-center space-x-2 transition-all ${
              queueTab === 'history' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>歷史記錄 ({historyItems.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {(['all', 'agent', 'skill', 'mcp_server', 'tool', 'mcp_batch_auth'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                filterType === f ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f === 'all' ? '全部' : getTypeLabel(f as ReviewableItemType)}
            </button>
          ))}
        </div>
      </div>

      {/* Main: Left List + Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜尋名稱、提交人或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {displayItems.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>{queueTab === 'pending' ? '目前沒有待審核的項目' : '沒有符合條件的歷史記錄'}</p>
              </div>
            )}

            {displayItems.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => { setSelectedItemId(item.id); setShowRejectForm(false); setShowChangesForm(false); }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg border ${
                        item.itemType === 'agent' ? 'bg-blue-900/40 border-blue-800/60' :
                        item.itemType === 'skill' ? 'bg-purple-900/40 border-purple-800/60' :
                        item.itemType === 'mcp_server' ? 'bg-indigo-900/40 border-indigo-800/60' :
                        'bg-amber-900/40 border-amber-800/60'
                      }`}>
                        {getTypeIcon(item.itemType)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white leading-tight">{item.name}</h3>
                        <span className="text-[10px] font-mono text-slate-500">{getTypeLabel(item.itemType)}</span>
                      </div>
                    </div>
                    {getStatusBadge(item.reviewStatus)}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{item.description}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/80">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{item.submittedBy.split('(')[0].trim()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.submittedAt)}</span>
                    </span>
                  </div>

                  {item.changeReason && (
                    <div className="mt-1.5 text-[10px] font-mono text-amber-400/80 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40">
                      {item.changeReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Review Detail Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          {selectedItem ? (
            <>
              {/* Item Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedItem.itemType)}
                    <span className="text-xs font-mono text-slate-400">{getTypeLabel(selectedItem.itemType)} · v{selectedItem.version}</span>
                  </div>
                  {getStatusBadge(selectedItem.reviewStatus)}
                </div>
                <h2 className="text-lg font-bold text-white">{selectedItem.name}</h2>
                <p className="text-xs text-slate-300 mt-1">{selectedItem.description}</p>
              </div>

              {/* Submission Info */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">提交人</span>
                  <span className="text-slate-200 font-bold">{selectedItem.submittedBy}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">提交時間</span>
                  <span className="text-slate-200 font-bold">{formatTime(selectedItem.submittedAt)}</span>
                </div>
              </div>

              {/* Connection info for MCP servers */}
              {selectedItem.itemType === 'mcp_server' && (() => {
                const srv = selectedItem.refData as MCPServer;
                return (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                      <Server className="w-3.5 h-3.5 text-indigo-400" />
                      <span>連線資訊摘要</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">端點 Endpoint</span>
                        <span className="text-indigo-300 font-bold text-[11px] break-all">{srv.endpoint}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">認證方式</span>
                        <span className="text-slate-200 font-bold flex items-center space-x-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>{srv.authType}</span>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">傳輸協定</span>
                        <span className="text-slate-200 font-bold">{srv.type}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">已發現工具數</span>
                        <span className="text-amber-400 font-bold">{srv.discoveredToolsCount ?? 0} 個</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Schema for Tools */}
              {selectedItem.itemType === 'tool' && (() => {
                const t = selectedItem.refData as Tool;
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">所屬 MCP 服務器</span>
                        <span className="text-slate-200 font-bold">{t.mcpServerName}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">所需權限點</span>
                        <span className="text-indigo-400 font-bold">{t.scopeRequired}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                        <Code className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Input Schema 結構圖</span>
                      </h4>
                      <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                        {JSON.stringify(t.inputSchema, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                        <Code className="w-3.5 h-3.5 text-purple-400" />
                        <span>Output Schema 結構圖</span>
                      </h4>
                      <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-purple-300 overflow-x-auto max-h-32">
                        {JSON.stringify(t.outputSchema, null, 2)}
                      </pre>
                    </div>
                  </div>
                );
              })()}

              {/* Skill details */}
              {selectedItem.itemType === 'skill' && (() => {
                const sk = selectedItem.refData as AgentSkill;
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">CodeName</span>
                        <span className="text-purple-300 font-bold">{sk.codeName}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">分類</span>
                        <span className="text-slate-200 font-bold">{sk.category}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1">System Prompt 注入指令</h4>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-purple-200 leading-relaxed">
                        "{sk.systemPromptInstruction}"
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1">Parameters Schema</h4>
                      <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-32">
                        {JSON.stringify(sk.parametersSchema, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1">依賴工具</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {sk.requiredTools.map((tId) => (
                          <span key={tId} className="px-2 py-0.5 bg-slate-950 text-indigo-300 border border-slate-800 rounded font-mono text-[10px]">
                            {tId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Agent details */}
              {selectedItem.itemType === 'agent' && (() => {
                const ag = selectedItem.refData as Agent;
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">主要模型</span>
                        <span className="text-blue-400 font-bold">{ag.primaryModel}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">所屬團隊</span>
                        <span className="text-slate-200 font-bold">{ag.teamOwner}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1">System Prompt</h4>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-blue-200 leading-relaxed">
                        "{ag.systemPrompt}"
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1">指派工具</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {ag.assignedTools.map((tId) => (
                          <span key={tId} className="px-2 py-0.5 bg-slate-950 text-indigo-300 border border-slate-800 rounded font-mono text-[10px]">
                            {tId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Batch Auth details */}
              {selectedItem.itemType === 'mcp_batch_auth' && (() => {
                const b = selectedItem.refData as BatchAuthRequest;
                return (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">申請 Flow / Agent</span>
                        <span className="text-amber-300 font-bold">{b.flowName}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">目標 MCP 服務器</span>
                        <span className="text-indigo-400 font-bold">{b.mcpServerName}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                        <Server className="w-3.5 h-3.5 text-amber-400" />
                        <span>批次開放授權的工具清單 ({b.toolsIncluded?.length || 0} 個)</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {b.toolsIncluded?.map((tName) => (
                          <span key={tName} className="px-2 py-1 bg-amber-950/60 text-amber-200 border border-amber-800 rounded font-mono text-[11px] font-bold">
                            {tName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>工具所需權限點聯集 (Union Scope Required)</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {b.unionScopesRequired?.map((sc) => (
                          <span key={sc} className="px-2 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded font-mono text-[11px]">
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Previous review comment (for rejected items) */}
              {selectedItem.reviewComment && (
                <div className={`p-3 rounded-lg border text-xs font-mono ${
                  selectedItem.reviewAction === 'reject'
                    ? 'bg-red-950/30 border-red-800/50 text-red-300'
                    : selectedItem.reviewAction === 'approve'
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                }`}>
                  <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span>審核意見 — {selectedItem.reviewedBy} ({selectedItem.reviewedAt ? formatTime(selectedItem.reviewedAt) : ''})</span>
                  </div>
                  <p>{selectedItem.reviewComment}</p>
                </div>
              )}

              {/* Action Buttons (only for pending items) */}
              {selectedItem.reviewStatus === 'pending_review' && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  {isSelfSubmitted && (
                    <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-2.5 text-xs text-amber-300 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>不可審核自己提交的項目（迴避原則）</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleApprove}
                      disabled={!!isSelfSubmitted}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-900/30 disabled:shadow-none"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>核准</span>
                    </button>
                    <button
                      onClick={() => { setShowRejectForm(!showRejectForm); setShowChangesForm(false); }}
                      disabled={!!isSelfSubmitted}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 transition shadow-lg shadow-red-900/30 disabled:shadow-none"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>退回</span>
                    </button>
                    <button
                      onClick={() => { setShowChangesForm(!showChangesForm); setShowRejectForm(false); }}
                      disabled={!!isSelfSubmitted}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm flex items-center justify-center space-x-1.5 transition shadow-lg shadow-amber-900/30 disabled:shadow-none"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>要求補充</span>
                    </button>
                  </div>

                  {showRejectForm && (
                    <div className="bg-red-950/20 border border-red-800/40 rounded-lg p-3 space-y-2">
                      <label className="text-xs font-semibold text-red-300">退回原因（必填）</label>
                      <textarea
                        rows={3}
                        value={rejectComment}
                        onChange={(e) => setRejectComment(e.target.value)}
                        placeholder="請說明退回此項目的原因..."
                        className="w-full bg-slate-950 border border-red-800/50 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                      <button
                        onClick={handleReject}
                        disabled={!rejectComment.trim()}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs transition"
                      >
                        確認退回
                      </button>
                    </div>
                  )}

                  {showChangesForm && (
                    <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3 space-y-2">
                      <label className="text-xs font-semibold text-amber-300">補充說明要求</label>
                      <textarea
                        rows={3}
                        value={changesComment}
                        onChange={(e) => setChangesComment(e.target.value)}
                        placeholder="請說明需要提交者補充的資訊..."
                        className="w-full bg-slate-950 border border-amber-800/50 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={handleRequestChanges}
                        disabled={!changesComment.trim()}
                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs transition"
                      >
                        送出補充要求
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">請從左側列表選擇一個項目</p>
              <p className="text-[11px] text-slate-600 mt-1">以檢視審核詳情並執行審核動作</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
