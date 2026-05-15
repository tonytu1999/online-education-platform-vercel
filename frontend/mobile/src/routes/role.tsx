import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppStore, type Role } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { BookOpen, Users } from "lucide-react";

export const Route = createFileRoute("/role")({
  head: () => ({ meta: [{ title: "选择角色" }] }),
  component: RolePage,
});

function RolePage() {
  const setRole = useAppStore((s) => s.setRole);
  const navigate = useNavigate();
  const t = useT();

  const choose = (r: Role) => {
    setRole(r);
    navigate({ to: r === "student" ? "/student/learn" : "/parent/overview" });
  };

  const cards = [
    {
      role: "student" as const,
      title: t("role.student.title"),
      desc: t("role.student.desc"),
      icon: BookOpen,
      grad: "from-primary to-primary/70",
    },
    {
      role: "parent" as const,
      title: t("role.parent.title"),
      desc: t("role.parent.desc"),
      icon: Users,
      grad: "from-mastered to-mastered/70",
    },
  ];

  return (
    <div className="phone-frame">
      <div className="flex flex-1 flex-col px-6 pt-16">
        <h2 className="text-2xl font-bold tracking-tight">{t("role.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("role.subtitle")}</p>

        <div className="mt-8 space-y-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.role}
                onClick={() => choose(c.role)}
                className={`group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br ${c.grad} p-5 text-left text-primary-foreground shadow-lg transition-transform active:scale-[0.98]`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{c.title}</h3>
                    <p className="mt-1 text-xs opacity-90">{c.desc}</p>
                  </div>
                </div>
                <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
