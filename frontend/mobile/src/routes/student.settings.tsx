import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { studentTabs } from "@/components/mobile/student-tabs";
import { useT } from "@/lib/i18n";
import { LanguagePopup } from "@/components/LanguagePopup";
import { Bell, Moon, Shield, ChevronRight, Globe } from "lucide-react";

export const Route = createFileRoute("/student/settings")({
  component: StudentSettings,
});

function StudentSettings() {
  const t = useT();

  const items = [
    { Icon: Bell, label: t("me.notify"), value: t("me.notify.value") },
    { Icon: Moon, label: t("settings.darkMode"), value: "" },
    { Icon: Shield, label: t("me.privacy"), value: "" },
  ];

  return (
    <MobileShell title={t("me.settings")} back tabs={studentTabs}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {items.map(({ Icon, label, value }, i) => (
          <div key={label} className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}>
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm">{label}</span>
            {value && <span className="text-xs text-muted-foreground">{value}</span>}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>

      {/* Language — uses bottom-sheet popup */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{t("lang.label")}</span>
          </div>
          <LanguagePopup />
        </div>
      </div>
    </MobileShell>
  );
}
