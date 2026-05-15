import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { parentTabs } from "@/components/mobile/parent-tabs";
import { mockChildren } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Plus, Check, QrCode, Smartphone, X } from "lucide-react";

export const Route = createFileRoute("/parent/children")({
  component: ChildrenPage,
});

function ChildrenPage() {
  const { boundChildId, bindChild } = useAppStore();
  const [showBind, setShowBind] = useState(false);
  const t = useT();

  return (
    <MobileShell title={t("pc.title")} tabs={parentTabs}>
      <div className="space-y-3">
        {mockChildren.map((c) => {
          const active = c.id === boundChildId;
          return (
            <button
              key={c.id}
              onClick={() => bindChild(c.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left shadow-sm transition-all ${
                active ? "border-primary bg-primary-soft" : "border-border bg-card"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
                {c.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{t(`child.${c.id}.name`)}</h3>
                <p className="text-xs text-muted-foreground">{t(`child.${c.id}.grade`)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{t("pc.lastSync", { t: t(`child.${c.id}.sync`) })}</p>
              </div>
              {active && <Check className="h-5 w-5 text-primary" />}
            </button>
          );
        })}

        <button
          onClick={() => setShowBind(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground"
        >
          <Plus className="h-4 w-4" /> {t("pc.bind")}
        </button>
      </div>

      {showBind && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-[420px] rounded-t-3xl bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">{t("pc.bindTitle")}</h3>
              <button onClick={() => setShowBind(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <button className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left">
                <Smartphone className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("pc.bindPhone")}</p>
                  <p className="text-xs text-muted-foreground">{t("pc.bindPhoneDesc")}</p>
                </div>
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left">
                <QrCode className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t("pc.bindScan")}</p>
                  <p className="text-xs text-muted-foreground">{t("pc.bindScanDesc")}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
