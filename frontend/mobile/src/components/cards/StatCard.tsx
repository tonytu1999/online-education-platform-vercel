import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  unit,
  icon,
  tint = "primary",
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  tint?: "primary" | "mastered" | "partial" | "weak";
}) {
  const tintMap = {
    primary: "bg-primary-soft text-primary",
    mastered: "bg-mastered-soft text-mastered",
    partial: "bg-partial-soft text-partial",
    weak: "bg-weak-soft text-weak",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon && <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tintMap[tint]}`}>{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
