import { useMemo, useState } from "react";
import {
  Activity,
  AppWindow,
  ArrowUpRight,
  Bot,
  Braces,
  Check,
  ChevronDown,
  CircleDot,
  Code2,
  Command,
  Copy,
  Database,
  Eye,
  Figma,
  GitBranch,
  Globe2,
  Layers3,
  LayoutDashboard,
  LoaderCircle,
  MessageSquare,
  MoreHorizontal,
  Move,
  Palette,
  PanelRight,
  Play,
  Plus,
  Rocket,
  Search,
  Send,
  Settings2,
  Sparkles,
  SquareStack,
  TerminalSquare,
  Trash2,
  Users,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

type View = "Canvas" | "Mesh" | "Agents" | "Integrations";
type ElementKind = "hero" | "metric" | "activity" | "cta";

const palette = [
  { label: "Heading", icon: TypeIcon, hint: "H1" },
  { label: "Metric card", icon: Activity, hint: "data" },
  { label: "Activity feed", icon: MessageSquare, hint: "list" },
  { label: "Action button", icon: Zap, hint: "cta" },
  { label: "Data table", icon: Database, hint: "table" },
  { label: "Chart", icon: LayoutDashboard, hint: "viz" },
];

function TypeIcon(props: { className?: string }) {
  return <span className={props.className}>Aa</span>;
}

const initialElements: Record<ElementKind, boolean> = {
  hero: true,
  metric: true,
  activity: true,
  cta: true,
};

export function UltimateAppBuilder() {
  const [view, setView] = useState<View>("Canvas");
  const [selected, setSelected] = useState<ElementKind>("hero");
  const [elements, setElements] = useState(initialElements);
  const [headline, setHeadline] = useState("Make the complex feel obvious.");
  const [subtitle, setSubtitle] = useState("A calm command center for shipping your next product.");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "I’m ready. Ask me to shape the interface, connect a data source, or tighten the experience." },
  ]);
  const [toast, setToast] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const visibleCount = useMemo(() => Object.values(elements).filter(Boolean).length, [elements]);
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  };
  const addElement = (label: string) => {
    const kind: ElementKind = label === "Heading" ? "hero" : label === "Metric card" ? "metric" : label === "Activity feed" ? "activity" : "cta";
    setElements((current) => ({ ...current, [kind]: true }));
    setSelected(kind);
    notify(`${label} added to canvas`);
  };
  const sendPrompt = () => {
    if (!prompt.trim()) return;
    const text = prompt.trim();
    setMessages((current) => [...current, { role: "user", text }]);
    setPrompt("");
    setIsThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: "assistant", text: "I mapped that into the current frame. The hierarchy is cleaner, the action is closer to the data, and the next change is ready to inspect." }]);
      setIsThinking(false);
      notify("Assistant updated the frame");
    }, 900);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#090d14] text-[#e7edf7] font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:.35;transform:scale(.88)} 50%{opacity:1;transform:scale(1)} }
        @keyframes rise { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .builder-scroll::-webkit-scrollbar{width:5px;height:5px}.builder-scroll::-webkit-scrollbar-thumb{background:#263448;border-radius:8px}
      `}</style>
      <header className="h-[58px] border-b border-[#1c2939] bg-[#0c121c] flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3 min-w-max">
          <div className="h-8 w-8 rounded-lg bg-[#c4f06b] text-[#0c121c] flex items-center justify-center shadow-[0_0_22px_rgba(196,240,107,.14)]"><Zap className="h-4 w-4 fill-current" /></div>
          <div><div className="font-semibold tracking-[-.03em]">Ultimate <span className="text-[#c4f06b]">Builder</span></div><div className="text-[9px] uppercase tracking-[.2em] text-[#718096]">workspace / orbit</div></div>
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-[#233247] bg-[#111a27] px-3 py-1.5 text-xs text-[#aab8ca]"><GitBranch className="h-3.5 w-3.5 text-[#c4f06b]" /> main <ChevronDown className="h-3 w-3 text-[#64748b]" /></div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => notify("Saved to local workspace")} className="hidden sm:flex items-center gap-2 rounded-md px-3 py-2 text-xs text-[#9aabc0] hover:bg-[#172234] hover:text-white"><Check className="h-3.5 w-3.5" /> Saved</button>
          <button onClick={() => notify("Preview opened in a new frame")} className="flex items-center gap-2 rounded-md border border-[#2a3b51] px-3 py-2 text-xs hover:bg-[#172234]"><Eye className="h-3.5 w-3.5" /> Preview</button>
          <button onClick={() => notify("Deploy checks passed — staging is ready")} className="flex items-center gap-2 rounded-md bg-[#c4f06b] px-3 py-2 text-xs font-bold text-[#0d151b] hover:bg-[#d5fb91]"><Rocket className="h-3.5 w-3.5" /> Ship</button>
          <button onClick={() => notify("Command palette ready")} className="rounded-md p-2 text-[#8191a7] hover:bg-[#172234]"><Command className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-58px)] min-h-[650px]">
        <aside className="hidden lg:flex w-[224px] shrink-0 flex-col border-r border-[#1c2939] bg-[#0c121c]">
          <div className="flex items-center justify-between px-4 pt-5 pb-3"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#718096]">Build kit</span><button onClick={() => notify("Component library opened")} className="text-[#718096] hover:text-[#c4f06b]"><Plus className="h-4 w-4" /></button></div>
          <div className="px-3"><div className="flex items-center gap-2 rounded-md border border-[#1e2c3f] bg-[#111a27] px-2.5 py-2 text-xs text-[#718096]"><Search className="h-3.5 w-3.5" /> Search components <span className="ml-auto text-[9px] text-[#46566d]">⌘ K</span></div></div>
          <div className="px-3 pt-5 space-y-1">{palette.map(({ label, icon: Icon, hint }) => <button key={label} onClick={() => addElement(label)} className="group flex w-full items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-xs text-[#a6b4c7] hover:bg-[#152235] hover:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#24344a] bg-[#101a28] text-[#7890aa] group-hover:border-[#86a652] group-hover:text-[#c4f06b]"><Icon className="h-3.5 w-3.5" /></span><span>{label}</span><span className="ml-auto text-[9px] text-[#52647c]">{hint}</span></button>)}</div>
          <div className="mt-auto border-t border-[#1c2939] p-3 space-y-1"><button onClick={() => notify("Design tokens opened")} className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-xs text-[#8392a6] hover:bg-[#152235]"><Palette className="h-4 w-4" /> Design tokens</button><button onClick={() => notify("Code explorer opened")} className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-xs text-[#8392a6] hover:bg-[#152235]"><Code2 className="h-4 w-4" /> Code explorer</button><div className="mt-3 rounded-lg bg-[#101a26] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#c4f06b]"><CircleDot className="h-3 w-3" /> Runtime healthy</div><div className="mt-2 text-[10px] leading-4 text-[#6d7d91]">React 19 · TypeScript<br />Edge sync · 42ms</div></div></div>
        </aside>

        <main className="min-w-0 flex-1 flex flex-col bg-[#0e1622]">
          <div className="h-12 shrink-0 border-b border-[#1c2939] bg-[#101925] flex items-center justify-between px-3">
            <div className="flex items-center gap-1">{(["Canvas", "Mesh", "Agents", "Integrations"] as View[]).map((item) => <button key={item} onClick={() => setView(item)} className={`flex items-center gap-2 rounded-md px-3 py-2 text-[11px] transition ${view === item ? "bg-[#1e2d40] text-white shadow-inner" : "text-[#74859c] hover:text-[#dbe5f1]"}`}>{item === "Canvas" ? <SquareStack className="h-3.5 w-3.5" /> : item === "Mesh" ? <GitBranch className="h-3.5 w-3.5" /> : item === "Agents" ? <Bot className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />}{item}</button>)}</div>
            <div className="flex items-center gap-3 text-[10px] text-[#728298]"><span className="hidden sm:inline">Zoom 92%</span><Move className="h-3.5 w-3.5" /><MoreHorizontal className="h-4 w-4" /></div>
          </div>
          <div className="builder-scroll flex-1 overflow-auto p-4 sm:p-8" style={{ backgroundImage: "radial-gradient(#203047 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
            {view === "Canvas" && <div className="mx-auto max-w-[880px] rounded-xl border border-[#26364b] bg-[#111c2a] p-3 shadow-[0_20px_70px_rgba(0,0,0,.25)]">
              <div className="mb-3 flex items-center justify-between rounded-lg border border-[#1e3046] bg-[#0f1926] px-3 py-2"><div className="flex items-center gap-2 text-[10px] text-[#8da0b7]"><span className="h-2 w-2 rounded-full bg-[#c4f06b]" style={{ animation: "pulseDot 2s infinite" }} /> live canvas <span className="text-[#43556d]">/</span> overview.tsx</div><div className="flex items-center gap-2"><button onClick={() => notify("Frame duplicated")} className="rounded p-1.5 text-[#708197] hover:bg-[#1c2b3e] hover:text-white"><Copy className="h-3.5 w-3.5" /></button><button onClick={() => notify("Frame settings opened")} className="rounded p-1.5 text-[#708197] hover:bg-[#1c2b3e] hover:text-white"><Settings2 className="h-3.5 w-3.5" /></button></div></div>
              <div className="rounded-lg border border-[#25364a] bg-[#f1f4ee] p-4 sm:p-7 text-[#18222d]">
                {elements.hero && <section onClick={() => setSelected("hero")} className={`relative rounded-lg bg-[#dfead4] p-5 sm:p-7 cursor-pointer border-2 transition ${selected === "hero" ? "border-[#8db35a]" : "border-transparent hover:border-[#b5c9a1]"}`}><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#587143]"><div className="h-5 w-5 rounded bg-[#20362a] text-[#c4f06b] flex items-center justify-center"><Zap className="h-3 w-3 fill-current" /></div> northstar / internal</div><div className="flex gap-1.5"><span className="rounded-full bg-[#c9dcb9] px-2 py-1 text-[9px] text-[#50703f]">Pro workspace</span><span className="rounded-full bg-[#c9dcb9] px-2 py-1 text-[9px] text-[#50703f]">v0.8.4</span></div></div><input value={headline} onChange={(e) => setHeadline(e.target.value)} onClick={(e) => e.stopPropagation()} className="w-full bg-transparent font-['Space_Grotesk',sans-serif] text-3xl sm:text-5xl font-semibold tracking-[-.07em] outline-none text-[#15222b]" /><input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} onClick={(e) => e.stopPropagation()} className="mt-3 w-full bg-transparent text-sm text-[#526657] outline-none" /><div className="mt-7 flex items-center gap-3"><button onClick={() => notify("Workspace tour started")} className="flex items-center gap-2 rounded-md bg-[#20362a] px-4 py-2.5 text-xs font-bold text-[#d9efbc] hover:bg-[#2d4b38]">Open workspace <ArrowUpRight className="h-3.5 w-3.5" /></button><span className="text-[10px] text-[#6c8069]">Last synced 2m ago</span></div></section>}
                {elements.metric && <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">{[["Active builds","12","↑ 18.4%"],["Deploy velocity","3.8h","↓ 26m"],["Team focus","84%","on track"]].map(([label,value,trend], i) => <div onClick={() => setSelected("metric")} key={label} className={`cursor-pointer rounded-lg border bg-[#f8faf6] p-4 transition hover:border-[#9db583] ${selected === "metric" && i === 0 ? "border-[#8db35a] ring-1 ring-[#8db35a]" : "border-[#d8e1d4]"}`}><div className="flex justify-between text-[10px] text-[#6f806f]"><span>{label}</span><Activity className="h-3 w-3 text-[#78985b]" /></div><div className="mt-3 font-['Space_Grotesk'] text-2xl font-semibold tracking-[-.05em]">{value}</div><div className="mt-1 text-[10px] text-[#6b8d59]">{trend}</div></div>)}</div>}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1.1fr_.9fr] gap-3">
                  {elements.activity && <div onClick={() => setSelected("activity")} className={`cursor-pointer rounded-lg border bg-[#f8faf6] p-4 ${selected === "activity" ? "border-[#8db35a] ring-1 ring-[#8db35a]" : "border-[#d8e1d4]"}`}><div className="flex items-center justify-between"><div><div className="text-xs font-bold">Recent activity</div><div className="mt-1 text-[10px] text-[#7a887c]">Signals from the last 24 hours</div></div><button onClick={() => notify("Activity view opened")} className="text-[10px] text-[#6d8f57]">View all</button></div><div className="mt-4 space-y-3">{[["ML","Mina Lee","Merged auth refresh","8m"],["JR","Jules Rivera","Published API schema","42m"],["AK","Ari Kim","Opened a review thread","2h"]].map(([initial,name,action,time]) => <div className="flex items-center gap-3" key={name}><div className="h-7 w-7 rounded-full bg-[#d7e4cf] flex items-center justify-center text-[9px] font-bold text-[#506b48]">{initial}</div><div className="min-w-0 flex-1"><div className="text-[10px] font-semibold">{name}</div><div className="truncate text-[10px] text-[#7c887e]">{action}</div></div><div className="text-[9px] text-[#9aa69a]">{time}</div></div>)}</div></div>}
                  {elements.cta && <div onClick={() => setSelected("cta")} className={`cursor-pointer rounded-lg border bg-[#20362a] p-4 text-[#dceec7] ${selected === "cta" ? "border-[#b7df7a] ring-1 ring-[#b7df7a]" : "border-[#20362a]"}`}><div className="flex h-full min-h-[150px] flex-col justify-between"><div><div className="flex items-center gap-2 text-[10px] uppercase tracking-[.14em] text-[#aace82]"><WandSparkles className="h-3.5 w-3.5" /> build with intent</div><div className="mt-4 text-xl font-semibold tracking-[-.04em]">Turn a thought into a system.</div><p className="mt-2 text-[10px] leading-4 text-[#acc29a]">Describe the sharp edge. We’ll find the useful shape.</p></div><button onClick={() => { setPrompt("Create a focused onboarding flow for this product"); notify("Prompt added to assistant"); }} className="mt-4 flex items-center justify-between rounded-md bg-[#c4f06b] px-3 py-2 text-[10px] font-bold text-[#18251d] hover:bg-[#d5fb91]">Start with AI <Sparkles className="h-3.5 w-3.5" /></button></div></div>}
                </div>
              </div>
            </div>}
            {view === "Mesh" && <div className="mx-auto max-w-[880px] rounded-xl border border-[#26364b] bg-[#101a28] p-6 min-h-[500px]"><div className="flex items-center justify-between"><div><div className="font-semibold">Product mesh</div><p className="mt-1 text-xs text-[#71839b]">How your interface, data and agents connect.</p></div><button onClick={() => notify("Node added to mesh")} className="flex items-center gap-2 rounded-md bg-[#c4f06b] px-3 py-2 text-xs font-bold text-[#162019]"><Plus className="h-3.5 w-3.5" /> Add node</button></div><div className="relative mt-8 h-[350px] overflow-hidden rounded-lg border border-[#213349]" style={{ backgroundImage: "linear-gradient(#1b2b40 1px,transparent 1px),linear-gradient(90deg,#1b2b40 1px,transparent 1px)", backgroundSize: "40px 40px" }}>{[["UI Shell", "top-[24%] left-[14%]", Layers3], ["Data layer", "top-[55%] left-[39%]", Database], ["Agent swarm", "top-[25%] right-[17%]", Bot], ["Edge API", "bottom-[13%] right-[30%]", Globe2]].map(([label,pos,Icon]) => <div key={label as string} className={`absolute ${pos as string} flex w-32 flex-col items-center gap-2 rounded-xl border border-[#354d68] bg-[#152337] p-4 shadow-xl`}><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#21364a] text-[#c4f06b]"><Icon className="h-4 w-4" /></div><span className="text-xs">{label as string}</span><span className="text-[9px] text-[#6e8299]">connected</span></div>)}</div></div>}
            {view === "Agents" && <div className="mx-auto max-w-[880px]"><div className="mb-4 flex items-end justify-between"><div><div className="text-xl font-semibold">Agent room</div><p className="mt-1 text-xs text-[#71839b]">Specialists working against the same product context.</p></div><button onClick={() => notify("New agent provisioned")} className="flex items-center gap-2 rounded-md border border-[#344a61] px-3 py-2 text-xs hover:bg-[#172639]"><Plus className="h-3.5 w-3.5" /> Provision agent</button></div><div className="grid gap-3 sm:grid-cols-2">{[["Aster","Product architect","Mapping flows and hierarchy", "Working"],["Relay","Frontend engineer","Building the current frame","Working"],["Lumen","Visual QA","Watching spacing and contrast","Idle"],["Patch","Release operator","Checking staging readiness","Idle"]].map(([name,role,task,status]) => <div key={name} className="rounded-xl border border-[#263a51] bg-[#111d2b] p-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-[#20362a] flex items-center justify-center text-[#c4f06b]"><Bot className="h-5 w-5" /></div><div><div className="text-sm font-semibold">{name}</div><div className="text-[10px] text-[#71839b]">{role}</div></div><span className={`ml-auto rounded-full px-2 py-1 text-[9px] ${status === "Working" ? "bg-[#233c2b] text-[#b5df7a]" : "bg-[#202d3d] text-[#8495a9]"}`}>{status}</span></div><div className="mt-4 text-xs text-[#a5b4c6]">{task}</div><div className="mt-4 h-1 rounded bg-[#1e2c3e]"><div className={`h-1 rounded bg-[#9bc75d] ${status === "Working" ? "w-[68%]" : "w-[22%]"}`} /></div></div>)}</div></div>}
            {view === "Integrations" && <div className="mx-auto max-w-[880px]"><div className="mb-5"><div className="text-xl font-semibold">Integrations</div><p className="mt-1 text-xs text-[#71839b]">Bring the rest of your stack into the frame.</p></div><div className="grid gap-3 sm:grid-cols-2">{[["GitHub","Repository connected","12 branches synced",GitBranch],["Figma","Design source connected","Last imported 18m ago",Figma],["Postgres","Database connected","4 tables available",Database],["Vercel","Deployment target","Staging environment ready",Rocket]].map(([name,state,meta,Icon], index) => <div key={index} className="flex items-center gap-3 rounded-xl border border-[#263a51] bg-[#111d2b] p-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1b2a3d] text-[#c4f06b]"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="text-sm font-semibold">{name as string}</div><div className="text-[10px] text-[#a7b5c6]">{state as string}</div><div className="mt-1 text-[9px] text-[#667b92]">{meta as string}</div></div><button onClick={() => notify(`${name as string} settings opened`)} className="rounded-md border border-[#30445a] p-2 text-[#7e91a8] hover:text-white"><Settings2 className="h-3.5 w-3.5" /></button></div>)}</div></div>}
          </div>
          <div className="border-t border-[#1c2939] bg-[#0c121c] p-3 sm:p-4"><div className="mx-auto max-w-[880px]"><div className="mb-2 flex items-center gap-2 text-[10px] text-[#8293a9]"><Sparkles className="h-3.5 w-3.5 text-[#c4f06b]" /> Builder assistant <span className="text-[#4b5c71]">· context: {visibleCount} active elements</span>{isThinking && <LoaderCircle className="ml-1 h-3.5 w-3.5 animate-spin text-[#c4f06b]" />}</div><div className="rounded-lg border border-[#293b51] bg-[#111b29]"><div className="max-h-24 overflow-auto px-3 pt-2 builder-scroll">{messages.slice(-2).map((message, index) => <div key={`${message.role}-${index}`} className={`mb-2 text-[11px] leading-4 ${message.role === "user" ? "text-[#c4f06b]" : "text-[#aab9c9]"}`}><span className="mr-2 text-[9px] uppercase tracking-[.12em] text-[#5d7189]">{message.role === "user" ? "you" : "ai"}</span>{message.text}</div>)}</div><div className="flex items-center gap-2 border-t border-[#223247] p-2"><input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendPrompt()} placeholder="Ask for a sharper layout, a new flow, or a connected data source..." className="min-w-0 flex-1 bg-transparent px-1 text-xs text-white outline-none placeholder:text-[#5e7188]" /><button onClick={sendPrompt} disabled={isThinking || !prompt.trim()} className="flex items-center gap-2 rounded-md bg-[#c4f06b] px-3 py-2 text-[10px] font-bold text-[#162019] disabled:opacity-40"><Send className="h-3.5 w-3.5" /> Ask</button></div></div></div></div>
        </main>

        <aside className="hidden xl:flex w-[252px] shrink-0 flex-col border-l border-[#1c2939] bg-[#0c121c]">
          <div className="flex items-center justify-between border-b border-[#1c2939] px-4 py-4"><div className="flex items-center gap-2 text-xs font-semibold"><PanelRight className="h-4 w-4 text-[#c4f06b]" /> Inspector</div><button onClick={() => notify("Inspector detached")} className="text-[#718096] hover:text-white"><MoreHorizontal className="h-4 w-4" /></button></div>
          {selected ? <div className="builder-scroll overflow-auto p-4"><div className="mb-5 flex items-center justify-between"><div><div className="text-sm font-semibold capitalize">{selected} block</div><div className="mt-1 text-[10px] text-[#718096]">Selected on canvas</div></div><button onClick={() => { setElements((current) => ({ ...current, [selected]: false })); setSelected("hero"); notify("Element removed"); }} className="rounded-md p-2 text-[#8191a7] hover:bg-[#341e29] hover:text-[#ff8f9a]"><Trash2 className="h-3.5 w-3.5" /></button></div><div className="space-y-5"><div><label className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-[#718096]">Layout</label><div className="grid grid-cols-3 gap-1"><button className="rounded border border-[#8db35a] bg-[#20362a] py-2 text-[10px] text-[#c4f06b]">Flow</button><button onClick={() => notify("Grid layout selected")} className="rounded border border-[#28394d] py-2 text-[10px] text-[#8091a8] hover:bg-[#172539]">Grid</button><button onClick={() => notify("Absolute layout selected")} className="rounded border border-[#28394d] py-2 text-[10px] text-[#8091a8] hover:bg-[#172539]">Free</button></div></div><div><label className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-[#718096]">Spacing</label><div className="grid grid-cols-2 gap-2"><div className="rounded border border-[#28394d] bg-[#111a27] p-2"><div className="text-[9px] text-[#718096]">Padding</div><div className="mt-1 text-xs">24 px</div></div><div className="rounded border border-[#28394d] bg-[#111a27] p-2"><div className="text-[9px] text-[#718096]">Radius</div><div className="mt-1 text-xs">12 px</div></div></div></div><div><label className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-[#718096]">Style token</label><div className="flex items-center justify-between rounded border border-[#28394d] bg-[#111a27] px-3 py-2 text-xs"><span>surface / sage-100</span><ChevronDown className="h-3.5 w-3.5 text-[#718096]" /></div></div><div className="rounded-lg border border-[#26394e] bg-[#111b29] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#c4f06b]"><Sparkles className="h-3.5 w-3.5" /> AI suggestion</div><p className="mt-2 text-[10px] leading-4 text-[#8496aa]">This block has strong contrast. Consider adding a compact status label to clarify its state.</p><button onClick={() => notify("Suggestion applied")} className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-[#c4f06b] hover:text-white">Apply suggestion <ArrowUpRight className="h-3 w-3" /></button></div></div></div> : <div className="flex h-full items-center justify-center p-6 text-center text-xs text-[#718096]">Select an element on the canvas to inspect it.</div>}
        </aside>
      </div>
      {toast && <div className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-lg border border-[#3c5737] bg-[#15251c] px-4 py-3 text-xs text-[#d8efbd] shadow-xl" style={{ animation: "rise .2s ease-out" }}><Check className="h-4 w-4 text-[#c4f06b]" /> {toast}</div>}
    </div>
  );
}