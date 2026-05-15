import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useAppStore } from "@/lib/store";
import { TrendChart } from "@/components/cards/TrendChart";
import { trendData } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";
import { TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/student/test/result")({
  component: ResultPage,
});

function ResultPage() {
  const score = useAppStore((s) => s.lastScore) ?? 0;
  const t = useT();
  const levelKey = score >= 80 ? "excellent" : score >= 60 ? "good" : "needWork";
  const tone =
    score >= 80
      ? { bg: "bg-mastered-soft", text: "text-mastered" }
      : score >= 60
        ? { bg: "bg-partial-soft", text: "text-partial" }
        : { bg: "bg-weak-soft", text: "text-weak" };

  const changes = [
    { pid: "quad", from: "partial", to: "mastered", up: true },
    { pid: "linear", from: "mastered", to: "mastered", up: false },
    { pid: "expo", from: "weak", to: "partial", up: true },
  ];

  return (
    <MobileShell title={t("test.result.title")} back>
      <div className={`rounded-2xl ${tone.bg} p-6 text-center`}>
        <p className="text-xs text-muted-foreground">{t("test.result.thisScore")}</p>
        <p className={`mt-2 text-5xl font-bold ${tone.text}`}>{score}</p>
        <p className={`mt-2 text-sm font-medium ${tone.text}`}>{t(`test.result.level.${levelKey}`)}</p>
      </div>

      <h3 className="mb-2 mt-5 text-sm font-semibold">{t("test.result.changes")}</h3>
      <div className="space-y-2">
        {changes.map((p) => (
          <div key={p.pid} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <span className="text-sm font-medium">{t(`kp.${p.pid}.n`)}</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t(`mastery.${p.from}`)}</span>
              <ArrowRight className="h-3 w-3" />
              <span className={p.up ? "font-semibold text-mastered" : ""}>{t(`mastery.${p.to}`)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t("test.result.trend7")}</h3>
        </div>
        <TrendChart data={trendData} />
      </div>

      <Link
        to="/student/progress"
        className="mt-5 block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
      >
        {t("test.result.viewProgress")}
      </Link>
    </MobileShell>
  );
}
