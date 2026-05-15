import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Check } from "lucide-react";

export const Route = createFileRoute("/student/textbook")({
  component: TextbookPage,
});

const OPTIONS = ["textbook.pep", "textbook.bnu", "textbook.hk", "textbook.cambridge"];

function TextbookPage() {
  const t = useT();
  const { textbook, setTextbook } = useAppStore();
  const navigate = useNavigate();

  const choose = (k: string) => {
    setTextbook(t(k));
    setTimeout(() => navigate({ to: "/student/me" }), 200);
  };

  return (
    <MobileShell title={t("textbook.title")} back>
      <div className="space-y-2">
        {OPTIONS.map((k) => {
          const label = t(k);
          const active = label === textbook;
          return (
            <button
              key={k}
              onClick={() => choose(k)}
              className={`flex w-full items-center justify-between rounded-2xl border bg-card p-4 shadow-sm transition-colors ${
                active ? "border-primary" : "border-border"
              }`}
            >
              <span className="text-sm font-medium">{label}</span>
              {active && <Check className="h-4 w-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </MobileShell>
  );
}
