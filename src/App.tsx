import React, { useState, useEffect } from 'react';
import { ActiveTab, Agent, AgentSkill, FallbackRule, FlowEdge, FlowNode, FlowReleaseVersion, GuardrailConfig, KnowledgeBase, MCPServer, ModelProvider, PermissionScope, RoleBinding, Tool, Trace, VirtualKey } from './types';
import { Navbar } from './components/Navbar';
import { BuilderView } from './components/views/BuilderView';
import { GatewayView } from './components/views/GatewayView';
import { TracesView } from './components/views/TracesView';
import { RegistryView } from './components/views/RegistryView';
import { PolicyView } from './components/views/PolicyView';
import { PlaygroundView } from './components/views/PlaygroundView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { CreateKeyModal } from './components/modals/CreateKeyModal';
import { CreateMcpModal } from './components/modals/CreateMcpModal';
import { CreateSkillModal } from './components/modals/CreateSkillModal';
import { CreateAgentModal } from './components/modals/CreateAgentModal';
import { 
  INITIAL_PROVIDERS, 
  INITIAL_VIRTUAL_KEYS, 
  INITIAL_FALLBACK_RULES, 
  INITIAL_MCP_SERVERS, 
  INITIAL_TOOLS, 
  INITIAL_SKILLS,
  INITIAL_AGENTS, 
  INITIAL_21_SCOPES, 
  INITIAL_ROLE_BINDINGS, 
  INITIAL_GUARDRAILS, 
  INITIAL_TRACES,
  INITIAL_NODES,
  INITIAL_EDGES,
  INITIAL_KNOWLEDGE_BASES,
  INITIAL_RELEASES
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('builder');

  // Application State
  const [providers, setProviders] = useState<ModelProvider[]>(INITIAL_PROVIDERS);
  const [virtualKeys, setVirtualKeys] = useState<VirtualKey[]>(INITIAL_VIRTUAL_KEYS);
  const [fallbackRules, setFallbackRules] = useState<FallbackRule[]>(INITIAL_FALLBACK_RULES);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(INITIAL_MCP_SERVERS);
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [skills, setSkills] = useState<AgentSkill[]>(INITIAL_SKILLS);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [scopes, setScopes] = useState<PermissionScope[]>(INITIAL_21_SCOPES);
  const [roles, setRoles] = useState<RoleBinding[]>(INITIAL_ROLE_BINDINGS);
  const [guardrails, setGuardrails] = useState<GuardrailConfig>(INITIAL_GUARDRAILS);
  const [traces, setTraces] = useState<Trace[]>(INITIAL_TRACES);

  // Builder State
  const [nodes, setNodes] = useState<FlowNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<FlowEdge[]>(INITIAL_EDGES);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>(INITIAL_KNOWLEDGE_BASES);
  const [releases, setReleases] = useState<FlowReleaseVersion[]>(INITIAL_RELEASES);

  // Modals state
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

  // Fetch live backend state on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [keysRes, provRes, fbRes, mcpRes, toolsRes, agentsRes, scopesRes, rolesRes, guardRes, tracesRes] = await Promise.all([
          fetch('/api/gateway/keys'),
          fetch('/api/gateway/providers'),
          fetch('/api/gateway/fallbacks'),
          fetch('/api/registry/mcp-servers'),
          fetch('/api/registry/tools'),
          fetch('/api/registry/agents'),
          fetch('/api/policy/scopes'),
          fetch('/api/policy/roles'),
          fetch('/api/policy/guardrails'),
          fetch('/api/traces'),
        ]);

        if (keysRes.ok) setVirtualKeys(await keysRes.json());
        if (provRes.ok) setProviders(await provRes.json());
        if (fbRes.ok) setFallbackRules(await fbRes.json());
        if (mcpRes.ok) setMcpServers(await mcpRes.json());
        if (toolsRes.ok) setTools(await toolsRes.json());
        if (agentsRes.ok) setAgents(await agentsRes.json());
        if (scopesRes.ok) setScopes(await scopesRes.json());
        if (rolesRes.ok) setRoles(await rolesRes.json());
        if (guardRes.ok) setGuardrails(await guardRes.json());
        if (tracesRes.ok) setTraces(await tracesRes.json());
      } catch (e) {
        console.warn('Backend API offline, falling back to local state:', e);
      }
    }
    loadData();
  }, []);

  // Handler: Issue Virtual Key
  const handleCreateKey = async (keyData: {
    name: string;
    team: string;
    budgetLimitMonthly: number;
    rpmLimit: number;
    tpmLimit: number;
    allowedModels: string[];
    fallbackModels: string[];
  }) => {
    try {
      const res = await fetch('/api/gateway/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyData),
      });
      if (res.ok) {
        const newKey = await res.json();
        setVirtualKeys((prev) => [newKey, ...prev]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      const localKey: VirtualKey = {
        id: `vk-${Date.now().toString().slice(-4)}`,
        name: keyData.name,
        keyPrefix: `vk_live_${Math.random().toString(36).substring(2, 8)}`,
        team: keyData.team,
        budgetLimitMonthly: keyData.budgetLimitMonthly,
        budgetSpentCurrent: 0,
        rpmLimit: keyData.rpmLimit,
        tpmLimit: keyData.tpmLimit,
        allowedModels: keyData.allowedModels,
        fallbackModels: keyData.fallbackModels,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      };
      setVirtualKeys((prev) => [localKey, ...prev]);
    }
  };

  // Handler: Delete Virtual Key
  const handleDeleteKey = async (keyId: string) => {
    try {
      await fetch(`/api/gateway/keys/${keyId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete key call failed:', e);
    }
    setVirtualKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  // Handler: Register MCP Target
  const handleCreateMcp = async (serverData: {
    name: string;
    type: 'openapi' | 'smithy' | 'lambda' | 'mcp_jsonrpc' | 'postgres';
    endpoint: string;
    authType: 'oauth2' | 'bearer' | 'mtls' | 'none';
    description: string;
  }) => {
    try {
      const res = await fetch('/api/registry/mcp-servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData),
      });
      if (res.ok) {
        const newServer = await res.json();
        setMcpServers((prev) => [newServer, ...prev]);
      } else {
        throw new Error('API failed');
      }
    } catch {
      const localMcp: MCPServer = {
        id: `mcp-${Date.now().toString().slice(-4)}`,
        name: serverData.name,
        type: serverData.type,
        endpoint: serverData.endpoint,
        status: 'online',
        latencyMs: 35,
        toolsCount: 1,
        authType: serverData.authType,
        description: serverData.description,
      };
      setMcpServers((prev) => [localMcp, ...prev]);
    }
  };

  // Handler: Create Agent
  const handleCreateAgent = (agentData: Omit<Agent, 'id' | 'updatedAt'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: `agent-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setAgents((prev) => [newAgent, ...prev]);
  };

  // Handler: Create Agent Skill
  const handleCreateSkill = (skillData: Omit<AgentSkill, 'id' | 'usageCount' | 'updatedAt'>) => {
    const newSkill: AgentSkill = {
      ...skillData,
      id: `skill-${Date.now()}`,
      usageCount: 0,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setSkills((prev) => [newSkill, ...prev]);
  };

  // Handler: Toggle Agent Skill Enabled State
  const handleToggleSkill = (skillId: string, enabled: boolean) => {
    setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...s, enabled } : s)));
  };

  // Handler: Toggle Tool Enabled State
  const handleToggleTool = async (toolId: string, enabled: boolean) => {
    setTools((prev) => prev.map((t) => (t.id === toolId ? { ...t, enabled } : t)));
    try {
      await fetch('/api/registry/tools/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, enabled }),
      });
    } catch (e) {
      console.warn('Backend tool toggle failed:', e);
    }
  };

  // Handler: Update Guardrails
  const handleUpdateGuardrails = async (newConfig: Partial<GuardrailConfig>) => {
    const updated = { ...guardrails, ...newConfig };
    setGuardrails(updated);
    try {
      await fetch('/api/policy/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Backend guardrails update failed:', e);
    }
  };

  // Handler: Execute Chat in Playground
  const handleExecuteChat = async (payload: {
    prompt: string;
    systemPrompt: string;
    model: string;
    selectedTools: string[];
    temperature: number;
  }) => {
    const res = await fetch('/api/playground/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Chat API failed');
    }

    const data = await res.json();
    if (data.trace) {
      setTraces((prev) => [data.trace, ...prev]);
    }
    return data;
  };

  // Handler: Execute Test Flow in Builder
  const handleRunTestFlow = async (prompt: string) => {
    try {
      const data = await handleExecuteChat({
        prompt,
        systemPrompt: '你是一位經由 Langflow / Dify 畫布建構的企業級 Agent。',
        model: 'gemini-3.6-flash',
        selectedTools: ['tool-slack-post', 'tool-qdrant-search'],
        temperature: 0.2,
      });
      return data.trace;
    } catch (e) {
      console.warn('Test flow execution failed, generating fallback trace:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tracesCount={traces.length}
        activeKeysCount={virtualKeys.filter((k) => k.status === 'active').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'builder' && (
          <BuilderView
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            knowledgeBases={knowledgeBases}
            setKnowledgeBases={setKnowledgeBases}
            releases={releases}
            setReleases={setReleases}
            tools={tools}
            skills={skills}
            agents={agents}
            onRunTestFlow={handleRunTestFlow}
            onNavigateToTraces={() => setActiveTab('traces')}
            onPublishAgentToRegistry={handleCreateAgent}
            onNavigateToRegistry={() => setActiveTab('registry')}
          />
        )}

        {activeTab === 'gateway' && (
          <GatewayView
            providers={providers}
            virtualKeys={virtualKeys}
            fallbackRules={fallbackRules}
            onOpenCreateKeyModal={() => setIsKeyModalOpen(true)}
            onDeleteKey={handleDeleteKey}
          />
        )}

        {activeTab === 'traces' && <TracesView traces={traces} />}

        {activeTab === 'registry' && (
          <RegistryView
            agents={agents}
            mcpServers={mcpServers}
            tools={tools}
            skills={skills}
            onOpenCreateMcpModal={() => setIsMcpModalOpen(true)}
            onOpenCreateSkillModal={() => setIsSkillModalOpen(true)}
            onOpenCreateAgentModal={() => setIsAgentModalOpen(true)}
            onToggleTool={handleToggleTool}
            onToggleSkill={handleToggleSkill}
          />
        )}

        {activeTab === 'policy' && (
          <PolicyView
            scopes={scopes}
            roles={roles}
            guardrails={guardrails}
            onUpdateGuardrails={handleUpdateGuardrails}
          />
        )}

        {activeTab === 'playground' && (
          <PlaygroundView
            agents={agents}
            tools={tools}
            onExecuteChat={handleExecuteChat}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView virtualKeys={virtualKeys} traces={traces} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>企業級 Agent 平台 Web UI • LiteLLM 網關 + Langfuse v3 追蹤 + AgentCore MCP + Cedar/OPA 策略治理</span>
          <span>Google AI Studio 平台建置</span>
        </div>
      </footer>

      {/* Modals */}
      <CreateKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onCreate={handleCreateKey}
      />

      <CreateMcpModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        onCreate={handleCreateMcp}
      />

      <CreateSkillModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        availableTools={tools}
        onCreateSkill={handleCreateSkill}
      />

      <CreateAgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        availableTools={tools}
        virtualKeys={virtualKeys}
        onCreateAgent={handleCreateAgent}
      />
    </div>
  );
}
