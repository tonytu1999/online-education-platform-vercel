import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/student/test/score")({
  component: ScoreEntry,
});

function ScoreEntry() {
  const t = useT();
  const subjectIds = ["math", "chinese", "english"] as const;
  const [subject, setSubject] = useState<string>("math");
  const [score, setScore] = useState("");
  const [exam, setExam] = useState("");
  const navigate = useNavigate();

  const submit = () => {
    if (!score) return;
    alert(t("test.score.toast", { s: t(`subj.${subject}`), e: exam || t("test.score.examDefault"), n: score }));
    navigate({ to: "/student/test" });
  };

  return (
    <MobileShell title={t("test.scoreEntry")} back>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("test.score.subject")}</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
          >
            {subjectIds.map((id) => (
              <option key={id} value={id}>{t(`subj.${id}`)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("test.score.exam")}</label>
          <input
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            placeholder={t("test.score.examPh")}
            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("test.score.score")}</label>
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            type="number"
            placeholder="0 - 100"
            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm"
          />
        </div>
        <button
          onClick={submit}
          className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          {t("common.save")}
        </button>
      </div>
    </MobileShell>
  );
}
