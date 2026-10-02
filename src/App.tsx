import { useEffect, useMemo, useState } from "react";
import { Bot, Brain, Camera, ChevronDown, Command, Github, Grip, Mic, Paperclip, Settings, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

const features = [
  { icon: Brain, label: "AI", desc: "Chat & reasoning" },
  { icon: Camera, label: "Vision", desc: "Screen context" },
  { icon: Command, label: "Control", desc: "PC actions" },
  { icon: Github, label: "Dev", desc: "Projects & agents" }
];

export default function App() {
  const [expanded, setExpanded] = useState(true);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hey. I’m Cursai. What are we building?" }
  ]);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const status = useMemo(() => thinking ? "Thinking" : "Ready", [thinking]);

  async function ask() {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text }]);
    setThinking(true);
    const result = await window.cursai.ai.ask({ message: text });
    setMessages(m => [...m, {
      role: "assistant",
      text: result.success ? (result.text || "Done.") : (result.error || "Something went wrong.")
    }]);
    setThinking(false);
  }

  return (
    <main className={`shell ${expanded ? "expanded" : "collapsed"}`}>
      <div className="ambient" style={{ left: cursor.x * 0.03, top: cursor.y * 0.02 }} />
      <header className="topbar">
        <div className="brand">
          <div className="avatar"><Bot size={20} /></div>
          <div>
            <strong>CURSAI</strong>
            <span>{status}</span>
          </div>
        </div>
        <div className="actions">
          <button title="Minimize" onClick={() => setExpanded(false)}><ChevronDown size={17}/></button>
          <button title="Close" onClick={() => window.cursai.window.hide()}><X size={17}/></button>
        </div>
      </header>

      {!expanded ? (
        <button className="orb" onClick={() => setExpanded(true)} aria-label="Open Cursai">
          <Sparkles size={23}/>
        </button>
      ) : (
        <>
          <section className="hero">
            <div className="character">
              <div className="eye left" /><div className="eye right" />
              <div className="mouth" />
              <div className="character-glow" />
            </div>
            <div>
              <h1>What can I do?</h1>
              <p>Your always-on Windows AI companion.</p>
            </div>
          </section>

          <section className="feature-grid">
            {features.map(({ icon: Icon, label, desc }) => (
              <button key={label} className="feature">
                <Icon size={17}/><span><b>{label}</b><small>{desc}</small></span>
              </button>
            ))}
          </section>

          <section className="chat">
            <div className="messages">
              {messages.slice(-5).map((m, i) => (
                <div key={i} className={`message ${m.role}`}>{m.text}</div>
              ))}
              {thinking && <div className="message assistant pulse">Thinking…</div>}
            </div>
            <div className="composer">
              <button title="Attach"><Paperclip size={18}/></button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") ask(); }}
                placeholder="Ask Cursai anything…"
              />
              <button title="Voice"><Mic size={18}/></button>
              <button className="send" onClick={ask} title="Send"><Sparkles size={17}/></button>
            </div>
          </section>

          <footer>
            <span><Grip size={14}/> Ctrl + Space</span>
            <button title="Settings"><Settings size={15}/></button>
          </footer>
        </>
      )}
    </main>
  );
}
