import { useEffect, useMemo, useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Activity, ArrowUpRight, Bot, Braces, Check, ChevronDown, CircleDot, Code2,
  Command, Copy, Database, Eye, Figma, GitBranch, Globe2, Layers3, LayoutDashboard,
  LoaderCircle, MessageSquare, Move, Palette, PanelRight, Play, Plus, Rocket, Search,
  Send, Settings2, Sparkles, SquareStack, TerminalSquare, Trash2, Users, WandSparkles,
  X, Zap,
} from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Route, Router as WouterRouter, Switch } from "wouter";

type View = "Canvas" | "Mesh" | "Agents" | "Integrations";
type ElementKind = "hero" | "metric" | "activity" | "cta" | "table" | "chart";
type AgentStatus = "Working" | "Idle" | "Stopped";

type MeshNode = {
  id: string;
  name: string;
  kind: string;
  x: number;
  y: number;
  status: "connected" | "paused";
};
type Agent = {
  id: string;
  name: string;
  role: string;
  task: string;
  status: AgentStatus;
  progress: number;
};
type Integration = {
  id: string;
  name: string;
  connected: boolean;
  state: string;
  meta: string;
};

const queryClient = new QueryClient();
const storageKey = "ultimate-builder-project-v1";

const palette = [
  { label: "Heading", kind: "hero" as ElementKind, hint: "H1", icon: Braces },
  { label: "Metric card", kind: "metric" as ElementKind, hint: "data", icon: Activity },
  { label: "Activity feed", kind: "activity" as ElementKind, hint: "list", icon: MessageSquare },
  { label: "Action button", kind: "cta" as ElementKind, hint: "cta", icon: Zap },
  { label: "Data table", kind: "table" as ElementKind, hint: "table", icon: Database },
  { label: "Chart", kind: "chart" as ElementKind, hint: "viz", icon: LayoutDashboard },
];

const starterElements: Record<ElementKind, boolean> = {
  hero: true, metric: true, activity: true, cta: true, table: false, chart: false,
};
const starterNodes: MeshNode[] = [
  { id: "ui", name: "UI Shell", kind: "interface", x: 12, y: 18, status: "connected" },
  { id: "data", name: "Data layer", kind: "database", x: 38, y: 55, status: "connected" },
  { id: "agents", name: "Agent swarm", kind: "agents", x: 68, y: 19, status: "connected" },
  { id: "edge", name: "Edge API", kind: "gateway", x: 56, y: 69, status: "connected" },
];
const starterAgents: Agent[] = [
  { id: "aster", name: "Aster", role: "Product architect", task: "Mapping flows and hierarchy", status: "Working", progress: 68 },
  { id: "relay", name: "Relay", role: "Frontend engineer", task: "Building the current frame", status: "Working", progress: 52 },
  { id: "lumen", name: "Lumen", role: "Visual QA", task: "Watching spacing and contrast", status: "Idle", progress: 22 },
  { id: "patch", name: "Patch", role: "Release operator", task: "Checking staging readiness", status: "Idle", progress: 36 },
];
const starterIntegrations: Integration[] = [
  { id: "github", name: "GitHub", connected: true, state: "Repository connected", meta: "12 branches synced" },
  { id: "figma", name: "Figma", connected: true, state: "Design source connected", meta: "Last imported 18m ago" },
  { id: "postgres", name: "Postgres", connected: true, state: "Database connected", meta: "4 tables available" },
  { id: "vercel", name: "Vercel", connected: false, state: "Deployment target", meta: "Staging environment ready" },
];
const starterMessages = [
  { role: "assistant", text: "I’m ready. Ask me to shape the interface, connect a data source, or tighten the experience." },
];

function TypeIcon({ className }: { className?: string }) {
  return <span className={className}>Aa</span>;
}

function usePersistedState() {
  const [project, setProject] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {
      // A corrupt local project should never block the workspace.
    }
    return {
      elements: starterElements, headline: "Make the complex feel obvious.",
      subtitle: "A calm command center for shipping your next product.",
      ctaLabel: "Open workspace", selected: "hero" as ElementKind,
      style: { layout: "Flow", padding: 24, radius: 12, token: "surface / sage-100" },
      nodes: starterNodes, connections: [["ui", "data"], ["data", "agents"], ["data", "edge"]],
      agents: starterAgents, integrations: starterIntegrations, messages: starterMessages,
      activity: 0, traffic: 0,
    };
  });
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(project));
    setSaved(false);
  }, [project]);
  const save = () => {
    localStorage.setItem(storageKey, JSON.stringify(project));
    setSaved(true);
  };
  return { project, setProject, saved, setSaved, save };
}

