import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { studentTabs } from "@/components/mobile/student-tabs";
import { Camera, FileEdit, Play, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/student/test")({
  component: TestHome,
});

function TestHome() {
  const lastScore = useAppStore((s) => s.lastScore);
  const t = useT();

  const entries = [
    { to: "/student/test/quiz", label: t("test.start"), desc: t("test.startDesc"), Icon: Play, tint: "bg-primary text-primary-foreground" },
    { to: "/student/test/score", label: t("test.scoreEntry"), desc: t("test.scoreEntryDesc"), Icon: FileEdit, tint: "bg-mastered-soft text-mastered" },
    { to: "/student/test/wrong", label: t("test.wrongEntry"), desc: t("test.wrongEntryDesc"), Icon: Camera, tint: "bg-partial-soft text-partial" },
  ];

  return (
    <MobileShell title={t("test.title")} tabs={studentTabs}>
      {lastScore !== null && (
        <Link
          to="/student/test/result"
          className="mb-4 block rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-4 text-primary-foreground shadow-md"
        >
          <p className="text-xs opacity-80">{t("test.lastScore")}</p>
          <p className="mt-1 text-3xl font-bold">{lastScore}<span className="text-sm opacity-80"> / 100</span></p>
          <p className="mt-1 text-xs opacity-90">{t("test.viewDetail")}</p>
        </Link>
      )}

      <div className="space-y-3">
        {entries.map((e) => {
          const Icon = e.Icon;
          return (
            <Link
              key={e.to}
              to={e.to}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform active:scale-[0.98]"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${e.tint}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{e.label}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{e.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </MobileShell>
  );
}
