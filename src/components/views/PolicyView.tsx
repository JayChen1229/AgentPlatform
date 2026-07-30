import React, { useState } from 'react';
import { PermissionScope, RoleBinding, GuardrailConfig } from '../../types';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  FileCode, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Code2,
  DollarSign
} from 'lucide-react';

interface PolicyViewProps {
  scopes: PermissionScope[];
  roles: RoleBinding[];
  guardrails: GuardrailConfig;
  onUpdateGuardrails: (newConfig: Partial<GuardrailConfig>) => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({
  scopes,
  roles,
  guardrails,
  onUpdateGuardrails,
}) => {
  const [selectedRole, setSelectedRole] = useState<RoleBinding>(roles[0] || null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'LLM', 'MCP_TOOL', 'DATA', 'SYSTEM', 'ADMIN'];

  const filteredScopes = scopes.filter((s) =>
    activeCategoryFilter === 'ALL' ? true : s.category === activeCategoryFilter
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>對標：LOOM 與 CEDAR-OPA 策略引擎 (21 個細粒度權限點)</span>
            </div>
            <h1 className="text-2xl font-black text-white">策略、權限治理與安全護欄</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              21 個權限點 RBAC/ABAC 授權矩陣、Cedar/OPA 已編譯規則、PII 敏感資料脫敏，以及 Prompt 注入防禦層。
            </p>
          </div>

          <div className="hidden lg:flex items-center space-x-3 bg-emerald-950/60 border border-emerald-800 p-3 rounded-lg text-xs font-mono text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-emerald-400 font-bold">Cedar-OPA 評估引擎</div>
              <div className="text-slate-400 text-[10px]">21/21 個權限點已強制執行</div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Guardrails & Safety Controls */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>實時安全與合規護欄 (Real-time Guardrails)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* PII Masking Switch */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400">
                <EyeOff className="w-4 h-4" />
                <span className="font-bold text-sm text-white">PII 敏感數據脫敏</span>
              </div>
              <input
                type="checkbox"
                checked={guardrails.piiMasking}
                onChange={(e) => onUpdateGuardrails({ piiMasking: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-400">自動識別信用卡號、身分證字號與 Email 地址並進行正規表示式遮蔽。</p>
          </div>

          {/* Prompt Injection Defense Switch */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Lock className="w-4 h-4" />
                <span className="font-bold text-sm text-white">Prompt 注入防禦</span>
              </div>
              <input
                type="checkbox"
                checked={guardrails.promptInjectionDefense}
                onChange={(e) => onUpdateGuardrails({ promptInjectionDefense: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-400">偵測越獄觸發詞 (Jailbreak)、系統提示詞覆蓋以及惡意攻擊載荷。</p>
          </div>

          {/* Toxicity Filter Switch */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-purple-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-bold text-sm text-white">有害內容過濾</span>
              </div>
              <input
                type="checkbox"
                checked={guardrails.toxicityFilter}
                onChange={(e) => onUpdateGuardrails({ toxicityFilter: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded bg-slate-800 border-slate-700 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-400">攔截不當言論、攻擊性內容以及未授權的企業對外通訊。</p>
          </div>

          {/* Output Budget Cap */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold text-sm text-white">單次請求金額上限</span>
              </div>
              <span className="font-mono text-xs text-amber-400 font-bold">${guardrails.maxOutputBudgetDollars}</span>
            </div>
            <p className="text-xs text-slate-400">防止模型死迴圈調用，當單次查詢超過金額限制時自動硬性停止。</p>
          </div>
        </div>
      </div>

      {/* 2. 21 Scopes Governance Matrix */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span>21 個細粒度權限點 (RBAC/ABAC) 授權矩陣</span>
            </h2>
            <p className="text-xs text-slate-400">在每次 Agent 工具執行時評估細粒度 Scope 存取控管。</p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-1 border border-slate-800 rounded-lg overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  activeCategoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? '全部類別' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs font-mono uppercase tracking-wider sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">類別</th>
                  <th className="px-4 py-3">權限代碼 (Scope Code)</th>
                  <th className="px-4 py-3">權限點名稱</th>
                  <th className="px-4 py-3">詳細說明</th>
                  <th className="px-4 py-3 text-right">角色綁定狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredScopes.map((scope) => {
                  const isBoundToSelectedRole = selectedRole?.scopesAllowed.includes(scope.code);

                  return (
                    <tr key={scope.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-indigo-300 border border-slate-700">
                          {scope.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-400">
                        {scope.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white text-xs">{scope.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-md">{scope.description}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                          isBoundToSelectedRole
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {isBoundToSelectedRole ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>允許訪問</span>
                            </>
                          ) : (
                            <span>受限存取</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Cedar/OPA Engine Policy Code Inspector */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          <span>Cedar / OPA 策略語言編譯程式碼視圖</span>
        </h2>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 shadow-inner overflow-x-auto">
          <pre>{`// Cedar-OPA 策略執行檢驗引擎 (企業級規格)
permit (
  principal in Team::"金融工程團隊",
  action in [Action::"mcp:tool:execute:db", Action::"llm:invoke:standard"],
  resource in AgentCore::"LedgerTarget"
)
when {
  resource.tag == "environment:production" &&
  context.guardrails.piiMasking == true &&
  context.virtualKey.spentCurrent < context.virtualKey.budgetLimit
};

forbid (
  principal,
  action == Action::"data:read:raw_unmasked",
  resource
)
when {
  context.request.containsPromptInjection == true
};`}</pre>
        </div>
      </div>
    </div>
  );
};