function Home() {
  const { project, setProject, saved, setSaved, save } = usePersistedState();
  const [view, setView] = useState<View>("Canvas");
  const [kitOpen, setKitOpen] = useState(false);
  const [kitSearch, setKitSearch] = useState("");
  const [prompt, setPrompt] = useState("");
  const [thinking, setThinking] = useState(false);
  const [toast, setToast] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [shipOpen, setShipOpen] = useState(false);
  const [shipProgress, setShipProgress] = useState(0);
  const [themeLight, setThemeLight] = useState(false);
  const [connectMode, setConnectMode] = useState(false);
  const [connectStart, setConnectStart] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const shipTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);

  const {
    elements, headline, subtitle, ctaLabel, selected, style, nodes, connections,
    agents, integrations, messages, activity, traffic,
  } = project;
  const visibleCount = useMemo(() => Object.values(elements).filter(Boolean).length, [elements]);
  const filteredPalette = useMemo(
    () => palette.filter((item) => item.label.toLowerCase().includes(kitSearch.toLowerCase())),
    [kitSearch],
  );

  useEffect(() => () => {
    if (shipTimer.current) window.clearInterval(shipTimer.current);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const notify = (text: string) => {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  };
  const patch = (updates: Partial<typeof project>) => {
    setProject((current: typeof project) => ({ ...current, ...updates }));
    setSaved(false);
  };
  const updateElements = (kind: ElementKind, value: boolean) =>
    patch({ elements: { ...elements, [kind]: value } });

  const addElement = (kind: ElementKind, label: string) => {
    updateElements(kind, true);
    patch({ selected: kind });
    setView("Canvas");
    setKitOpen(false);
    notify(`${label} added to canvas`);
  };
  const selectElement = (kind: ElementKind) => patch({ selected: kind });
  const removeSelected = () => {
    if (!selected) return;
    updateElements(selected, false);
    patch({ selected: null });
    notify("Element removed from canvas");
  };
  const updateStyle = (updates: Partial<typeof style>) => patch({ style: { ...style, ...updates } });

  const addNode = () => {
    const id = `node-${Date.now()}`;
    const number = nodes.length + 1;
    patch({ nodes: [...nodes, { id, name: `Service ${number}`, kind: "runtime", x: 18 + (number * 13) % 65, y: 20 + (number * 17) % 60, status: "connected" }] });
    notify("Runtime node added to mesh");
  };
  const moveNode = (id: string) => {
    patch({ nodes: nodes.map((node: MeshNode) => node.id === id ? { ...node, x: Math.min(78, node.x + 8), y: Math.min(78, node.y + 5) } : node) });
    notify("Node position updated");
  };
  const clearConnections = () => {
    patch({ connections: [] });
    notify("Mesh connections cleared");
  };
  const toggleConnection = (id: string) => {
    if (!connectMode) {
      setSelectedNode(id);
      return;
    }
    if (!connectStart) {
      setConnectStart(id);
      notify("Select another node to connect");
      return;
    }
    if (connectStart === id) return;
    const exists = connections.some((edge: string[]) => edge.includes(connectStart) && edge.includes(id));
    patch({ connections: exists ? connections : [...connections, [connectStart, id]] });
    setConnectStart(null);
    setConnectMode(false);
    notify(exists ? "Those nodes are already connected" : "Mesh route connected");
  };
  const simulateTraffic = () => {
    patch({ traffic: traffic + 1 });
    notify(`Traffic simulation running · ${traffic + 1} packet${traffic === 0 ? "" : "s"} routed`);
  };

  const addAgent = () => {
    const id = `agent-${Date.now()}`;
    patch({ agents: [...agents, { id, name: "Nova", role: "Research partner", task: "Exploring the next useful edge", status: "Idle", progress: 12 }] });
    notify("Nova provisioned in the agent room");
  };
  const toggleAgent = (id: string) => {
    patch({ agents: agents.map((agent: Agent) => agent.id === id ? { ...agent, status: agent.status === "Working" ? "Idle" : "Working", progress: agent.status === "Working" ? agent.progress : Math.min(92, agent.progress + 8) } : agent) });
    notify("Agent status updated");
  };
  const removeAgent = (id: string) => {
    patch({ agents: agents.filter((agent: Agent) => agent.id !== id) });
    notify("Agent removed");
  };
  const stopAgent = (id: string) => {
    patch({ agents: agents.map((agent: Agent) => agent.id === id ? { ...agent, status: "Stopped" as AgentStatus } : agent) });
    notify("Agent stopped");
  };
  const toggleIntegration = (id: string) => {
    patch({ integrations: integrations.map((item: Integration) => item.id === id ? { ...item, connected: !item.connected, state: !item.connected ? `${item.name} connected` : "Not connected" } : item) });
    notify("Integration state updated");
  };

  const sendPrompt = () => {
    const text = prompt.trim();
    if (!text || thinking) return;
    patch({ messages: [...messages, { role: "user", text }] });
    setPrompt("");
    setThinking(true);
    window.setTimeout(() => {
      patch({
        messages: [...messages, { role: "user", text }, { role: "assistant", text: "I mapped that into the current frame. The hierarchy is cleaner, the action is closer to the data, and the next change is ready to inspect." }],
        activity: activity + 1,
      });
      setThinking(false);
      notify("Assistant updated the frame");
    }, 800);
  };

  const startShip = () => {
    if (shipTimer.current) window.clearInterval(shipTimer.current);
    setShipOpen(true);
    setDeploymentComplete(false);
    setShipProgress(8);
    shipTimer.current = window.setInterval(() => {
      setShipProgress((current) => {
        const next = Math.min(100, current + 23);
        if (next >= 100 && shipTimer.current) {
          window.clearInterval(shipTimer.current);
          setDeploymentComplete(true);
          notify("Deployment complete · staging is live");
        }
        return next;
      });
    }, 650);
  };
  const resetProject = () => {
    if (!window.confirm("Reset the workspace to the starter project? Your saved local changes will be replaced.")) return;
    patch({
      elements: starterElements, headline: "Make the complex feel obvious.",
      subtitle: "A calm command center for shipping your next product.",
      ctaLabel: "Open workspace", selected: "hero", style: { layout: "Flow", padding: 24, radius: 12, token: "surface / sage-100" },
      nodes: starterNodes, connections: [["ui", "data"], ["data", "agents"], ["data", "edge"]],
      agents: starterAgents, integrations: starterIntegrations, messages: starterMessages, activity: 0, traffic: 0,
    });
    notify("Starter project restored");
  };
  const generatedCode = `<!doctype html>
<html>
  <body>
    <main class="northstar-frame">
      <p class="eyebrow">NORTHSTAR / INTERNAL</p>
      <h1>${headline}</h1>
      <p>${subtitle}</p>
      ${elements.metric ? "<section class=\"metrics\">Active builds · 12 &nbsp; Deploy velocity · 3.8h &nbsp; Team focus · 84%</section>" : ""}
      ${elements.activity ? "<section class=\"activity\">Recent activity · Mina Lee merged auth refresh</section>" : ""}
      ${elements.cta ? `<button>${ctaLabel}</button>` : ""}
    </main>
  </body>
</html>`;
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      notify("Generated code copied to clipboard");
    } catch {
      notify("Code is ready to select and copy");
    }
  };
  const downloadCode = () => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([generatedCode], { type: "text/html" }));
    link.download = "northstar-frame.html";
    link.click();
    URL.revokeObjectURL(link.href);
    notify("HTML export downloaded");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("light-workspace", themeLight);
  }, [themeLight]);

  return (
    <div className="builder-app">
      <header className="builder-header">
        <div className="brand">
          <div className="brand-mark"><Zap size={15} fill="currentColor" /></div>
          <div><div className="brand-title">Ultimate <em>Builder</em></div><div className="brand-subtitle">workspace / orbit</div></div>
        </div>
        <div className="header-center">
          <button className="branch" onClick={() => notify("Branch picker · main is active")} data-testid="button-branch"><GitBranch size={12} color="var(--lime)" /> main <ChevronDown size={11} /></button>
        </div>
        <div className="header-actions">
          <button className="ghost-btn" onClick={() => { save(); notify("Saved to local workspace"); }} data-testid="button-save"><Check size={13} /> {saved ? "Saved" : "Save"}</button>
          <button className="outline-btn" onClick={() => setPreviewOpen(true)} data-testid="button-preview"><Eye size={13} /><span>Preview</span></button>
          <button className="outline-btn" onClick={() => setCodeOpen(true)} data-testid="button-code"><Code2 size={13} /><span>Code</span></button>
          <button className="primary-btn" onClick={startShip} data-testid="button-ship"><Rocket size={13} /><span>Ship</span></button>
          <button className="icon-btn" onClick={() => { setThemeLight(!themeLight); notify(themeLight ? "Graphite theme restored" : "High-contrast theme enabled"); }} aria-label="Toggle theme" data-testid="button-theme"><CircleDot size={15} /></button>
          <button className="icon-btn" onClick={() => notify("Command palette ready · press / to search")} aria-label="Open command palette" data-testid="button-command"><Command size={15} /></button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-head"><span className="section-kicker">Build kit</span><button className="icon-btn" onClick={() => notify("Component library is ready")} aria-label="Open component library" data-testid="button-open-library"><Plus size={15} /></button></div>
          <label className="search-box"><Search size={13} /><input value={kitSearch} onChange={(event) => setKitSearch(event.target.value)} placeholder="Search components" aria-label="Search build kit" data-testid="input-search-components" /><span className="shortcut">⌘ K</span></label>
          <div className="palette">
            {filteredPalette.map(({ label, kind, hint, icon: Icon }) => (
              <button className="kit-item" key={kind} onClick={() => addElement(kind, label)} data-testid={`button-add-${kind}`}>
                <span className="kit-icon">{kind === "hero" ? <TypeIcon /> : <Icon size={13} />}</span><span>{label}</span><span className="kit-hint">{hint}</span>
              </button>
            ))}
            {!filteredPalette.length && <div className="empty-inspector" style={{ height: 120 }}>No components match that search.</div>}
          </div>
          <div className="sidebar-bottom">
            <button className="utility-link" onClick={() => notify("Design token explorer opened")} data-testid="button-design-tokens"><Palette size={14} /> Design tokens</button>
            <button className="utility-link" onClick={() => setCodeOpen(true)} data-testid="button-code-explorer"><TerminalSquare size={14} /> Code explorer</button>
            <button className="utility-link" onClick={resetProject} data-testid="button-reset-project"><Trash2 size={14} /> Reset starter project</button>
            <div className="runtime-card"><div className="runtime-title"><CircleDot size={11} /> Runtime healthy</div><div className="runtime-detail">React 19 · TypeScript<br />Edge sync · 42ms</div></div>
          </div>
        </aside>

        <main className="main-panel">
          <div className="view-bar">
            <div className="view-tabs">
              {(["Canvas", "Mesh", "Agents", "Integrations"] as View[]).map((item) => (
                <button key={item} className={`view-tab ${view === item ? "active" : ""}`} onClick={() => setView(item)} data-testid={`tab-${item.toLowerCase()}`}>
                  {item === "Canvas" ? <SquareStack size={13} /> : item === "Mesh" ? <GitBranch size={13} /> : item === "Agents" ? <Bot size={13} /> : <Globe2 size={13} />}{item}
                </button>
              ))}
            </div>
            <div className="view-meta"><span>Zoom 92%</span><Move size={13} /><button className="icon-btn" onClick={() => setKitOpen(true)} aria-label="Open build kit" data-testid="button-mobile-kit"><Plus size={13} /></button><button className="icon-btn" onClick={() => notify("Canvas options opened")} aria-label="More canvas options" data-testid="button-canvas-options"><Settings2 size={14} /></button></div>
          </div>
          <div className="canvas-scroll">
            {view === "Canvas" && <CanvasSurface elements={elements} headline={headline} subtitle={subtitle} ctaLabel={ctaLabel} selected={selected} style={style} onSelect={selectElement} onHeadline={(value) => patch({ headline: value })} onSubtitle={(value) => patch({ subtitle: value })} onCta={(value) => patch({ ctaLabel: value })} onNotify={notify} />}
            {view === "Mesh" && <MeshView nodes={nodes} connections={connections} traffic={traffic} selectedNode={selectedNode} connectMode={connectMode} connectStart={connectStart} onAdd={addNode} onMove={moveNode} onSelect={toggleConnection} onConnect={() => { setConnectMode(!connectMode); setConnectStart(null); }} onClear={clearConnections} onSimulate={simulateTraffic} />}
            {view === "Agents" && <AgentsView agents={agents} onAdd={addAgent} onToggle={toggleAgent} onStop={stopAgent} onRemove={removeAgent} onNotify={notify} />}
            {view === "Integrations" && <IntegrationsView integrations={integrations} onToggle={toggleIntegration} onNotify={notify} />}
          </div>
          <Assistant messages={messages} prompt={prompt} thinking={thinking} visibleCount={visibleCount} onPrompt={setPrompt} onSend={sendPrompt} onPreset={() => { setPrompt("Create a focused onboarding flow for this product"); notify("Prompt added to assistant"); }} />
        </main>

        <aside className="inspector">
          <div className="inspector-head"><div className="inspector-title"><PanelRight size={14} color="var(--lime)" /> Inspector</div><button className="icon-btn" onClick={() => notify("Inspector options opened")} aria-label="Inspector options" data-testid="button-inspector-options"><span>···</span></button></div>
          {selected ? <Inspector selected={selected} style={style} ctaLabel={ctaLabel} onStyle={updateStyle} onCta={(value) => patch({ ctaLabel: value })} onRemove={removeSelected} onNotify={notify} /> : <div className="empty-inspector">Select an element on the canvas to inspect it.</div>}
        </aside>
      </div>

      {kitOpen && <div className="overlay" role="dialog" aria-modal="true" aria-label="Build kit dialog" onClick={() => setKitOpen(false)}>
        <div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><h2>Build kit</h2><button className="icon-btn" onClick={() => setKitOpen(false)} aria-label="Close build kit" data-testid="button-close-kit"><X size={15} /></button></div><div className="modal-body"><label className="search-box" style={{ margin: 0 }}><Search size={13} /><input autoFocus value={kitSearch} onChange={(event) => setKitSearch(event.target.value)} placeholder="Search components" aria-label="Search components in dialog" /></label><div className="palette" style={{ padding: "14px 0 0" }}>{filteredPalette.map(({ label, kind, hint, icon: Icon }) => <button className="kit-item" key={kind} onClick={() => addElement(kind, label)} data-testid={`dialog-add-${kind}`}><span className="kit-icon">{kind === "hero" ? <TypeIcon /> : <Icon size={13} />}</span><span>{label}</span><span className="kit-hint">{hint}</span></button>)}</div></div></div>
      </div>}
      {previewOpen && <PreviewModal headline={headline} subtitle={subtitle} ctaLabel={ctaLabel} elements={elements} onClose={() => setPreviewOpen(false)} onNotify={notify} />}
      {codeOpen && <CodeModal code={generatedCode} onClose={() => setCodeOpen(false)} onCopy={copyCode} onDownload={downloadCode} />}
      {shipOpen && <ShipModal progress={shipProgress} complete={deploymentComplete} onClose={() => setShipOpen(false)} onRestart={startShip} />}
      {toast && <div className="toast" role="status" data-testid="status-toast"><Check size={14} color="var(--lime)" />{toast}</div>}
    </div>
  );
}

