import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon?: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
