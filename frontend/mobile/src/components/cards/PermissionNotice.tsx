import { ShieldCheck } from "lucide-react";

export function PermissionNotice({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-accent px-3 py-2 text-[12px] text-accent-foreground">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
