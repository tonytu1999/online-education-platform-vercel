import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { parentTabs } from "@/components/mobile/parent-tabs";
import { subjects } from "@/lib/mock-data";
import { PermissionNotice } from "@/components/cards/PermissionNotice";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/parent/subjects")({
  component: ParentSubjects,
});

function ParentSubjects() {
  const t = useT();
  return (
    <MobileShell title={t("ps.title")} tabs={parentTabs}>
      <div className="space-y-3">
        {subjects.map((s) => {
          const total = s.chapters.reduce((a, c) => a + c.points.length, 0);
          const mastered = s.chapters.reduce(
            (a, c) => a + c.points.filter((p) => p.mastery === "mastered").length,
            0,
          );
          const partial = s.chapters.reduce(
            (a, c) => a + c.points.filter((p) => p.mastery === "partial").length,
            0,
          );
          const weak = total - mastered - partial;
          const pct = Math.round((mastered / total) * 100);
          return (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{s.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{t(`subj.${s.id}`)}</h3>
                  <p className="text-xs text-muted-foreground">{t("ps.points", { n: total })}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{pct}%</p>
                  <p className="text-[10px] text-muted-foreground">{t("ps.masteredLabel")}</p>
                </div>
              </div>
              <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                <div className="bg-mastered" style={{ width: `${(mastered / total) * 100}%` }} />
                <div className="bg-partial" style={{ width: `${(partial / total) * 100}%` }} />
                <div className="bg-weak" style={{ width: `${(weak / total) * 100}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-mastered" />{t("ps.legend.mastered", { n: mastered })}</span>
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-partial" />{t("ps.legend.partial", { n: partial })}</span>
                <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-weak" />{t("ps.legend.weak", { n: weak })}</span>
              </div>
            </div>
          );
        })}

        <PermissionNotice text={t("ps.permission")} />
      </div>
    </MobileShell>
  );
}