function CanvasSurface({ elements, headline, subtitle, ctaLabel, selected, style, onSelect, onHeadline, onSubtitle, onCta, onNotify, readonly = false }: {
  elements: Record<ElementKind, boolean>; headline: string; subtitle: string; ctaLabel: string; selected: ElementKind | null;
  style: { layout: string; padding: number; radius: number; token: string }; onSelect: (kind: ElementKind) => void;
  onHeadline: (value: string) => void; onSubtitle: (value: string) => void; onCta: (value: string) => void; onNotify: (value: string) => void; readonly?: boolean;
}) {
  return <div className={readonly ? "preview-shell" : "canvas-frame"}>
    {!readonly && <div className="frame-toolbar"><div className="frame-live"><span className="live-dot" /> live canvas <span style={{ color: "#43556d" }}>/</span> overview.tsx</div><div className="frame-actions"><button onClick={() => onNotify("Frame duplicated")} aria-label="Duplicate frame" data-testid="button-duplicate-frame"><Copy size={13} /></button><button onClick={() => onNotify("Frame settings opened")} aria-label="Frame settings" data-testid="button-frame-settings"><Settings2 size={13} /></button></div></div>}
    {readonly && <div className="preview-label"><span>preview / overview.tsx</span><span className="live-dot" /></div>}
    <div className="artboard">
      {elements.hero && <section className={`canvas-block hero-block ${selected === "hero" ? "selected" : ""}`} style={{ padding: style.padding, borderRadius: style.radius }} onClick={() => !readonly && onSelect("hero")} data-testid="canvas-element-hero">
        <div className="hero-top"><div className="eyebrow"><span className="eyebrow-mark"><Zap size={10} fill="currentColor" /></span> northstar / internal</div><div className="badges"><span className="badge">Pro workspace</span><span className="badge">v0.8.4</span></div></div>
        {readonly ? <h1 className="hero-input">{headline}</h1> : <input className="hero-input" value={headline} onChange={(event) => onHeadline(event.target.value)} onClick={(event) => event.stopPropagation()} aria-label="Hero headline" data-testid="input-hero-headline" />}
        {readonly ? <p className="subtitle-input">{subtitle}</p> : <input className="subtitle-input" value={subtitle} onChange={(event) => onSubtitle(event.target.value)} onClick={(event) => event.stopPropagation()} aria-label="Hero subtitle" data-testid="input-hero-subtitle" />}
        <div className="hero-actions"><button className="canvas-cta" onClick={(event) => { event.stopPropagation(); onNotify("Workspace tour started"); }} data-testid="button-open-workspace">{ctaLabel} <ArrowUpRight size={12} /></button><span className="sync-note">Last synced 2m ago</span></div>
      </section>}
      {elements.metric && <div className="metric-grid">{[["Active builds", "12", "↑ 18.4%"], ["Deploy velocity", "3.8h", "↓ 26m"], ["Team focus", "84%", "on track"]].map(([label, value, trend], index) => <div className={`canvas-block metric-card ${selected === "metric" && index === 0 ? "selected" : ""}`} style={{ borderRadius: selected === "metric" ? style.radius : undefined }} key={label} onClick={() => !readonly && onSelect("metric")} data-testid={`canvas-element-metric-${index}`}><div className="metric-head"><span>{label}</span><Activity size={12} color="#78985b" /></div><div className="metric-value">{value}</div><div className="metric-trend">{trend}</div></div>)}</div>}
      <div className="lower-grid">
        {elements.activity && <section className={`canvas-block activity-card ${selected === "activity" ? "selected" : ""}`} onClick={() => !readonly && onSelect("activity")} data-testid="canvas-element-activity"><div className="activity-title"><div><div className="card-heading">Recent activity</div><div className="card-subheading">Signals from the last 24 hours</div></div><button className="inline-link" onClick={(event) => { event.stopPropagation(); onNotify("Activity view opened"); }} data-testid="button-view-activity">View all</button></div><div className="activity-list">{[["ML", "Mina Lee", "Merged auth refresh", "8m"], ["JR", "Jules Rivera", "Published API schema", "42m"], ["AK", "Ari Kim", "Opened a review thread", "2h"]].map(([initial, name, detail, time]) => <div className="activity-row" key={name}><span className="avatar">{initial}</span><div className="activity-copy"><div className="activity-name">{name}</div><div className="activity-detail">{detail}</div></div><span className="activity-time">{time}</span></div>)}</div></section>}
        {elements.cta && <section className={`canvas-block intent-card ${selected === "cta" ? "selected" : ""}`} onClick={() => !readonly && onSelect("cta")} data-testid="canvas-element-cta"><div className="eyebrow" style={{ color: "#aace82" }}><WandSparkles size={13} /> build with intent</div><div className="intent-title">Turn a thought into a system.</div><p className="intent-description">Describe the sharp edge. We’ll find the useful shape.</p><button className="primary-btn" style={{ marginTop: 15 }} onClick={(event) => { event.stopPropagation(); onNotify("Prompt added to assistant"); }} data-testid="button-start-with-ai">Start with AI <Sparkles size={12} /></button></section>}
      </div>
      {elements.table && <section className={`canvas-block activity-card ${selected === "table" ? "selected" : ""}`} style={{ marginTop: 10 }} onClick={() => !readonly && onSelect("table")} data-testid="canvas-element-table"><div className="card-heading">Pipeline queue</div><div className="card-subheading">Three frames waiting for review</div><div className="activity-list"><div className="activity-row"><span className="avatar">01</span><div className="activity-copy"><div className="activity-name">Onboarding frame</div><div className="activity-detail">Ready for visual QA</div></div><span className="status-pill active">Ready</span></div><div className="activity-row"><span className="avatar">02</span><div className="activity-copy"><div className="activity-name">Billing handoff</div><div className="activity-detail">Needs interaction pass</div></div><span className="status-pill idle">Review</span></div></div></section>}
      {elements.chart && <section className={`canvas-block activity-card ${selected === "chart" ? "selected" : ""}`} style={{ marginTop: 10 }} onClick={() => !readonly && onSelect("chart")} data-testid="canvas-element-chart"><div className="card-heading">Deploy velocity</div><div className="card-subheading">Last seven build sessions</div><div style={{ display: "flex", alignItems: "end", gap: 7, height: 72, marginTop: 15 }}>{[38, 54, 46, 72, 61, 84, 78].map((height, index) => <span key={index} style={{ flex: 1, height: `${height}%`, borderRadius: "3px 3px 0 0", background: index === 6 ? "#78985b" : "#c9dcb9" }} />)}</div></section>}
    </div>
  </div>;
}

