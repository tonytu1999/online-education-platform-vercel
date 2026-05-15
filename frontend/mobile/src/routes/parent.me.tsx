import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { parentTabs } from "@/components/mobile/parent-tabs";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Repeat, LogOut, Settings, Crown, Bell, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/parent/me")({
  component: ParentMe,
});

function ParentMe() {
  const { account, setRole, logout } = useAppStore();
  const navigate = useNavigate();
  const t = useT();

  const switchRole = () => {
    setRole("student");
    navigate({ to: "/student/learn" });
  };

  const items: { Icon: typeof Bell; label: string; value: string; to?: string; muted?: boolean }[] = [
    { Icon: Bell, label: t("me.notify"), value: t("me.notify.value"), to: "/parent/settings" },
    { Icon: Crown, label: t("me.member"), value: t("me.member.value"), muted: true },
    { Icon: Settings, label: t("me.privacy"), value: "", to: "/parent/settings" },
  ];

  return (
    <MobileShell title={t("me.title")} tabs={parentTabs}>
      {/* Clickable avatar card */}
      <Link
        to="/edit-profile"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-mastered to-mastered/70 p-5 text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl">👨‍👩‍👧</div>
        <div className="flex-1">
          <p className="text-lg font-bold">{account || t("me.parent.user")}</p>
          <p className="text-xs opacity-80">{t("me.parent.role")}</p>
        </div>
        <ChevronRight className="h-4 w-4 opacity-60" />
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {items.map(({ Icon, label, value, muted, to }, i) => {
          const inner = (
            <>
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm">{label}</span>
              <span className={`text-xs ${muted ? "text-muted-foreground" : "text-foreground"}`}>{value}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          );
          const cls = `flex items-center gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border" : ""}`;
          return to ? (
            <Link key={label} to={to} className={cls}>{inner}</Link>
          ) : (
            <div key={label} className={cls}>{inner}</div>
          );
        })}
      </div>

      <button
        onClick={switchRole}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-mastered/30 bg-mastered-soft py-3 text-sm font-semibold text-mastered"
      >
        <Repeat className="h-4 w-4" />
        {t("me.switchToStudent")}
      </button>

      <button
        onClick={() => { logout(); navigate({ to: "/login" }); }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm text-weak"
      >
        <LogOut className="h-4 w-4" />
        {t("me.logout")}
      </button>
    </MobileShell>
  );
}
