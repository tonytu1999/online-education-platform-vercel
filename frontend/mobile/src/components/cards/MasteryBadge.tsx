import type { Mastery } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

const STYLE: Record<Mastery, { bg: string; text: string }> = {
  mastered: { bg: "bg-mastered-soft", text: "text-mastered" },
  partial: { bg: "bg-partial-soft", text: "text-partial" },
  weak: { bg: "bg-weak-soft", text: "text-weak" },
};

export function MasteryBadge({ level }: { level: Mastery }) {
  const t = useT();
  const m = STYLE[level];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${m.bg} ${m.text}`}>
      {t(`mastery.${level}`)}
    </span>
  );
}
