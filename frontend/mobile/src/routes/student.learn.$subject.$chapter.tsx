import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { subjects } from "@/lib/mock-data";
import { MasteryBadge } from "@/components/cards/MasteryBadge";
import { Bot } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/student/learn/$subject/$chapter")({
  component: ChapterPage,
});

function ChapterPage() {
  const { subject, chapter } = Route.useParams();
  const s = subjects.find((x) => x.id === subject);
  const c = s?.chapters.find((x) => x.id === chapter);
  const navigate = useNavigate();
  const t = useT();
  if (!s || !c) throw notFound();

  return (
    <MobileShell title={t(`ch.${s.id}.${c.id}`)} back>
      <p className="mb-3 text-xs text-muted-foreground">
        {t("learn.subjectDot", { s: t(`subj.${s.id}`), n: c.points.length })}
      </p>
      <div className="space-y-3">
        {c.points.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold">{t(`kp.${p.id}.n`)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t(`kp.${p.id}.d`)}</p>
              </div>
              <MasteryBadge level={p.mastery} />
            </div>
            <button
              onClick={() => navigate({ to: "/student/ai" })}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-soft py-2 text-xs font-medium text-primary"
            >
              <Bot className="h-4 w-4" />
              {t("learn.useAI")}
            </button>
          </div>
        ))}
      </div>
    </MobileShell>
  );
}
