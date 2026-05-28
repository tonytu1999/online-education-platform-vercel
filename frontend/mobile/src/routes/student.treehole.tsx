import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { studentTabs } from "@/components/mobile/student-tabs";
import { apiCreateChatSession, apiChat } from "@/lib/api";
import { useT, useLang } from "@/lib/i18n";
import { getMentalPrompt } from "@/lib/prompts";

export const Route = createFileRoute("/student/treehole")({
  component: TreeHole,
});

interface Msg {
  role: "user" | "tree";
  text: string;
  time: number;
}

function TreeHole() {
  const t = useT();
  const lang = useLang();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [started, setStarted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const wipe = useCallback(() => setMessages([]), []);
  useEffect(() => {
    const unsub = router.subscribe("onBeforeLoad", wipe);
    return () => {
      unsub();
      wipe();
    };
  }, [router, wipe]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const addGreeting = () => {
    if (started) return;
    setStarted(true);
    setMessages([
      { role: "tree", text: t("tree.greet"), time: Date.now() },
    ]);
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    if (!started) addGreeting();
    const text = input.trim();
    setInput("");
    const now = Date.now();
    setMessages((m) => [...m, { role: "user", text, time: now }]);
    setSending(true);

    try {
      let currentSessionId = sessionId;
      // Create a Mental session on first message
      if (!currentSessionId) {
        const res = await apiCreateChatSession({
          type: "Mental",
          systemPrompt: getMentalPrompt(lang),
        });
        currentSessionId = res.session.sessionId || res.session.id;
        setSessionId(currentSessionId);
      }

      const res = await apiChat({ sessionId: currentSessionId, message: text });
      setMessages((m) => [
        ...m,
        { role: "tree", text: res.response, time: Date.now() },
      ]);
    } catch {
      // Fallback on error
      setMessages((m) => [
        ...m,
        {
          role: "tree",
          text: "嗯，我在听。风会把烦恼带走的，慢慢来。🌿",
          time: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <MobileShell title={t("tree.title")} tabs={studentTabs}>
      {/* Tree illustration card */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-mastered/10 bg-gradient-to-br from-[oklch(0.96_0.04_150)] to-[oklch(0.97_0.02_140)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mastered-soft/60">
            <svg
              width="32"
              height="32"
              viewBox="0 0 28 28"
              fill="none"
              className="tree-sway"
              style={{ transformOrigin: "center bottom" }}
            >
              <path
                d="M14 22V12"
                stroke="oklch(0.40_0.06_55)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M14 14C10 14 7 11 7 7.5C7 4 10 2 14 2C18 2 21 4 21 7.5C21 11 18 14 14 14Z"
                fill="oklch(0.62_0.16_150)"
              />
              <path
                d="M14 17C11 17 8.5 14.5 8.5 11.5C8.5 8.5 11 7 14 7C17 7 19.5 8.5 19.5 11.5C19.5 14.5 17 17 14 17Z"
                fill="oklch(0.70_0.14_145)"
                opacity="0.7"
              />
              <ellipse
                cx="14"
                cy="6"
                rx="4"
                ry="3.5"
                fill="oklch(0.78_0.12_140)"
                opacity="0.5"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground/70">
              {t("tree.notice")}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3 pb-24">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 text-2xl opacity-25">🌿</div>
            <p className="text-xs text-muted-foreground/35">
              {t("tree.placeholder")}
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i}>
            {i > 0 && m.time - messages[i - 1].time > 300000 && (
              <div className="my-3 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground/25">
                  {formatTime(m.time)}
                </span>
              </div>
            )}

            {m.role === "tree" ? (
              <div className="flex justify-start">
                <div className="max-w-[82%]">
                  <div className="rounded-2xl rounded-tl-md border border-mastered/10 bg-card px-4 py-3 shadow-sm">
                    <p className="text-sm leading-[1.7] text-foreground/75">
                      {m.text}
                    </p>
                  </div>
                  <p className="mt-1 ml-1 text-[10px] text-muted-foreground/20">
                    {formatTime(m.time)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="max-w-[82%]">
                  <div className="rounded-2xl rounded-tr-md bg-primary px-4 py-3 shadow-sm shadow-primary/10">
                    <p className="text-sm leading-[1.7] text-primary-foreground/90">
                      {m.text}
                    </p>
                  </div>
                  <p className="mt-1 mr-1 text-right text-[10px] text-muted-foreground/20">
                    {formatTime(m.time)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start">
            <div className="max-w-[82%]">
              <div className="rounded-2xl rounded-tl-md border border-mastered/10 bg-card px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-mastered/60 animate-bounce [animation-delay:0ms]" />
                  <span className="inline-block h-2 w-2 rounded-full bg-mastered/60 animate-bounce [animation-delay:150ms]" />
                  <span className="inline-block h-2 w-2 rounded-full bg-mastered/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-[52px] left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 px-3 pb-2 pt-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border/50 bg-background/95 px-3 py-2 shadow-lg shadow-black/[0.03] backdrop-blur-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={addGreeting}
            placeholder={t("tree.placeholder")}
            rows={1}
            disabled={sending}
            className="ui-sans max-h-24 min-h-[36px] flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/30 disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/15 transition-all active:scale-90 disabled:opacity-30 disabled:shadow-none"
          >
            {sending ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
