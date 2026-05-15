import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { studentTabs } from "@/components/mobile/student-tabs";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Repeat, LogOut, Settings, Crown, School, ChevronRight, BookMarked, GraduationCap, Trees } from "lucide-react";

export const Route = createFileRoute("/student/me")({
  component: StudentMe,
});

function StudentMe() {
  const { account, nickname, examType, textbook, setRole, logout } = useAppStore();
  const navigate = useNavigate();
  const t = useT();

  const switchRole = () => {
    setRole("parent");
    navigate({ to: "/parent/overview" });
  };

  const items: { Icon: typeof School; label: string; value: string; to?: string; muted?: boolean }[] = [
    { Icon: GraduationCap, label: t("me.examType"), value: t(`exam.${examType}`) },
    { Icon: BookMarked, label: t("me.textbook"), value: textbook, to: "/student/textbook" },
    { Icon: School, label: t("me.school"), value: t("me.school.value") },
    { Icon: Crown, label: t("me.member"), value: t("me.member.value"), muted: true },
    { Icon: Settings, label: t("me.settings"), value: "", to: "/student/settings" },
  ];

  return (
    <MobileShell title={t("me.title")} tabs={studentTabs}>
      {/* Clickable avatar card */}
      <Link
        to="/edit-profile"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-2xl">👦</div>
        <div className="flex-1">
          <p className="text-lg font-bold">{nickname || account || t("me.student.user")}</p>
          <p className="text-xs opacity-80">{t("me.student.role")}</p>
        </div>
        <ChevronRight className="h-4 w-4 opacity-60" />
      </Link>

      <Link
        to="/student/treehole"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-mastered/30 bg-mastered-soft p-4 shadow-sm"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mastered text-primary-foreground">
          <Trees className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-mastered">{t("me.treeHole")}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{t("me.treeHoleDesc")}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-mastered" />
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
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-soft py-3 text-sm font-semibold text-primary"
      >
        <Repeat className="h-4 w-4" />
        {t("me.switchToParent")}
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