function Inspector({ selected, style, ctaLabel, onStyle, onCta, onRemove, onNotify }: { selected: ElementKind; style: { layout: string; padding: number; radius: number; token: string }; ctaLabel: string; onStyle: (updates: Partial<typeof style>) => void; onCta: (value: string) => void; onRemove: () => void; onNotify: (text: string) => void }) {
  return <div className="inspector-scroll"><div className="inspector-block-title"><div><strong>{selected} block</strong><span>Selected on canvas</span></div><button className="danger-btn" onClick={onRemove} aria-label="Delete selected element" data-testid="button-delete-selected"><Trash2 size={14} /></button></div>
    <div className="control-group"><label className="control-label">Layout</label><div className="segmented">{["Flow", "Grid", "Free"].map((item) => <button key={item} className={`segment ${style.layout === item ? "active" : ""}`} onClick={() => onStyle({ layout: item })} data-testid={`button-layout-${item.toLowerCase()}`}>{item}</button>)}</div></div>
    <div className="control-group"><label className="control-label">Spacing</label><div className="field-grid"><label className="field"><span>Padding</span><input type="number" min="8" max="48" value={style.padding} onChange={(event) => onStyle({ padding: Number(event.target.value) })} aria-label="Padding in pixels" data-testid="input-padding" /><span>px</span></label><label className="field"><span>Radius</span><input type="number" min="0" max="24" value={style.radius} onChange={(event) => onStyle({ radius: Number(event.target.value) })} aria-label="Radius in pixels" data-testid="input-radius" /><span>px</span></label></div></div>
    <div className="control-group"><label className="control-label">Style token</label><div className="select-field"><select value={style.token} onChange={(event) => onStyle({ token: event.target.value })} aria-label="Style token" data-testid="select-style-token"><option>surface / sage-100</option><option>surface / moss-200</option><option>surface / graphite-900</option></select><ChevronDown size={13} /></div></div>
    {selected === "cta" && <div className="control-group"><label className="control-label">Visible label</label><div className="field" style={{ display: "flex" }}><input value={ctaLabel} onChange={(event) => onCta(event.target.value)} onBlur={(event) => onNotify(`CTA label updated: ${event.target.value}`)} aria-label="Action button label" data-testid="input-cta-label" /></div></div>}
    <div className="ai-suggestion"><div className="ai-title"><Sparkles size={13} /> AI suggestion</div><p>This block has strong contrast. Consider adding a compact status label to clarify its state.</p><button onClick={() => onNotify("Suggestion applied to selected block")} data-testid="button-apply-suggestion">Apply suggestion <ArrowUpRight size={11} /></button></div>
  </div>;
}

