import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { parentTabs } from "@/components/mobile/parent-tabs";
import { EmptyState } from "@/components/cards/EmptyState";
import { PermissionNotice } from "@/components/cards/PermissionNotice";
import { useT } from "@/lib/i18n";
import { Smile, AlertCircle, Activity } from "lucide-react";

export const Route = createFileRoute("/parent/wellbeing")({
  component: WellbeingPage,
});

function WellbeingPage() {
  const t = useT();
  const indicators = [
    { Icon: Smile, label: t("pw.mood"), value: "—" },
    { Icon: Activity, label: t("pw.stress"), value: "—" },
    { Icon: AlertCircle, label: t("pw.risk"), value: t("pw.riskLow") },
  ];

  return (
    <MobileShell title={t("pw.title")} tabs={parentTabs}>
      <div className="grid grid-cols-3 gap-2">
        {indicators.map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
            <Icon className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-2 text-xl font-bold">{value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <EmptyState icon="🧠" title={t("pw.empty.title")} desc={t("pw.empty.desc")} />
      </div>

      <div className="mt-4">
        <PermissionNotice text={t("pw.permission")} />
      </div>
    </MobileShell>
  );
}
