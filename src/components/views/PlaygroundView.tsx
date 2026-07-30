import React, { useState } from 'react';
import { Agent, Tool, Trace } from '../../types';
import { formatCurrency, formatTokens, formatLatency } from '../../lib/formatters';
import { 
  Terminal, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Wrench, 
  RotateCcw, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Sliders,
  Cpu
} from 'lucide-react';

interface PlaygroundViewProps {
  agents: Agent[];
  tools: Tool[];
  onExecuteChat: (payload: {
    prompt: string;
    systemPrompt: string;
    model: string;
    selectedTools: string[];
    temperature: number;
  }) => Promise<{
    text: string;
    trace: Trace;
    stats: {
      durationMs: number;
      totalTokens: number;
      promptTokens: number;
      completionTokens: number;
      cost: number;
    };
  }>;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  trace?: Trace;
  stats?: {
    durationMs: number;
    totalTokens: number;
    cost: number;
  };
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  agents,
  tools,
  onExecuteChat,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [systemPrompt, setSystemPrompt] = useState<string>(
    agents[0]?.systemPrompt || '你是一個企業級 AI Agent。請精準回答問題並進行總帳核對。'
  );
  const [model, setModel] = useState<string>('gemini-3.6-flash');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [selectedTools, setSelectedTools] = useState<string[]>(['db_search_user_ledger', 'slack_post_channel']);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'agent',
      text: '企業級 Agent 實時測試場已啟動。透過 LiteLLM 模型網關與 Langfuse OTel 追蹤管道連線。請在下方輸入 Prompt 以發起實時推導與工具調用。',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [activeTraceView, setActiveTraceView] = useState<Trace | null>(null);

  const handleSelectAgent = (agentId: string) => {
    const ag = agents.find((a) => a.id === agentId);
    if (ag) {
      setSelectedAgentId(ag.id);
      setSystemPrompt(ag.systemPrompt);
      setModel(ag.primaryModel);
    }
  };

  const handleToggleToolPill = (toolName: string) => {
    if (selectedTools.includes(toolName)) {
      setSelectedTools(selectedTools.filter((t) => t !== toolName));
    } else {
      setSelectedTools([...selectedTools, toolName]);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await onExecuteChat({
        prompt: userText,
        systemPrompt,
        model,
        selectedTools,
        temperature,
      });

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: res.text,
        timestamp: new Date().toLocaleTimeString(),
        trace: res.trace,
        stats: {
          durationMs: res.stats.durationMs,
          totalTokens: res.stats.totalTokens,
          cost: res.stats.cost,
        },
      };

      setMessages((prev) => [...prev, agentMsg]);
      setActiveTraceView(res.trace);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        text: '執行錯誤：無法透過 Gateway 網關路由請求。',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>對標：LANGSMITH 與 PORTKEY 互動式測試場</span>
            </div>
            <h1 className="text-2xl font-black text-white">Agent 實時調試與測試場</h1>
            <p className="text-slate-400 text-sm mt-1">
              測試 Agent 系統提示詞、切換模型參數、觸發 MCP 工具調用，並在側邊同步檢視實時的追蹤 DAG 樹狀圖。
            </p>
          </div>
          <button
            onClick={() => setMessages([messages[0]])}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置對話</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout: Controls (3 cols) | Interactive Bench (5 cols) | Live Trace Tree (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls & System Prompt (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Agent 執行參數設定</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">預設 Agent 模板</label>
            <select
              value={selectedAgentId}
              onChange={(e) => handleSelectAgent(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.codeName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">目標推導模型</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini-3.6-flash">gemini-3.6-flash (極速版)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (專業推理版)</option>
              <option value="gpt-4o">gpt-4o (OpenAI Flagship)</option>
              <option value="claude-3-5-sonnet">claude-3-5-sonnet (Anthropic)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label className="font-semibold text-slate-300">隨機性 (Temperature)</label>
              <span className="font-mono text-indigo-400 font-bold">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">系統提示詞 (System Prompt)</label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">可用的 MCP 工具</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {tools.map((t) => {
                const isSelected = selectedTools.includes(t.name);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleToggleToolPill(t.name)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                      isSelected
                        ? 'bg-indigo-900/50 border border-indigo-500/60 text-indigo-200'
                        : 'bg-slate-950/60 border border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-slate-700'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Interactive Chat Interface (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl shadow-xl flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 bg-slate-800/80 border-b border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center space-x-2 font-bold">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>AGENT 對話互動區</span>
            </span>
            <span className="text-emerald-400 text-[11px] font-semibold">就緒</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'agent' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-1 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-xl text-xs font-mono leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-inner'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono px-1">
                    <span>{m.timestamp}</span>
                    {m.stats && (
                      <>
                        <span>•</span>
                        <span className="text-purple-300">{formatTokens(m.stats.totalTokens)} tok</span>
                        <span>•</span>
                        <span className="text-slate-400">{formatLatency(m.stats.durationMs)}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{formatCurrency(m.stats.cost)}</span>
                      </>
                    )}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 bg-slate-950/80 border border-indigo-900/50 p-3 rounded-xl animate-pulse">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>正在透過 Gateway 模型網關執行推導與工具呼叫...</span>
              </div>
            )}
          </div>

          {/* Prompt Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="輸入 Prompt（例如：核對帳戶 ACC-8821 過去24小時的交易紀錄）..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg transition-colors shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Real-time Live Trace DAG Side Panel (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-[650px] overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 font-bold text-sm text-white">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>實時 LANGFUSE 追蹤樹狀圖</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">OTel 即時串流</span>
          </div>

          {activeTraceView ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                <div className="text-indigo-400 font-bold text-[11px]">{activeTraceView.id}</div>
                <div className="text-slate-200 font-semibold">{activeTraceView.name}</div>
                <div className="text-[10px] text-slate-500">{activeTraceView.agentName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">延遲</span>
                  <span className="text-slate-200 font-bold">{formatLatency(activeTraceView.totalDurationMs)}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">花費</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(activeTraceView.totalCost)}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">步驟執行 Spans</span>
                <div className="space-y-1.5">
                  {activeTraceView.rootSpan.children?.map((sp) => (
                    <div key={sp.id} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px]">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{sp.name}</span>
                        <span className="text-emerald-400">{formatLatency(sp.durationMs)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {JSON.stringify(sp.output)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs text-center p-4">
              在對話框中發送 Prompt 以預覽實時多步驟追蹤樹狀圖。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
