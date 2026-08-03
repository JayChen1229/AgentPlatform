import React, { useState } from 'react';
import { 
  FlowNode, 
  FlowEdge, 
  KnowledgeBase, 
  FlowReleaseVersion, 
  Tool, 
  AgentSkill,
  Agent,
  Trace 
} from '../../types';
import { 
  Workflow, 
  Plus, 
  Trash2, 
  Play, 
  Database, 
  Cpu, 
  GitBranch, 
  FileText, 
  Send, 
  Zap, 
  CheckCircle2, 
  Code2, 
  Globe, 
  BookOpen, 
  Sparkles, 
  UploadCloud, 
  X, 
  Copy, 
  Layers,
  ArrowRight,
  RefreshCw,
  Sliders,
  ExternalLink,
  Save,
  Clock,
  ShieldCheck,
  ChevronRight,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Bot
} from 'lucide-react';

interface BuilderViewProps {
  nodes: FlowNode[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  edges: FlowEdge[];
  setEdges: React.Dispatch<React.SetStateAction<FlowEdge[]>>;
  knowledgeBases: KnowledgeBase[];
  setKnowledgeBases: React.Dispatch<React.SetStateAction<KnowledgeBase[]>>;
  releases: FlowReleaseVersion[];
  setReleases: React.Dispatch<React.SetStateAction<FlowReleaseVersion[]>>;
  tools: Tool[];
  skills: AgentSkill[];
  agents: Agent[];
  onRunTestFlow: (prompt: string, selectedNodeIds: string[]) => Promise<Trace | void>;
  onNavigateToTraces: () => void;
  onPublishAgentToRegistry?: (agent: Omit<Agent, 'id' | 'updatedAt'>) => void;
  onNavigateToRegistry?: () => void;
}

export const BuilderView: React.FC<BuilderViewProps> = ({
  nodes,
  setNodes,
  edges,
  setEdges,
  knowledgeBases,
  setKnowledgeBases,
  releases,
  setReleases,
  tools,
  skills,
  agents,
  onRunTestFlow,
  onNavigateToTraces,
  onPublishAgentToRegistry,
  onNavigateToRegistry,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-llm');
  const [draggedNodeIndex, setDraggedNodeIndex] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<'rag' | 'release' | 'test' | null>(null);

  // Helper to reorder nodes and automatically rebuild linear connection edges
  const handleReorderNodes = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= nodes.length || toIndex >= nodes.length) return;

    setNodes((prevNodes) => {
      const updated = [...prevNodes];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);

      // Rebuild edges based on new sequence
      const newEdges: FlowEdge[] = [];
      for (let i = 0; i < updated.length - 1; i++) {
        newEdges.push({
          id: `edge-reorder-${i}`,
          source: updated[i].id,
          target: updated[i + 1].id,
          label: i === 2 ? '分流 / 條件檢索' : undefined,
        });
      }
      setEdges(newEdges);

      return updated;
    });
  };

  const handleMoveNodeUp = (index: number) => {
    if (index > 0) handleReorderNodes(index, index - 1);
  };

  const handleMoveNodeDown = (index: number) => {
    if (index < nodes.length - 1) handleReorderNodes(index, index + 1);
  };
  
  // Test Runner State
  const [testPrompt, setTestPrompt] = useState<string>('請協助對帳 ACC-8821 並檢查是否有合規條款違規，必要時發送 Slack 通知。');
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [activeExecutingNodeId, setActiveExecutingNodeId] = useState<string | null>(null);
  const [testResultTrace, setTestResultTrace] = useState<Trace | null>(null);

  // New Knowledge Base Form State
  const [newKbName, setNewKbName] = useState('');
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [chunkOverlap, setChunkOverlap] = useState<number>(50);
  const [selectedEmbedding, setSelectedEmbedding] = useState('text-embedding-004');
  const [selectedVectorDb, setSelectedVectorDb] = useState('Qdrant Cloud');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(['SOC2_Security_Policy_v4.pdf', 'Finance_Ledger_Rules.docx']);

  // New Release Version Form State
  const [releaseVersion, setReleaseVersion] = useState('v1.3.0');
  const [releaseDesc, setReleaseDesc] = useState('新增 Cedar 策略驗證節點與微秒級全鏈路可觀測性標籤');
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Selected Node Object
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Helper to update node config
  const handleUpdateNodeConfig = (nodeId: string, updates: Partial<FlowNode['config']> | { label?: string }) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== nodeId) return n;
        if ('label' in updates && typeof updates.label === 'string') {
          return { ...n, label: updates.label, config: { ...n.config, ...updates } };
        }
        return { ...n, config: { ...n.config, ...updates } };
      })
    );
  };

  // Add new node to canvas
  const handleAddNode = (type: FlowNode['type']) => {
    const id = `node-${Date.now().toString().slice(-4)}`;
    const typeLabels: Record<FlowNode['type'], string> = {
      start: '觸發點 (Trigger)',
      llm: 'Gemini 3.6 Flash 推理',
      tool: 'MCP 工具調用',
      skill: 'Agent Skill 擴充包',
      agent: '子 Agent 嵌套調用 (Multi-Agent)',
      router: '條件分流 Router',
      rag: 'RAG 向量知識庫',
      prompt: 'Prompt 語意模版',
      output: '最終回應與 Trace 記錄',
    };

    const newNode: FlowNode = {
      id,
      type,
      label: typeLabels[type],
      x: 300 + Math.floor(Math.random() * 200),
      y: 150 + Math.floor(Math.random() * 150),
      config: type === 'llm' 
        ? { model: 'gemini-3.6-flash', temperature: 0.2, systemPrompt: '你是一位專業 Agent...' }
        : type === 'rag'
        ? { knowledgeBaseId: knowledgeBases[0]?.id, topK: 3 }
        : type === 'tool'
        ? { toolId: tools[0]?.id, toolName: tools[0]?.name }
        : type === 'skill'
        ? { skillId: skills[0]?.id, skillName: skills[0]?.name }
        : type === 'agent'
        ? { subAgentId: agents[0]?.id, subAgentName: agents[0]?.name }
        : {},
    };

    setNodes((prev) => [...prev, newNode]);
    
    // Auto-connect to last output node if exists
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      setEdges((prev) => [...prev, { id: `edge-${Date.now()}`, source: lastNode.id, target: id }]);
    }

    setSelectedNodeId(id);
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Run Embedded Test Flow Step-by-step
  const handleExecuteTest = async () => {
    setIsRunningTest(true);
    setTestResultTrace(null);

    // Simulate step-by-step node execution
    for (const node of nodes) {
      setActiveExecutingNodeId(node.id);
      await new Promise((r) => setTimeout(r, 400));
    }

    // Call real trace generation backend
    const trace = await onRunTestFlow(testPrompt, nodes.map((n) => n.id));
    if (trace) {
      setTestResultTrace(trace);
    }
    setActiveExecutingNodeId(null);
    setIsRunningTest(false);
  };

  // Create Knowledge Base
  const handleCreateKb = () => {
    if (!newKbName.trim()) return;
    const newKb: KnowledgeBase = {
      id: `kb-${Date.now().toString().slice(-3)}`,
      name: newKbName,
      documentsCount: uploadedFiles.length,
      totalChunks: uploadedFiles.length * 45,
      chunkSize,
      chunkOverlap,
      embeddingModel: selectedEmbedding,
      vectorDb: selectedVectorDb,
      updatedAt: new Date().toISOString().split('T')[0],
      sampleChunks: [
        `[${newKbName.toUpperCase()}-01] 切塊大小 ${chunkSize} Tokens，已建立索引至 ${selectedVectorDb}...`,
        `[${newKbName.toUpperCase()}-02] 使用 ${selectedEmbedding} 生成 768 維高維向量特徵...`,
      ],
    };
    setKnowledgeBases((prev) => [newKb, ...prev]);
    setNewKbName('');
  };

  // Publish New Version & Sync to Agent Registry
  const [publishedAgentSuccess, setPublishedAgentSuccess] = useState(false);

  const handlePublishRelease = () => {
    const newRel: FlowReleaseVersion = {
      id: `rel-${Date.now().toString().slice(-3)}`,
      version: releaseVersion,
      status: 'published',
      publishedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      publisher: 'Enterprise Builder Lead',
      description: releaseDesc,
      apiUrl: `https://ais-dev-avjdfwuq6esg46d2eujl2c-222795270304.asia-east1.run.app/api/v1/agents/finops-flow/run?v=${releaseVersion}`,
    };
    setReleases((prev) => [newRel, ...prev.map((r) => ({ ...r, status: 'archived' as const }))]);

    if (onPublishAgentToRegistry) {
      onPublishAgentToRegistry({
        name: `FinOps 畫布審計 Agent (${releaseVersion})`,
        codeName: `finops_flow_agent_${releaseVersion.replace(/\./g, '_')}`,
        description: `經由 Langflow/Dify 畫布視覺化編輯並發布的 Agent 流程 (版本: ${releaseVersion})。${releaseDesc}`,
        primaryModel: 'gemini-3.6-flash',
        teamOwner: 'FinTech Architecture Team',
        status: 'deployed',
        assignedTools: tools.slice(0, 3).map((t) => t.id),
        virtualKeyId: 'key-01',
        systemPrompt: '你是一位由 Langflow/Dify 視覺化畫布所建構與排程推導的企業級 Agent。',
        guardrailsEnabled: true,
      });
    }

    setPublishedAgentSuccess(true);
    setTimeout(() => setPublishedAgentSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-950 text-purple-300 border border-purple-800/80 px-2.5 py-0.5 rounded text-xs font-mono font-semibold">
              Build 視覺化建構器 (Langflow / Dify 標竿)
            </span>
            <span className="text-slate-400 text-xs font-mono">ID: flow-finops-auditor-v2</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1 flex items-center space-x-2">
            <Workflow className="w-5 h-5 text-purple-400" />
            <span>金融總帳異常審計與 Slack 警報 Flow</span>
            <span className="text-xs bg-emerald-900/80 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full font-normal">
              已同步至 Agent 註冊表
            </span>
          </h1>
        </div>

        {/* Builder Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveModal('rag')}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-xs font-medium transition"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>③ RAG / 知識庫設定 ({knowledgeBases.length})</span>
          </button>

          <button
            onClick={() => setActiveModal('release')}
            className="flex items-center space-x-1.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700 text-purple-100 px-3 py-2 rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Globe className="w-4 h-4 text-purple-300" />
            <span>④ 一鍵發布 / 版本 (v1.2.0)</span>
          </button>

          <button
            onClick={() => setActiveModal('test')}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-md shadow-blue-900/30"
          >
            <Play className="w-4 h-4 text-white fill-current" />
            <span>⑤ 內嵌測試與即時 Trace</span>
          </button>
        </div>
      </div>

      {/* Main Workbench: Left Node Palette + Center Interactive Grid + Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ① Node Palette (節點選單 - Left 3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>拖拉 / 新增節點</span>
            </h2>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              點擊直加
            </span>
          </div>

          <div className="space-y-2">
            {[
              { type: 'start' as const, label: '觸發點 (Start)', icon: Zap, color: 'text-amber-400 bg-amber-950/40 border-amber-800/60', desc: '接收 Prompt 或 Webhook 請求' },
              { type: 'rag' as const, label: 'RAG 知識庫', icon: Database, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60', desc: '語意向量與切塊特徵檢索' },
              { type: 'router' as const, label: '條件路由 (Router)', icon: GitBranch, color: 'text-blue-400 bg-blue-950/40 border-blue-800/60', desc: 'if/else 分流與意圖識別' },
              { type: 'llm' as const, label: 'LLM 推理 (Gemini)', icon: Cpu, color: 'text-purple-400 bg-purple-950/40 border-purple-800/60', desc: '模型思考、Prompt 變數對齊' },
              { type: 'agent' as const, label: '子 Agent 呼叫 (Multi-Agent)', icon: Bot, color: 'text-blue-300 bg-blue-950/60 border-blue-800/80', desc: '嵌套調用集群中現有的 Agent 微服務' },
              { type: 'skill' as const, label: 'Agent Skill 模組', icon: Sparkles, color: 'text-purple-300 bg-purple-950/60 border-purple-800/80', desc: '掛載代碼沙盒/審計等專屬 Skill SOP' },
              { type: 'tool' as const, label: 'MCP 工具 (Tool)', icon: Sliders, color: 'text-rose-400 bg-rose-950/40 border-rose-800/60', desc: '調用 Postgres、Slack 或 API' },
              { type: 'prompt' as const, label: 'Prompt 模版', icon: FileText, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60', desc: '組裝 Context 與帶入變數' },
              { type: 'output' as const, label: '最終輸出 (Output)', icon: Send, color: 'text-slate-300 bg-slate-800 border-slate-700', desc: '返回 JSON / 輸出及可觀測紀錄' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => handleAddNode(item.type)}
                  className={`w-full flex items-start space-x-3 p-2.5 rounded-lg border text-left transition hover:scale-[1.02] ${item.color}`}
                >
                  <div className="p-1.5 rounded-md bg-slate-900/80 border border-slate-800 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 flex items-center justify-between">
                      <span>{item.label}</span>
                      <Plus className="w-3 h-3 text-slate-400 opacity-60" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
              <span className="text-slate-400 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Langflow 畫布對標</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                節點之間可自動建立資料相依關係，即時將 Flow 編譯為 Langchain / LlamaIndex 兼容圖結構。
              </p>
            </div>
          </div>
        </div>

        {/* Center Blueprint Flow Node Canvas (6 cols) */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl relative min-h-[560px] overflow-hidden flex flex-col justify-between">
          
          {/* Blueprint Grid Canvas Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top Canvas Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-lg text-xs gap-2">
            <div className="flex items-center space-x-2 text-slate-300">
              <Workflow className="w-4 h-4 text-purple-400" />
              <span className="font-semibold">畫布節點數：{nodes.length} 個</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">連線數：{edges.length} 條</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-purple-300 font-mono bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
              <GripVertical className="w-3.5 h-3.5 text-purple-400" />
              <span>按住手把拖拉或點擊 ▲/▼ 箭頭可自由調整 Flow 執行順序</span>
            </div>
          </div>

          {/* Canvas Interactive Flow Nodes List */}
          <div className="relative z-10 my-6 space-y-3">
            {nodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              const isExecuting = activeExecutingNodeId === node.id;

              const typeBadge: Record<FlowNode['type'], { label: string; style: string }> = {
                start: { label: 'TRIGGER', style: 'bg-amber-950 text-amber-300 border-amber-800' },
                rag: { label: 'RAG', style: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
                router: { label: 'ROUTER', style: 'bg-blue-950 text-blue-300 border-blue-800' },
                llm: { label: 'LLM', style: 'bg-purple-950 text-purple-300 border-purple-800' },
                agent: { label: 'SUB-AGENT', style: 'bg-blue-950 text-blue-300 border-blue-800 shadow-sm' },
                skill: { label: 'AGENT SKILL', style: 'bg-purple-950 text-purple-300 border-purple-800 shadow-sm' },
                tool: { label: 'MCP TOOL', style: 'bg-rose-950 text-rose-300 border-rose-800' },
                prompt: { label: 'PROMPT', style: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
                output: { label: 'OUTPUT', style: 'bg-slate-800 text-slate-300 border-slate-700' },
              };

              return (
                <React.Fragment key={node.id}>
                  {/* Flow Edge Connection Indicator */}
                  {index > 0 && (
                    <div className="flex justify-center items-center py-0.5">
                      <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-full text-[10px] font-mono text-purple-300 shadow-sm">
                        <ArrowRight className="w-3 h-3 text-purple-400 animate-pulse" />
                        <span>傳輸 Context 變數 & Trace ID</span>
                      </div>
                    </div>
                  )}

                  {(() => {
                    const isNodeToolUnapproved = node.type === 'tool' && (() => {
                      const t = tools.find((tool) => tool.id === node.config.toolId);
                      return t && t.reviewStatus !== 'approved';
                    })();

                    return (
                      <div
                        draggable
                        onDragStart={(e) => {
                          setDraggedNodeIndex(index);
                          e.dataTransfer.setData('text/plain', index.toString());
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedNodeIndex !== null) {
                            handleReorderNodes(draggedNodeIndex, index);
                            setDraggedNodeIndex(null);
                          }
                        }}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all relative group ${
                          draggedNodeIndex === index ? 'opacity-40 border-dashed border-purple-400' : ''
                        } ${
                          isNodeToolUnapproved
                            ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                            : isExecuting
                            ? 'bg-purple-900/40 border-purple-400 ring-4 ring-purple-500/30 shadow-lg scale-[1.01]'
                            : isSelected
                            ? 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {/* Drag Handle Icon & Sequence Number */}
                            <div 
                              className="flex items-center space-x-1 text-slate-500 hover:text-purple-300 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-800"
                              title="按住拖曳調整 Flow 執行順序"
                            >
                              <GripVertical className="w-4 h-4" />
                              <span className="text-[11px] font-mono font-bold text-purple-400">#{index + 1}</span>
                            </div>

                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${typeBadge[node.type].style}`}>
                              {typeBadge[node.type].label}
                            </span>
                            <h3 className="text-sm font-bold text-slate-100">{node.label}</h3>

                            {isNodeToolUnapproved && (
                              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-900 text-amber-200 border border-amber-700 rounded-full flex items-center space-x-1 animate-pulse">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>工具已下架</span>
                              </span>
                            )}
                          </div>

                          {/* Reorder Action Controls & Delete */}
                          <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800/80">
                            {/* Move Up */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveNodeUp(index);
                              }}
                              disabled={index === 0}
                              className="p-1 rounded text-slate-400 hover:text-purple-300 hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition"
                              title="向上移一格"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveNodeDown(index);
                              }}
                              disabled={index === nodes.length - 1}
                              className="p-1 rounded text-slate-400 hover:text-purple-300 hover:bg-slate-800 disabled:opacity-20 disabled:hover:bg-transparent transition"
                              title="向下移一格"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-px h-3 bg-slate-800 my-0.5 mx-0.5" />

                            {isExecuting && (
                              <span className="flex items-center space-x-1 text-xs text-purple-300 font-mono animate-pulse px-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>執行中...</span>
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNode(node.id);
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition"
                              title="刪除節點"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Node Config Summary line */}
                    <div className="mt-2 text-xs text-slate-400 font-mono flex flex-wrap items-center gap-3 bg-slate-950/60 p-2 rounded border border-slate-800/60">
                      {node.type === 'llm' && (
                        <>
                          <span>模型: <strong className="text-purple-300">{node.config.model || 'gemini-3.6-flash'}</strong></span>
                          <span>Temp: <strong className="text-purple-300">{node.config.temperature ?? 0.2}</strong></span>
                        </>
                      )}
                      {node.type === 'rag' && (
                        <>
                          <span>知識庫: <strong className="text-emerald-300">{node.config.knowledgeBaseName || 'SOC2 規章庫'}</strong></span>
                          <span>TopK: <strong className="text-emerald-300">{node.config.topK ?? 3}</strong></span>
                        </>
                      )}
                      {node.type === 'tool' && (
                        <>
                          <span>綁定 MCP 工具: <strong className="text-rose-300">{node.config.toolName || 'slack_post_channel'}</strong></span>
                        </>
                      )}
                      {node.type === 'skill' && (
                        <>
                          <span>綁定 Agent Skill: <strong className="text-purple-300">{node.config.skillName || skills[0]?.name || 'FinOps 自動對帳 SOP'}</strong></span>
                        </>
                      )}
                      {node.type === 'agent' && (
                        <>
                          <span>嵌套子 Agent: <strong className="text-blue-300">{node.config.subAgentName || agents[0]?.name || '審計微服務 Agent'}</strong></span>
                        </>
                      )}
                      {node.type === 'router' && (
                        <span className="line-clamp-1">條件: <strong className="text-blue-300">{node.config.condition || 'Financial term check'}</strong></span>
                      )}
                      {node.type === 'start' && (
                        <span>Prompt 範本: <strong className="text-amber-300">{node.config.userPromptTemplate || '{{user_input}}'}</strong></span>
                      )}
                      {node.type === 'output' && (
                        <span>格式: <strong className="text-slate-200">JSON + Langfuse Trace</strong></span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </React.Fragment>
          );
        })}
          </div>

          {/* Canvas Bottom Bar */}
          <div className="relative z-10 flex items-center justify-between border-t border-slate-800 pt-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>節點語法驗證通過 (Cedar & LiteLLM Schema OK)</span>
            </span>
            <button
              onClick={handleExecuteTest}
              disabled={isRunningTest}
              className="text-xs bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/80 px-2.5 py-1 rounded transition flex items-center space-x-1"
            >
              <Play className="w-3 h-3 text-purple-300" />
              <span>試跑單次驗證</span>
            </button>
          </div>
        </div>

        {/* ② Node Property Inspector (右側屬性面板 - Right 3 cols - Dify/Langflow style) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>② 節點屬性設定</span>
            </h2>
            {selectedNode && (
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                {selectedNode.type.toUpperCase()}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              {/* Node Title Edit */}
              <div>
                <label className="block text-slate-400 mb-1 font-medium">節點顯示名稱</label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { label: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Specific Config Forms based on Node Type */}
              {selectedNode.type === 'llm' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">選擇推導模型 (LiteLLM 網關)</label>
                    <select
                      value={selectedNode.config.model || 'gemini-3.6-flash'}
                      onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { model: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                    >
                      <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (預設高優)</option>
                      <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (深度推理)</option>
                      <option value="gpt-4o">OpenAI GPT-4o (企業端點)</option>
                      <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                      <option value="ollama-llama3.3">Ollama Llama 3.3 (本地隱私集群)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">System Prompt 系統指令</label>
                    <textarea
                      rows={4}
                      value={selectedNode.config.systemPrompt || ''}
                      onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { systemPrompt: e.target.value })}
                      placeholder="輸入 Agent 系統提示詞..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Temperature (隨機度)</span>
                      <span className="font-mono text-purple-400">{selectedNode.config.temperature ?? 0.2}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={selectedNode.config.temperature ?? 0.2}
                      onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { temperature: parseFloat(e.target.value) })}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'rag' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">掛載向量知識庫 (RAG)</label>
                    <select
                      value={selectedNode.config.knowledgeBaseId || knowledgeBases[0]?.id}
                      onChange={(e) => {
                        const kb = knowledgeBases.find((k) => k.id === e.target.value);
                        handleUpdateNodeConfig(selectedNode.id, {
                          knowledgeBaseId: e.target.value,
                          knowledgeBaseName: kb?.name,
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      {knowledgeBases.map((kb) => (
                        <option key={kb.id} value={kb.id}>
                          {kb.name} ({kb.vectorDb})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Top-K 檢索切塊數量</span>
                      <span className="font-mono text-emerald-400">{selectedNode.config.topK ?? 3}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={selectedNode.config.topK ?? 3}
                      onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { topK: parseInt(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'tool' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">選擇工具 (僅限已核准工具)</label>
                    <select
                      value={selectedNode.config.toolId || (tools.find((t) => t.reviewStatus === 'approved')?.id || '')}
                      onChange={(e) => {
                        const t = tools.find((tool) => tool.id === e.target.value);
                        handleUpdateNodeConfig(selectedNode.id, {
                          toolId: e.target.value,
                          toolName: t?.name,
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-rose-500 text-xs font-mono"
                    >
                      {tools.filter((t) => t.reviewStatus === 'approved').map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.mcpServerName})
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const activeTool = tools.find((t) => t.id === (selectedNode.config.toolId || tools.find((tool) => tool.reviewStatus === 'approved')?.id));
                    if (!activeTool) return null;

                    const isUnapproved = activeTool.reviewStatus !== 'approved';
                    const hasPermission = activeTool.scopeRequired === 'mcp:tool:execute:slack' || activeTool.scopeRequired === 'mcp:tool:execute:db' || activeTool.scopeRequired === 'mcp:tool:execute:code' || activeTool.scopeRequired === 'data:read:pii';

                    // Available upstream variables for mapping
                    const upstreamNodes = nodes.filter((n) => n.id !== selectedNode.id);
                    const currentMappings = selectedNode.config.parameterMappings || [];

                    const handleMappingChange = (fieldName: string, sourceVar: string) => {
                      const updated = currentMappings.filter((m) => m.fieldName !== fieldName);
                      if (sourceVar) {
                        const [srcNodeId, srcVar] = sourceVar.split('::');
                        updated.push({ fieldName, sourceNodeId: srcNodeId || 'node-start', sourceVariable: srcVar || 'user_input' });
                      }
                      handleUpdateNodeConfig(selectedNode.id, { parameterMappings: updated });
                    };

                    return (
                      <div className="space-y-3 font-mono text-[11px]">
                        {/* Off shelf / unapproved warning */}
                        {isUnapproved && (
                          <div className="bg-amber-950/60 border border-amber-800 p-2.5 rounded-lg text-amber-300 space-y-1">
                            <div className="font-bold flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span>⚠️ 此工具已下架/待審核</span>
                            </div>
                            <p className="text-[10px] text-amber-400/80">治理團隊已暫停此工具，部署將被阻擋，請重新選擇已核准工具。</p>
                          </div>
                        )}

                        {/* Readonly Tool Info */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-500">所屬 MCP 服務器:</span>
                            <span className="text-rose-300 font-bold">{activeTool.mcpServerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">平均延遲:</span>
                            <span className="text-slate-200">{activeTool.avgLatencyMs} ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">所需權限點:</span>
                            <span className="text-indigo-400 font-bold">{activeTool.scopeRequired}</span>
                          </div>
                          {!hasPermission && (
                            <div className="mt-1 text-red-400 text-[10px] bg-red-950/50 p-1.5 rounded border border-red-800">
                              ⚠️ 此 Agent 身份缺少所需權限，無法上線
                            </div>
                          )}
                        </div>

                        {/* Readonly input schema preview */}
                        <div>
                          <label className="block text-slate-400 mb-1 font-medium">inputSchema 結構圖 (唯讀)</label>
                          <pre className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-32">
                            {JSON.stringify(activeTool.inputSchema, null, 2)}
                          </pre>
                        </div>

                        {/* Parameter Mapping Section */}
                        <div className="space-y-2 border-t border-slate-800 pt-2">
                          <label className="block text-slate-300 font-semibold text-xs flex items-center space-x-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                            <span>參數映射 (Upstream Variable Mapping)</span>
                          </label>
                          <p className="text-[10px] text-slate-400">對應上游節點的 Context 輸出變數至 inputSchema 欄位：</p>

                          {activeTool.inputSchema?.properties ? (
                            Object.keys(activeTool.inputSchema.properties).map((propName) => {
                              const propDef = activeTool.inputSchema.properties[propName];
                              const currentMap = currentMappings.find((m) => m.fieldName === propName);
                              const mapVal = currentMap ? `${currentMap.sourceNodeId}::${currentMap.sourceVariable}` : '';

                              return (
                                <div key={propName} className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-slate-200">{propName}</span>
                                    <span className="text-[10px] text-slate-500">({propDef.type || 'string'})</span>
                                  </div>
                                  <select
                                    value={mapVal}
                                    onChange={(e) => handleMappingChange(propName, e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[10px] text-purple-300 focus:outline-none focus:border-purple-500"
                                  >
                                    <option value="">-- 未映射 (使用預設值) --</option>
                                    <option value="node-start::user_input">#1 觸發點 ({{user_input}})</option>
                                    <option value="node-rag::retrieved_context">#2 RAG 知識庫 ({{retrieved_context}})</option>
                                    <option value="node-llm::generated_text">#4 Gemini LLM ({{generated_text}})</option>
                                  </select>
                                  {currentMap && (
                                    <div className="flex items-center space-x-1 text-[9px] text-emerald-400 pt-0.5">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>已映射至 &#123;&#123;{currentMap.sourceVariable}&#125;&#125;</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-[10px] text-slate-500">無可對應參數</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {selectedNode.type === 'skill' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">選擇 Agent Skill 模組 (僅限已核准技能 SOP)</label>
                    <select
                      value={selectedNode.config.skillId || (skills.find((s) => s.reviewStatus === 'approved')?.id || '')}
                      onChange={(e) => {
                        const sk = skills.find((s) => s.id === e.target.value);
                        handleUpdateNodeConfig(selectedNode.id, {
                          skillId: e.target.value,
                          skillName: sk?.name,
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                    >
                      {skills.filter((s) => s.reviewStatus === 'approved').map((sk) => (
                        <option key={sk.id} value={sk.id}>
                          {sk.name} ({sk.codeName})
                        </option>
                      ))}
                    </select>
                  </div>
                  {(() => {
                    const activeSkill = skills.find((s) => s.id === (selectedNode.config.skillId || skills[0]?.id));
                    if (!activeSkill) return null;
                    return (
                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-300">
                        <div className="text-purple-300 font-bold">{activeSkill.name}</div>
                        <div className="text-slate-400">{activeSkill.description}</div>
                        <div className="text-[10px] text-slate-500">內部 SOP: {activeSkill.promptSop}</div>
                        <div className="text-[10px] text-purple-400/80">包含工具: {activeSkill.tools.join(', ') || '無'}</div>
                      </div>
                    );
                  })()}
                </>
              )}

              {selectedNode.type === 'agent' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                      <span>選擇子 Agent (Multi-Agent Sub-Task)</span>
                      <span className="text-[10px] text-blue-400">嵌套多 Agent 協作</span>
                    </label>
                    <select
                      value={selectedNode.config.subAgentId || (agents.find((a) => a.reviewStatus === 'approved')?.id || '')}
                      onChange={(e) => {
                        const ag = agents.find((a) => a.id === e.target.value);
                        handleUpdateNodeConfig(selectedNode.id, {
                          subAgentId: e.target.value,
                          subAgentName: ag?.name,
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                    >
                      {agents.filter((a) => a.reviewStatus === 'approved').map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.codeName}) - {ag.primaryModel}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(() => {
                    const activeSubAgent = agents.find((a) => a.id === (selectedNode.config.subAgentId || agents[0]?.id));
                    if (!activeSubAgent) return null;
                    return (
                      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px] text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-blue-300 font-bold">{activeSubAgent.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[9px]">
                            {activeSubAgent.codeName}
                          </span>
                        </div>
                        <div className="text-slate-400">{activeSubAgent.description}</div>
                        <div className="text-[10px] text-slate-500">模型: {activeSubAgent.primaryModel} | 負責團隊: {activeSubAgent.teamOwner}</div>
                        <div className="text-[10px] text-indigo-400/90 italic bg-slate-900/80 p-1.5 rounded border border-slate-800">
                          System Prompt: "{activeSubAgent.systemPrompt}"
                        </div>
                        <div className="text-[10px] text-slate-400">
                          API Endpoint: <span className="text-indigo-300">/api/v1/agents/{activeSubAgent.codeName}/run</span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {selectedNode.type === 'router' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">條件表達式 (Condition Rule)</label>
                    <textarea
                      rows={3}
                      value={selectedNode.config.condition || ''}
                      onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { condition: e.target.value })}
                      placeholder="e.g. if is_urgent == true -> Node 3 else Node 4"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'start' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Input Prompt Template 範本</label>
                    <textarea
                      rows={3}
                      value={selectedNode.config.userPromptTemplate || '{{user_input}}'}
                      onChange={(e) => handleUpdateNodeConfig(selectedNode.id, { userPromptTemplate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => alert(`已成功儲存節點 [${selectedNode.label}] 參數設定`)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium py-2 rounded-lg transition flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-purple-400" />
                  <span>儲存節點參數</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Sliders className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p>請點擊中間畫布上的任意節點</p>
              <p className="text-[11px] text-slate-600 mt-1">即可調校右側屬性參數</p>
            </div>
          )}
        </div>
      </div>

      {/* ③ RAG / 知識庫設定 Modal (Dify Style Knowledge Base Setup) */}
      {activeModal === 'rag' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-6">
              <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">③ RAG / 知識庫與切塊設定 (Dify 對標)</h2>
                <p className="text-xs text-slate-400">上傳文件、向量 Embedding 轉換、Chunk 切塊重疊度與 Qdrant 儲存庫設定</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Create & Config KB */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-1">建立新向量知識庫</h3>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">知識庫名稱</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 金融合規與 SOC2 審計規章"
                    value={newKbName}
                    onChange={(e) => setNewKbName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Upload File Dropzone */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">上傳文檔 (PDF, DOCX, Markdown)</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950 rounded-xl p-4 text-center cursor-pointer transition">
                    <UploadCloud className="w-8 h-8 text-emerald-400 mx-auto mb-1 opacity-80" />
                    <p className="text-xs text-slate-300 font-medium">拖放檔案至此或點擊選取</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">自動進行文本清掃與語意切分</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800/80 text-slate-300 font-mono">
                        <span className="flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{file}</span>
                        </span>
                        <span className="text-emerald-400 text-[10px]">已建立索引 (45 Chunks)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chunk Strategy Settings */}
                <div className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>文本切塊 (Chunking) 策略</span>
                  </h4>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Chunk Size (切塊大小):</span>
                      <strong className="text-emerald-400 font-mono">{chunkSize} tokens</strong>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      step="50"
                      value={chunkSize}
                      onChange={(e) => setChunkSize(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Chunk Overlap (重疊率):</span>
                      <strong className="text-emerald-400 font-mono">{chunkOverlap} tokens</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={chunkOverlap}
                      onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-slate-400 block mb-1">Embedding 模型</label>
                      <select
                        value={selectedEmbedding}
                        onChange={(e) => setSelectedEmbedding(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      >
                        <option value="text-embedding-004">Google text-embedding-004</option>
                        <option value="text-embedding-3-small">OpenAI ada-002 / small</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">向量資料庫 Target</label>
                      <select
                        value={selectedVectorDb}
                        onChange={(e) => setSelectedVectorDb(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      >
                        <option value="Qdrant Cloud">Qdrant Cloud (極速)</option>
                        <option value="Pgvector (PostgreSQL)">Pgvector (Postgres)</option>
                        <option value="Pinecone">Pinecone Vector DB</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCreateKb}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增知識庫與向量建置</span>
                </button>
              </div>

              {/* Right Column: Existing KB List & Sample Chunk Preview */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-1">現有知識庫列表</h3>
                
                <div className="space-y-3">
                  {knowledgeBases.map((kb) => (
                    <div key={kb.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{kb.name}</span>
                        </h4>
                        <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                          {kb.vectorDb}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded">
                        <div>文件數: <span className="text-slate-200">{kb.documentsCount} 份</span></div>
                        <div>Chunks: <span className="text-slate-200">{kb.totalChunks} 塊</span></div>
                        <div>Overlap: <span className="text-slate-200">{kb.chunkOverlap}t</span></div>
                      </div>

                      {kb.sampleChunks && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] text-slate-500 font-semibold">切塊微預覽 (Sample Chunks):</span>
                          {kb.sampleChunks.map((chunk, cIdx) => (
                            <p key={cIdx} className="text-[10px] text-slate-300 font-mono bg-slate-900 p-1.5 rounded border border-slate-800/60 line-clamp-2">
                              {chunk}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ④ 一鍵發布 / 版本 Modal (Dify / Flowise Style Release & API Endpoint) */}
      {activeModal === 'release' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-6">
              <div className="p-2 bg-purple-950 text-purple-400 rounded-lg border border-purple-800">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">④ 一鍵發布與 API / Chatbot 端點控制</h2>
                <p className="text-xs text-slate-400">將畫布 Flow 自動封裝部署為 REST API Endpoint 與可嵌入 Chatbot 腳本</p>
              </div>
            </div>

            <div className="space-y-5 text-xs">
              {/* Publish Form */}
              <div className="bg-slate-950 p-4 rounded-xl border border-purple-900/50 space-y-3">
                <h3 className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>一鍵發布新版本</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">版本號</label>
                    <input
                      type="text"
                      value={releaseVersion}
                      onChange={(e) => setReleaseVersion(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">發布者</label>
                    <input
                      type="text"
                      readOnly
                      value="Enterprise Lead Architect"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-400 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">版本變更說明 (Release Notes)</label>
                  <input
                    type="text"
                    value={releaseDesc}
                    onChange={(e) => setReleaseDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100"
                  />
                </div>

                <button
                  onClick={handlePublishRelease}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 rounded-lg transition shadow-md shadow-purple-900/30 flex items-center justify-center space-x-1.5"
                >
                  <Globe className="w-4 h-4" />
                  <span>立即發布 Flow 版本並註冊至 Agent 集群 Fleet</span>
                </button>

                {publishedAgentSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-lg text-xs space-y-1 font-mono flex items-center justify-between animate-fadeIn">
                    <span>✓ 已成功發布版本 {releaseVersion}，並已自動同步登記至【Agent 註冊中心 (Agent Fleet)】！</span>
                    {onNavigateToRegistry && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModal(null);
                          onNavigateToRegistry();
                        }}
                        className="px-2 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-bold text-[10px]"
                      >
                        前往 Agent 註冊表
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* API Endpoint Copy Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span>REST API cURL 調用代碼</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`curl -X POST https://ais-dev-avjdfwuq6esg46d2eujl2c-222795270304.asia-east1.run.app/api/v1/agents/finops-flow/run \\
  -H "Authorization: Bearer vk_live_fintech_7a8d" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "核對 ACC-8821"}'`);
                      setCopiedCurl(true);
                      setTimeout(() => setCopiedCurl(false), 2000);
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3 text-blue-400" />
                    <span>{copiedCurl ? '已複製 cURL！' : '複製 cURL'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 font-mono text-[11px] text-blue-300 overflow-x-auto">
{`curl -X POST https://ais-dev-avjdfwuq6esg46d2eujl2c-222795270304.asia-east1.run.app/api/v1/agents/finops-flow/run \\
  -H "Authorization: Bearer vk_live_fintech_7a8d" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "核對 ACC-8821 並進行 SOC2 合規驗證"}'`}
                </pre>
              </div>

              {/* Release Versions History */}
              <div>
                <h3 className="text-xs font-bold text-slate-200 mb-2">歷史發布版本與回滾</h3>
                <div className="space-y-2">
                  {releases.map((rel) => (
                    <div key={rel.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px]">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-purple-300">{rel.version}</span>
                          <span className={`px-1.5 py-0.2 text-[9px] rounded ${
                            rel.status === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {rel.status.toUpperCase()}
                          </span>
                          <span className="text-slate-400">{rel.publishedAt}</span>
                        </div>
                        <p className="text-slate-400 text-[10px] mt-0.5">{rel.description}</p>
                      </div>

                      {rel.status !== 'published' && (
                        <button
                          onClick={() => {
                            setReleases((prev) =>
                              prev.map((r) => ({
                                ...r,
                                status: r.id === rel.id ? 'published' : 'archived',
                              }))
                            );
                            alert(`已成功回滾 (Rollback) 至版本 ${rel.version}`);
                          }}
                          className="text-[10px] bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 px-2 py-1 rounded transition"
                        >
                          一鍵回滾此版本
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⑤ 內嵌測試與即時 Trace Modal / Drawer (Embedded Canvas Runner & Live Trace) */}
      {activeModal === 'test' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-6">
              <div className="p-2 bg-blue-950 text-blue-400 rounded-lg border border-blue-800">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">⑤ 內嵌畫布測試與即時 Trace (Dify / Langflow 標竿)</h2>
                <p className="text-xs text-slate-400">畫布旁直接跑 Flow，觀看單節點即時執行狀態與自動產生的 OTel Trace 紀錄</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Test Input */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">測試輸入 Prompt (Test Input)</label>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    onClick={handleExecuteTest}
                    disabled={isRunningTest}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-4 rounded-lg flex items-center space-x-1.5 shadow-md shadow-blue-900/30"
                  >
                    {isRunningTest ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                    <span>{isRunningTest ? '推導中...' : '即時執行'}</span>
                  </button>
                </div>
              </div>

              {/* Execution Steps Visualization */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>畫布單節點即時執行鏈 (Node Execution Pipeline)</span>
                  {activeExecutingNodeId && (
                    <span className="text-[10px] text-purple-300 font-mono animate-pulse">
                      ⚡ 正實時執行節點: {activeExecutingNodeId}
                    </span>
                  )}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[10px]">
                  {nodes.map((n) => {
                    const isExecuting = activeExecutingNodeId === n.id;
                    const isCompleted = !isRunningTest && testResultTrace;
                    return (
                      <div
                        key={n.id}
                        className={`p-2 rounded-lg border flex flex-col justify-between transition ${
                          isExecuting
                            ? 'bg-purple-900/60 border-purple-400 ring-2 ring-purple-500/50 scale-[1.03]'
                            : isCompleted
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="font-mono text-[9px] uppercase font-bold text-slate-400">
                          {n.type}
                        </span>
                        <span className="font-bold mt-1 line-clamp-1">{n.label}</span>
                        <span className="text-[9px] font-mono mt-2 text-right">
                          {isExecuting ? '⚡ 運算中' : isCompleted ? '✓ OK (45ms)' : '等待觸發'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Test Result Trace Output Box */}
              {testResultTrace && (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>推導完成！產生即時可觀測性 Trace ({testResultTrace.id})</span>
                    </span>
                    <button
                      onClick={() => {
                        setActiveModal(null);
                        onNavigateToTraces();
                      }}
                      className="text-[11px] bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-2.5 py-1 rounded flex items-center space-x-1"
                    >
                      <span>移至「可觀測性與追蹤」查看完整 Tree</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-[11px] font-mono bg-slate-900 p-2.5 rounded border border-slate-800">
                    <div>總耗時: <strong className="text-emerald-300">{testResultTrace.totalDurationMs} ms</strong></div>
                    <div>消耗 Token: <strong className="text-purple-300">{testResultTrace.totalTokens} tokens</strong></div>
                    <div>推導成本: <strong className="text-amber-300">${testResultTrace.totalCost.toFixed(5)}</strong></div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">最終 Agent 回應 (Final Output)</span>
                    <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-200 leading-relaxed font-sans text-xs">
                      {testResultTrace.finalResponse}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
