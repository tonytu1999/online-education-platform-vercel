import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useT } from "@/lib/i18n";
import { Send } from "lucide-react";

export const Route = createFileRoute("/student/treehole")({
  component: TreeHole,
});

interface Msg { role: "user" | "tree"; text: string }

function TreeHole() {
  const t = useT();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([{ role: "tree", text: t("tree.greet") }]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Wipe on unmount (ephemeral)
  useEffect(() => {
    return () => setMessages([]);
  }, []);

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    const replies = [t("tree.reply1"), t("tree.reply2"), t("tree.reply3")];
    setTimeout(() => {
      setMessages((m) => [...m, { role: "tree", text: replies[Math.floor(Math.random() * 3)] }]);
    }, 700);
  };

  return (
    <MobileShell title={t("tree.title")} back noPad>
      <div className="relative flex min-h-full flex-col bg-gradient-to-b from-mastered-soft/60 via-background to-background">
        {/* Tree SVG with sway animation */}
        <div className="pointer-events-none relative h-44 overflow-hidden">
          <svg viewBox="0 0 200 180" className="absolute left-1/2 top-2 h-full w-[260px] -translate-x-1/2">
            <defs>
              <radialGradient id="leaf" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="oklch(0.78 0.16 145)" />
                <stop offset="100%" stopColor="oklch(0.55 0.15 150)" />
              </radialGradient>
            </defs>
            {/* Trunk */}
            <path d="M95 175 L100 110 L105 175 Z" fill="oklch(0.4 0.06 60)" />
            <path d="M100 130 L80 100" stroke="oklch(0.4 0.06 60)" strokeWidth="4" strokeLinecap="round" />
            <path d="M100 120 L122 95" stroke="oklch(0.4 0.06 60)" strokeWidth="4" strokeLinecap="round" />
            {/* Crown — three layered "leaf" groups, each swaying */}
            <g className="tree-sway tree-sway-1" style={{ transformOrigin: "100px 130px" }}>
              <circle cx="100" cy="80" r="42" fill="url(#leaf)" />
            </g>
            <g className="tree-sway tree-sway-2" style={{ transformOrigin: "100px 130px" }}>
              <circle cx="70" cy="95" r="28" fill="url(#leaf)" opacity="0.9" />
            </g>
            <g className="tree-sway tree-sway-3" style={{ transformOrigin: "100px 130px" }}>
              <circle cx="130" cy="95" r="30" fill="url(#leaf)" opacity="0.9" />
            </g>
          </svg>
          {/* Falling leaves */}
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="leaf-fall absolute text-base"
              style={{
                left: `${20 + i * 22}%`,
                animationDelay: `${i * 1.6}s`,
                animationDuration: `${7 + i}s`,
              }}
            >
              🍃
            </span>
          ))}
        </div>

        <div className="mx-4 mb-2 rounded-xl border border-mastered/30 bg-mastered-soft/60 px-3 py-2 text-[11px] text-mastered">
          {t("tree.notice")}
        </div>

        <div className="flex-1 space-y-3 px-4 py-3 pb-28">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                  m.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-mastered/30 bg-card text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="fixed bottom-0 left-1/2 z-10 w-full max-w-[420px] -translate-x-1/2 border-t border-border bg-background/95 px-3 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("tree.placeholder")}
              className="flex-1 rounded-full border border-input bg-muted px-4 py-2.5 text-sm outline-none focus:border-mastered"
            />
            <button onClick={send} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mastered text-primary-foreground">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
