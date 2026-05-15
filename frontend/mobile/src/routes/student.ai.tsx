import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, Fragment } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { studentTabs } from "@/components/mobile/student-tabs";
import { sensitiveKeywords, subjects } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { Send, Mic, Sparkles, MessageSquare, ShieldAlert, History, Plus, X, Trash2 } from "lucide-react";

export const Route = createFileRoute("/student/ai")({
  component: AIChat,
});

interface Msg { role: "user" | "ai"; text: string; blocked?: boolean }

function AIChat() {
  const t = useT();
  const { aiSessions, saveSession, removeSession } = useAppStore();
  const [mode, setMode] = useState<"free" | "guided">("guided");
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(() => `s_${Date.now()}`);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: t("ai.greet.guided") },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  // Build KP keyword index from current language
  const kpIndex = subjects.flatMap((s) =>
    s.chapters.flatMap((c) =>
      c.points.map((p) => ({
        name: t(`kp.${p.id}.n`),
        subject: s.id,
        chapter: c.id,
      })),
    ),
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Persist session whenever messages change (after first user msg)
  useEffect(() => {
    const userMsgs = messages.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;
    saveSession({
      id: sessionId,
      title: userMsgs[0].text.slice(0, 20),
      mode,
      createdAt: Date.now(),
      messages,
    });
  }, [messages, sessionId, mode, saveSession]);

  const switchMode = (m: "free" | "guided") => {
    setMode(m);
    setMessages([{ role: "ai", text: t(m === "guided" ? "ai.greet.guided" : "ai.greet.free") }]);
    setSessionId(`s_${Date.now()}`);
  };

  const newChat = () => {
    setMessages([{ role: "ai", text: t(mode === "guided" ? "ai.greet.guided" : "ai.greet.free") }]);
    setSessionId(`s_${Date.now()}`);
    setHistoryOpen(false);
  };

  const loadSession = (sid: string) => {
    const s = aiSessions.find((x) => x.id === sid);
    if (!s) return;
    setMessages(s.messages);
    setMode(s.mode);
    setSessionId(s.id);
    setHistoryOpen(false);
  };

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    const blocked = sensitiveKeywords.some((k) => text.includes(k));
    setMessages((m) => [...m, { role: "user", text }]);
    setTimeout(() => {
      if (blocked) {
        setMessages((m) => [...m, { role: "ai", blocked: true, text: t("ai.blocked") }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "ai", text: t(mode === "guided" ? "ai.reply.guided" : "ai.reply.free") },
        ]);
      }
    }, 600);
  };

  const tryVoice = () => alert(t("ai.voiceAlert"));

  // Render text with KP keywords highlighted as Links
  const renderText = (text: string) => {
    const matches: { start: number; end: number; subject: string; chapter: string; name: string }[] = [];
    for (const kp of kpIndex) {
      let i = 0;
      while ((i = text.indexOf(kp.name, i)) !== -1) {
        matches.push({ start: i, end: i + kp.name.length, ...kp });
        i += kp.name.length;
      }
    }
    matches.sort((a, b) => a.start - b.start);
    // Drop overlaps
    const filtered: typeof matches = [];
    let lastEnd = -1;
    for (const m of matches) {
      if (m.start >= lastEnd) {
        filtered.push(m);
        lastEnd = m.end;
      }
    }
    if (filtered.length === 0) return text;
    const parts: React.ReactNode[] = [];
    let pos = 0;
    filtered.forEach((m, i) => {
      if (pos < m.start) parts.push(<Fragment key={`t${i}`}>{text.slice(pos, m.start)}</Fragment>);
      parts.push(
        <Link
          key={`l${i}`}
          to="/student/learn/$subject/$chapter"
          params={{ subject: m.subject, chapter: m.chapter }}
          className="font-semibold text-primary underline underline-offset-2"
        >
          {m.name}
        </Link>,
      );
      pos = m.end;
    });
    if (pos < text.length) parts.push(<Fragment key="tail">{text.slice(pos)}</Fragment>);
    return parts;
  };

  // Mode-driven visual differentiation
  const modeBg = mode === "guided"
    ? "bg-gradient-to-b from-primary-soft/40 to-background"
    : "bg-gradient-to-b from-mastered-soft/40 to-background";

  return (
    <MobileShell
      title={t("ai.title")}
      tabs={studentTabs}
      noPad
      right={
        <div className="flex items-center gap-1">
          <button onClick={newChat} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="new">
            <Plus className="h-4 w-4" />
          </button>
          <button onClick={() => setHistoryOpen(true)} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted" aria-label="history">
            <History className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className={`min-h-full ${modeBg}`}>
        <div className="border-b border-border bg-background/80 px-4 py-2 backdrop-blur">
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {[
              { k: "guided", label: t("ai.mode.guided"), Icon: Sparkles },
              { k: "free", label: t("ai.mode.free"), Icon: MessageSquare },
            ].map(({ k, label, Icon }) => (
              <button
                key={k}
                onClick={() => switchMode(k as "free" | "guided")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  mode === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          <p className={`mt-1.5 px-1 text-[11px] ${mode === "guided" ? "text-primary" : "text-mastered"}`}>
            {t(mode === "guided" ? "ai.guidedHint" : "ai.freeHint")}
          </p>
        </div>

        <div className="space-y-3 px-4 py-4 pb-32">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                  m.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : m.blocked
                      ? "rounded-bl-md border border-destructive/30 bg-weak-soft text-weak"
                      : "rounded-bl-md border border-border bg-card text-foreground"
                }`}
              >
                {m.blocked && <ShieldAlert className="mb-1 inline h-3.5 w-3.5" />}
                {m.role === "ai" && !m.blocked ? renderText(m.text) : m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <div className="fixed bottom-[68px] left-1/2 z-10 w-full max-w-[420px] -translate-x-1/2 border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <button onClick={tryVoice} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Mic className="h-4 w-4" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t("ai.placeholder")}
            className="flex-1 rounded-full border border-input bg-muted px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button onClick={send} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 z-30 flex" onClick={() => setHistoryOpen(false)}>
          <div className="flex-1 bg-black/40" />
          <div
            className="ml-auto flex h-full w-[78%] max-w-[320px] flex-col bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">{t("ai.history")}</h3>
              <button onClick={() => setHistoryOpen(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <button
              onClick={newChat}
              className="m-3 flex items-center justify-center gap-2 rounded-xl bg-primary py-2 text-xs font-medium text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("ai.newChat")}
            </button>
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {aiSessions.length === 0 ? (
                <p className="mt-8 text-center text-xs text-muted-foreground">{t("ai.noHistory")}</p>
              ) : (
                <ul className="space-y-2">
                  {aiSessions.map((s) => (
                    <li
                      key={s.id}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                        s.id === sessionId ? "border-primary bg-primary-soft" : "border-border bg-card"
                      }`}
                    >
                      <button onClick={() => loadSession(s.id)} className="flex-1 text-left">
                        <p className="line-clamp-1 text-xs font-medium">{s.title}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {t(`ai.mode.${s.mode}`)} · {new Date(s.createdAt).toLocaleString()}
                        </p>
                      </button>
                      <button onClick={() => removeSession(s.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
