import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile/MobileShell";
import { parentTabs } from "@/components/mobile/parent-tabs";
import { StatCard } from "@/components/cards/StatCard";
import { TrendChart } from "@/components/cards/TrendChart";
import { PermissionNotice } from "@/components/cards/PermissionNotice";
import { mockChildren, trendData } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Target, Award, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/parent/overview")({
  component: ParentOverview,
});

function ParentOverview() {
  const boundChildId = useAppStore((s) => s.boundChildId);
  const child = mockChildren.find((c) => c.id === boundChildId) ?? mockChildren[0];
  const t = useT();

  const acts = [
    { t: t("po.act1.t"), d: t("po.act1.d") },
    { t: t("po.act2.t"), d: t("po.act2.d") },
    { t: t("po.act3.t"), d: t("po.act3.d") },
  ];

  return (
    <MobileShell tabs={parentTabs} noPad>
      <div className="bg-gradient-to-br from-mastered to-mastered/70 px-5 pb-8 pt-12 text-primary-foreground">
        <p className="text-xs opacity-80">{t("po.viewing")}</p>
        <div className="mt-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">
            {child.avatar}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{t(`child.${child.id}.name`)}</h1>
            <p className="text-xs opacity-90">{t(`child.${child.id}.grade`)}</p>
          </div>
          <button className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-xs">
            {t("po.switch")} <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="-mt-4 rounded-t-3xl bg-background px-4 pb-4 pt-5">
        <div className="grid grid-cols-2 gap-2">
          <StatCard label={t("po.completion")} value="72" unit="%" icon={<Target className="h-3.5 w-3.5" />} tint="primary" />
          <StatCard label={t("po.mastery")} value="68" unit="%" icon={<Award className="h-3.5 w-3.5" />} tint="mastered" />
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold">{t("po.trend7")}</h3>
          <TrendChart data={trendData} />
        </div>

        <div className="mt-4">
          <PermissionNotice text={t("po.permission")} />
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">{t("po.recent")}</h3>
          <ul className="space-y-3 text-xs">
            {acts.map((a) => (
              <li key={a.d} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="text-foreground">{a.d}</p>
                  <p className="mt-0.5 text-muted-foreground">{a.t}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MobileShell>
  );
}
