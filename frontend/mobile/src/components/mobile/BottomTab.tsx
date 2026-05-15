import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n";

export interface TabItem {
  to: string;
  label: string; // i18n key
  icon: LucideIcon;
}

export function BottomTab({ items }: { items: TabItem[] }) {
  const t = useT();
  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-[420px] -translate-x-1/2 border-t border-border bg-background/95 backdrop-blur">
      <ul className="grid grid-cols-5 px-1 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                activeOptions={{ exact: false }}
                className="flex flex-col items-center gap-1 rounded-lg px-1 py-1 text-[11px] text-muted-foreground transition-colors data-[status=active]:text-primary"
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                <span className="font-medium">{t(it.label)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
