import React, { useState } from 'react';
import { X, Cpu, Server, Lock, Globe, Sparkles, Loader2, Wrench } from 'lucide-react';

interface CreateMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (serverData: {
    name: string;
    type: 'openapi' | 'smithy' | 'lambda' | 'mcp_jsonrpc' | 'postgres';
    endpoint: string;
    authType: 'oauth2' | 'bearer' | 'mtls' | 'none';
    description: string;
  }) => void;
}

export const CreateMcpModal: React.FC<CreateMcpModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'openapi' | 'smithy' | 'lambda' | 'mcp_jsonrpc' | 'postgres'>('smithy');
  const [endpoint, setEndpoint] = useState('');
  const [authType, setAuthType] = useState<'oauth2' | 'bearer' | 'mtls' | 'none'>('mtls');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [discoveryStep, setDiscoveryStep] = useState<'idle' | 'discovering' | 'done'>('idle');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !endpoint.trim()) return;

    setSubmitting(true);
    setDiscoveryStep('discovering');

    onCreate({
      name: name.trim(),
      type,
      endpoint: endpoint.trim(),
      authType,
      description: description.trim() || 'AgentCore Gateway 目標服務器',
    });

    setTimeout(() => {
      setDiscoveryStep('done');
    }, 1200);
  };

  const handleFinishClose = () => {
    setSubmitting(false);
    setDiscoveryStep('idle');
    setName('');
    setEndpoint('');
    setDescription('');
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
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">註冊 MCP 服務器目標</h3>
            <p className="text-xs text-slate-400">AgentCore Gateway OpenAPI/Smithy/Lambda 轉 MCP 映射器</p>
          </div>
        </div>

        {submitting ? (
          <div className="py-6 text-center space-y-4">
            {discoveryStep === 'discovering' ? (
              <div className="space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
                <h4 className="text-base font-bold text-white">正連線至 MCP 服務器執行工具探索 (tools/list)...</h4>
                <p className="text-xs text-slate-400">解析 OpenAPI / Smithy Schema 並自動產生對應工具卡片</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-950/80 border border-amber-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">已提交審核，將於審核通過後上線</h4>
                  <p className="text-xs text-slate-400 mt-1">目前 MCP 服務器與已發現的工具狀態皆為<span className="text-amber-400 font-bold">「待審核 (Pending Review)」</span>。</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs font-mono space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">MCP 服務器:</span>
                    <span className="font-bold text-white">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">端點:</span>
                    <span className="text-indigo-300 truncate max-w-[240px]">{endpoint}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 pt-1 border-t border-slate-800">
                    <span className="flex items-center space-x-1">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>自動發現工具:</span>
                    </span>
                    <span className="font-bold">已發現 3 個工具 (待審核)</span>
                  </div>
                </div>
                <button
                  onClick={handleFinishClose}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-lg transition"
                >
                  完成並返回註冊表
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">服務器名稱</label>
              <input
                type="text"
                required
                placeholder="例如：Salesforce CRM MCP 網關"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">目標協定 / 規格</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="smithy">Smithy Model 網關</option>
                  <option value="openapi">OpenAPI v3 REST 規格</option>
                  <option value="lambda">AWS Lambda ARN</option>
                  <option value="postgres">PostgreSQL MCP Target</option>
                  <option value="mcp_jsonrpc">原生 MCP JSON-RPC 2.0</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">身分驗證需求</label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value as any)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="mtls">mTLS 企業級憑證驗證</option>
                  <option value="oauth2">OAuth 2.0 Bearer Token</option>
                  <option value="bearer">靜態 Bearer API Key</option>
                  <option value="none">內部 VPC 網路（無驗證）</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">目標端點 / 連線 URI</label>
              <input
                type="text"
                required
                placeholder="https://mcp.internal.net/v2 或 postgresql://db:5432"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3.5 py-2 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">描述與作用域說明</label>
              <textarea
                rows={2}
                placeholder="開放帳戶查詢工具並進行自動化 PII 敏感數據脫敏"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
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
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-900/30 flex items-center space-x-1.5"
              >
                <Server className="w-4 h-4" />
                <span>確認註冊目標並探索工具</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
