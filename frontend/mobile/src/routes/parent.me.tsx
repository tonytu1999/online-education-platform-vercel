import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { parentTabs } from "@/components/mobile/parent-tabs";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { LogOut, Settings, Crown, Bell, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/parent/me")({
  component: ParentMe,
});

function ParentMe() {
  const { account, logout } = useAppStore();
  const navigate = useNavigate();
  const t = useT();
  const [notifyOn, setNotifyOn] = useState(true);

  const items: { Icon: typeof Crown; label: string; value: string; to?: string; muted?: boolean }[] = [
    { Icon: Crown, label: t("me.member"), value: t("me.member.value"), muted: true },
    { Icon: Settings, label: t("me.privacy"), value: "", to: "/parent/settings" },
  ];

  return (
    <MobileShell title={t("me.title")} tabs={parentTabs}>
      {/* Profile card */}
      <Link
        to="/edit-profile"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-mastered via-mastered/85 to-mastered/70 p-5 text-primary-foreground shadow-lg shadow-mastered/15 transition-all active:scale-[0.98]"
      >
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm" style={{ width: 60, height: 60 }}>
          👨‍👩‍👧
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">{account || t("me.parent.user")}</p>
          <p className="text-xs text-white/50">{t("me.parent.role")}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-white/30" />
      </Link>

      {/* Notification toggle */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
            <Bell className="h-4 w-4 text-muted-foreground/60" />
          </div>
          <span className="flex-1 text-sm font-medium">{t("me.notify")}</span>
          <button
            onClick={() => setNotifyOn(!notifyOn)}
            className={`relative h-6 w-11 rounded-full transition-colors ${notifyOn ? "bg-mastered" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${notifyOn ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      {/* Settings list */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        {items.map(({ Icon, label, value, muted, to }, i) => {
          const inner = (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                <Icon className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <span className="flex-1 text-sm font-medium">{label}</span>
              <span className={`text-xs ${muted ? "text-muted-foreground/40" : "text-muted-foreground/70"}`}>{value}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
            </>
          );
          const cls = `flex items-center gap-3 px-4 py-3.5 transition-colors ${i > 0 ? "border-t border-border/40" : ""}`;
          return to ? (
            <Link key={label} to={to} className={`${cls} hover:bg-muted/30 active:bg-muted/50`}>{inner}</Link>
          ) : (
            <div key={label} className={cls}>{inner}</div>
          );
        })}
      </div>

      {/* Actions */}
      <button
        onClick={() => { logout(); navigate({ to: "/login" }); }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border/40 bg-card py-3.5 text-sm text-muted-foreground/60 transition-all active:scale-[0.97]"
      >
        <LogOut className="h-4 w-4" />
        {t("me.logout")}
      </button>
    </MobileShell>
  );
}
