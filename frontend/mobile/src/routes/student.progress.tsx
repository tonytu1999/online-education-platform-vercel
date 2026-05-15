import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { studentTabs } from "@/components/mobile/student-tabs";
import { subjects } from "@/lib/mock-data";
import { MasteryBadge } from "@/components/cards/MasteryBadge";
import { useT } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/student/progress")({
  component: ProgressPage,
});

function ProgressPage() {
  const [open, setOpen] = useState<string | null>("math");
  const t = useT();
  return (
    <MobileShell title={t("progress.title")} tabs={studentTabs}>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Stat label={t("progress.totalMastery")} value="68%" tint="primary" />
        <Stat label={t("progress.weekTime")} value="3.5h" tint="mastered" />
        <Stat label={t("progress.completion")} value="72%" tint="partial" />
      </div>

      <div className="space-y-3">
        {subjects.map((s) => {
          const isOpen = open === s.id;
          const total = s.chapters.reduce((a, c) => a + c.points.length, 0);
          const mastered = s.chapters.reduce(
            (a, c) => a + c.points.filter((p) => p.mastery === "mastered").length,
            0,
          );
          return (
            <div key={s.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <button
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{t(`subj.${s.id}`)}</h3>
                  <p className="text-xs text-muted-foreground">{t("progress.masteredOf", { m: mastered, t: total })}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-border bg-muted/30 p-3">
                  {s.chapters.map((c) => (
                    <div key={c.id}>
                      <p className="mb-1.5 px-1 text-xs font-semibold text-muted-foreground">{t(`ch.${s.id}.${c.id}`)}</p>
                      <div className="space-y-1">
                        {c.points.map((p) => (
                          <div key={p.id} className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-sm">
                            <span>{t(`kp.${p.id}.n`)}</span>
                            <MasteryBadge level={p.mastery} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MobileShell>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint: "primary" | "mastered" | "partial" }) {
  const map = { primary: "text-primary", mastered: "text-mastered", partial: "text-partial" };
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
      <p className={`text-lg font-bold ${map[tint]}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