function MeshView({ nodes, connections, traffic, selectedNode, connectMode, connectStart, onAdd, onMove, onSelect, onConnect, onClear, onSimulate }: { nodes: MeshNode[]; connections: string[][]; traffic: number; selectedNode: string | null; connectMode: boolean; connectStart: string | null; onAdd: () => void; onMove: (id: string) => void; onSelect: (id: string) => void; onConnect: () => void; onClear: () => void; onSimulate: () => void }) {
  const nodeById = (id: string) => nodes.find((node) => node.id === id);
  return <div className="view-card"><div className="view-header"><div><h1>Product mesh</h1><p>How your interface, data and agents connect.</p></div><div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}><button className={`outline-btn ${connectMode ? "active" : ""}`} onClick={onConnect} data-testid="button-connect-mode"><GitBranch size={13} /> {connectMode ? "Connecting…" : "Connect"}</button><button className="outline-btn" onClick={onClear} data-testid="button-clear-connections"><Trash2 size={13} /> Clear</button><button className="outline-btn" onClick={onSimulate} data-testid="button-simulate-traffic"><Play size={13} /> Simulate {traffic > 0 ? `(${traffic})` : ""}</button><button className="primary-btn" onClick={onAdd} data-testid="button-add-node"><Plus size={13} /> Add node</button></div></div>
    {connectMode && <div className="toast" style={{ position: "relative", right: "auto", bottom: "auto", marginBottom: 10, width: "fit-content" }}><GitBranch size={13} color="var(--lime)" /> {connectStart ? "Pick a destination node" : "Pick a source node"}</div>}
    <div className="mesh-board">{connections.map((edge, index) => { const from = nodeById(edge[0]); const to = nodeById(edge[1]); if (!from || !to) return null; const dx = to.x - from.x; const dy = to.y - from.y; const length = Math.sqrt(dx * dx + dy * dy); const angle = Math.atan2(dy, dx) * 180 / Math.PI; return <span className="mesh-line" key={`${edge.join("-")}-${index}`} style={{ left: `${from.x + 7}%`, top: `${from.y + 7}%`, width: `${length}%`, transform: `rotate(${angle}deg)` }} />; })}{nodes.map((node) => <div key={node.id} className={`mesh-node ${selectedNode === node.id ? "selected" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => onSelect(node.id)} data-testid={`mesh-node-${node.id}`}><div className="mesh-node-head"><span className="mesh-node-icon">{node.kind === "database" ? <Database size={14} /> : node.kind === "agents" ? <Bot size={14} /> : node.kind === "gateway" ? <Globe2 size={14} /> : <Layers3 size={14} />}</span><span className="mesh-node-name">{node.name}</span></div><div className="mesh-node-state"><CircleDot size={9} style={{ marginRight: 4, verticalAlign: "middle", color: node.status === "connected" ? "var(--lime)" : "#77869a" }} />{node.status}</div><div className="mesh-node-actions"><button onClick={(event) => { event.stopPropagation(); onMove(node.id); }} aria-label={`Move ${node.name}`} data-testid={`button-move-${node.id}`}><Move size={11} /></button></div></div>)}</div>
  </div>;
}

function AgentsView({ agents, onAdd, onToggle, onStop, onRemove, onNotify }: { agents: Agent[]; onAdd: () => void; onToggle: (id: string) => void; onStop: (id: string) => void; onRemove: (id: string) => void; onNotify: (text: string) => void }) {
  return <div className="view-card"><div className="view-header"><div><h1>Agent room</h1><p>Specialists working against the same product context.</p></div><button className="outline-btn" onClick={onAdd} data-testid="button-provision-agent"><Plus size={13} /> Provision agent</button></div><div className="agent-list">{agents.map((agent) => <div className="agent-card" key={agent.id} data-testid={`card-agent-${agent.id}`}><div className="agent-top"><div className="agent-avatar"><Bot size={17} /></div><div><div className="agent-name">{agent.name}</div><div className="agent-role">{agent.role}</div></div><span className={`status-pill ${agent.status === "Working" ? "working" : "idle"}`}>{agent.status}</span></div><div className="agent-task">{agent.task}</div><div className="progress"><span style={{ width: `${agent.status === "Stopped" ? 0 : agent.progress}%` }} /></div><div className="agent-actions"><button onClick={() => onToggle(agent.id)} data-testid={`button-toggle-agent-${agent.id}`}>{agent.status === "Working" ? "Idle" : "Start"}</button><button onClick={() => onStop(agent.id)} disabled={agent.status === "Stopped"} data-testid={`button-stop-agent-${agent.id}`}>Stop</button><button onClick={() => onNotify(`${agent.name} activity log opened`)} data-testid={`button-log-agent-${agent.id}`}>Activity</button><button onClick={() => onRemove(agent.id)} aria-label={`Remove ${agent.name}`} data-testid={`button-remove-agent-${agent.id}`}><Trash2 size={11} /></button></div></div>)}</div></div>;
}

function IntegrationsView({ integrations, onToggle, onNotify }: { integrations: Integration[]; onToggle: (id: string) => void; onNotify: (text: string) => void }) {
  const iconFor = (id: string) => id === "github" ? <GitBranch size={17} /> : id === "figma" ? <Figma size={17} /> : id === "postgres" ? <Database size={17} /> : <Rocket size={17} />;
  return <div className="view-card"><div className="view-header"><div><h1>Integrations</h1><p>Bring the rest of your stack into the frame.</p></div><button className="outline-btn" onClick={() => onNotify("Integration catalog opened")} data-testid="button-integration-catalog"><Plus size={13} /> Add integration</button></div><div className="data-grid">{integrations.map((item) => <div className="data-card" key={item.id} data-testid={`card-integration-${item.id}`}><div className="data-card-head"><div className="data-icon">{iconFor(item.id)}</div><div><h3>{item.name}</h3><p>{item.state}</p></div><span className={`status-pill ${item.connected ? "active" : "disconnected"}`} style={{ marginLeft: "auto" }}>{item.connected ? "Connected" : "Idle"}</span></div><small>{item.meta}</small><button className="outline-btn" onClick={() => onToggle(item.id)} data-testid={`button-toggle-integration-${item.id}`}>{item.connected ? "Disconnect" : "Connect"}</button><button className="icon-btn" style={{ float: "right", marginTop: 11 }} onClick={() => onNotify(`${item.name} settings opened`)} aria-label={`Open ${item.name} settings`} data-testid={`button-settings-integration-${item.id}`}><Settings2 size={13} /></button></div>)}</div></div>;
}

function Assistant({ messages, prompt, thinking, visibleCount, onPrompt, onSend, onPreset }: { messages: { role: string; text: string }[]; prompt: string; thinking: boolean; visibleCount: number; onPrompt: (text: string) => void; onSend: () => void; onPreset: () => void }) {
  return <div className="assistant"><div className="assistant-shell"><div className="assistant-label"><Sparkles size={13} color="var(--lime)" /><strong>Builder assistant</strong><span>· context: {visibleCount} active elements</span>{thinking && <LoaderCircle size={12} className="spin" color="var(--lime)" />}</div><div className="assistant-box"><div className="messages">{messages.slice(-3).map((message, index) => <div className={`message ${message.role === "user" ? "user" : ""}`} key={`${message.role}-${index}`}><span className="message-role">{message.role === "user" ? "you" : "ai"}</span>{message.text}</div>)}</div><div className="assistant-form"><input value={prompt} onChange={(event) => onPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") onSend(); }} placeholder="Ask for a sharper layout, a new flow, or a connected data source..." aria-label="Builder assistant prompt" data-testid="input-assistant-prompt" /><button className="primary-btn" onClick={onSend} disabled={thinking || !prompt.trim()} data-testid="button-ask-assistant"><Send size={12} /> Ask</button></div></div><button className="utility-link" style={{ width: "fit-content", paddingLeft: 0, marginTop: 4 }} onClick={onPreset} data-testid="button-assistant-preset"><Sparkles size={11} /> Try a focused onboarding flow</button></div></div>;
}

function PreviewModal({ headline, subtitle, ctaLabel, elements, onClose, onNotify }: { headline: string; subtitle: string; ctaLabel: string; elements: Record<ElementKind, boolean>; onClose: () => void; onNotify: (text: string) => void }) {
  return <div className="overlay" role="dialog" aria-modal="true" aria-label="Preview mode"><div className="preview-shell" style={{ maxHeight: "calc(100dvh - 40px)", overflow: "auto" }}><div className="preview-label"><span>preview mode / current composition</span><button className="icon-btn" onClick={onClose} aria-label="Close preview" data-testid="button-close-preview"><X size={15} /></button></div><CanvasSurface elements={elements} headline={headline} subtitle={subtitle} ctaLabel={ctaLabel} selected={null} style={{ layout: "Flow", padding: 24, radius: 12, token: "surface / sage-100" }} onSelect={() => undefined} onHeadline={() => undefined} onSubtitle={() => undefined} onCta={() => undefined} onNotify={onNotify} readonly /></div></div>;
}

function CodeModal({ code, onClose, onCopy, onDownload }: { code: string; onClose: () => void; onCopy: () => void; onDownload: () => void }) {
  return <div className="overlay" role="dialog" aria-modal="true" aria-label="Generated code"><div className="modal"><div className="modal-head"><h2>Generated frame</h2><button className="icon-btn" onClick={onClose} aria-label="Close generated code" data-testid="button-close-code"><X size={15} /></button></div><div className="modal-body"><p style={{ margin: "0 0 13px", color: "#8292a7", font: "10px var(--font-mono)" }}>A readable static export of the current canvas composition.</p><pre className="code-output" data-testid="text-generated-code">{code}</pre><div style={{ display: "flex", justifyContent: "flex-end", gap: 7, marginTop: 13 }}><button className="outline-btn" onClick={onCopy} data-testid="button-copy-code"><Copy size={13} /> Copy</button><button className="primary-btn" onClick={onDownload} data-testid="button-download-code"><ArrowUpRight size={13} /> Download HTML</button></div></div></div></div>;
}

function ShipModal({ progress, complete, onClose, onRestart }: { progress: number; complete: boolean; onClose: () => void; onRestart: () => void }) {
  const steps = ["Validate frame", "Build production bundle", "Run visual checks", "Publish to staging"];
  const completedCount = Math.floor(progress / 25);
  return <div className="overlay" role="dialog" aria-modal="true" aria-label="Ship deployment"><div className="modal"><div className="modal-head"><h2>{complete ? "Staging is live" : "Ship to staging"}</h2><button className="icon-btn" onClick={onClose} aria-label="Close ship dialog" data-testid="button-close-ship"><X size={15} /></button></div><div className="modal-body"><div style={{ color: complete ? "var(--lime)" : "#a9b8c9", font: "11px var(--font-mono)" }}>{complete ? "Deployment completed without errors." : "Preparing a staged deployment from the current workspace."}</div><div className="deploy-progress"><span style={{ width: `${progress}%` }} /></div><div style={{ display: "flex", justifyContent: "space-between", color: "#71839b", font: "9px var(--font-mono)" }}><span>{progress}% complete</span><span>{progress > 0 && !complete ? "working…" : complete ? "ready" : "queued"}</span></div><div style={{ marginTop: 17 }}>{steps.map((step, index) => <div className="deploy-step" key={step}><span className={`step-icon ${index < completedCount || complete ? "done" : index === completedCount ? "running" : ""}`}>{index < completedCount || complete ? <Check size={13} /> : index === completedCount ? <LoaderCircle size={13} className="spin" /> : <CircleDot size={11} />}</span><span>{step}</span></div>)}</div>{complete && <div style={{ display: "flex", justifyContent: "flex-end", gap: 7, marginTop: 14 }}><button className="outline-btn" onClick={onRestart} data-testid="button-redeploy"><Rocket size={13} /> Redeploy</button><button className="primary-btn" onClick={onClose} data-testid="button-finish-ship"><Check size={13} /> Done</button></div>}</div></div></div>;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><ErrorBoundary><Router /></ErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;