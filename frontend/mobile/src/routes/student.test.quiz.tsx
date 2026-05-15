import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { quizQuestions } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/student/test/quiz")({
  component: QuizPage,
});

function QuizPage() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const navigate = useNavigate();
  const completeTest = useAppStore((s) => s.completeTest);
  const t = useT();
  const q = quizQuestions[idx];

  const choose = (i: number) => {
    const next = [...answers, i];
    setAnswers(next);
    if (idx + 1 < quizQuestions.length) setIdx(idx + 1);
    else {
      const correct = next.filter((a, k) => a === quizQuestions[k].answer).length;
      const score = Math.round((correct / quizQuestions.length) * 100);
      completeTest(score);
      navigate({ to: "/student/test/result" });
    }
  };

  const optionLabel = (oIdx: number) => {
    // q2 has translatable options; q1 and q3 use raw values from mock
    if (q.id === "q2") return t(`quiz.${q.id}.o${oIdx}`);
    return q.options[oIdx];
  };

  return (
    <MobileShell title={t("test.qNum", { i: idx + 1, n: quizQuestions.length })} back>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((idx + 1) / quizQuestions.length) * 100}%` }}
        />
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-base font-medium leading-relaxed">{t(`quiz.${q.id}.q`)}</p>
      </div>
      <div className="mt-4 space-y-2">
        {q.options.map((_, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left text-sm transition-colors active:bg-primary-soft"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
              {String.fromCharCode(65 + i)}
            </span>
            <span>{optionLabel(i)}</span>
          </button>
        ))}
      </div>
    </MobileShell>
  );
}
