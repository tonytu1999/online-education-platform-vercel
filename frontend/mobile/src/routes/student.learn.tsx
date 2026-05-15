import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { studentTabs } from "@/components/mobile/student-tabs";
import { subjects } from "@/lib/mock-data";
import { ChevronRight, Flame } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/student/learn")({
  component: LearnHome,
});

function LearnHome() {
  const nickname = useAppStore((s) => s.nickname);
  const account = useAppStore((s) => s.account);
  const t = useT();
  const displayName = nickname || account || t("me.student.user");
  return (
    <MobileShell tabs={studentTabs} noPad>
      <div className="bg-gradient-to-br from-primary to-primary/70 px-5 pb-8 pt-12 text-primary-foreground">
        <p className="text-xs opacity-80">{t("learn.hello")}</p>
        <h1 className="mt-1 text-2xl font-bold">{displayName} 👋</h1>
        <div className="mt-4 flex items-center gap-2 text-xs opacity-90">
          <Flame className="h-4 w-4" />
          <span>{t("learn.streak")}</span>
        </div>
      </div>

      <div className="-mt-4 rounded-t-3xl bg-background px-4 pb-4 pt-5">
        <h2 className="mb-3 text-base font-semibold">{t("learn.chooseSubject")}</h2>
        <div className="space-y-3">
          {subjects.map((s) => {
            const total = s.chapters.reduce((a, c) => a + c.points.length, 0);
            const mastered = s.chapters.reduce(
              (a, c) => a + c.points.filter((p) => p.mastery === "mastered").length,
              0,
            );
            const pct = Math.round((mastered / total) * 100);
            return (
              <Link
                key={s.id}
                to="/student/learn/$subject"
                params={{ subject: s.id }}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform active:scale-[0.99]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
                  {s.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{t(`subj.${s.id}`)}</h3>
                  <p className="text-xs text-muted-foreground">
                    {t("learn.chaptersAndPoints", { c: s.chapters.length, p: total })}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-primary">{pct}%</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
