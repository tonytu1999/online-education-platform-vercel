import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { subjects } from "@/lib/mock-data";
import { ChevronRight } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/student/learn/$subject")({
  component: SubjectPage,
});

function SubjectPage() {
  const { subject } = Route.useParams();
  const s = subjects.find((x) => x.id === subject);
  const t = useT();
  if (!s) throw notFound();

  return (
    <MobileShell title={t(`subj.${s.id}`)} back>
      <p className="mb-3 text-xs text-muted-foreground">{t("learn.totalChapters", { n: s.chapters.length })}</p>
      <div className="space-y-3">
        {s.chapters.map((c) => (
          <Link
            key={c.id}
            to="/student/learn/$subject/$chapter"
            params={{ subject: s.id, chapter: c.id }}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div>
              <h3 className="font-semibold">{t(`ch.${s.id}.${c.id}`)}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t("learn.pointsCount", { n: c.points.length })}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </MobileShell>
  );
}
