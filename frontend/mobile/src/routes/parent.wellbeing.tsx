import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { parentTabs } from "@/components/mobile/parent-tabs";
import { EmptyState } from "@/components/cards/EmptyState";
import { PermissionNotice } from "@/components/cards/PermissionNotice";
import { StatCard } from "@/components/cards/StatCard";
import { TrendChart } from "@/components/cards/TrendChart";
import { useT } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { mockChildren } from "@/lib/mock-data";
import { apiGetMentalHealthHistory, apiGetChildren } from "@/lib/api";
import type { MentalHealthHistory } from "@/lib/api";
import { LucideProps } from "lucide-react";
import {
  Smile,
  AlertCircle,
  Activity,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/parent/wellbeing")({
  component: WellbeingPage,
});

// ── helpers ──────────────────────────────────────────────────────────────────

function statusColor(
  label: string,
): "primary" | "mastered" | "partial" | "weak" {
  if (label === "GOOD") return "mastered";
  if (label === "BAD") return "weak";
  return "primary";
}

function StatusIcon({ label, ...props }: { label: string } & LucideProps) {
  if (label === "GOOD") return <TrendingUp {...props} />;
  if (label === "BAD") return <TrendingDown {...props} />;
  return <Minus {...props} />;
}

function polarityColor(p: string): string {
  if (p === "POSITIVE") return "text-mastered";
  if (p === "NEGATIVE") return "text-weak";
  return "text-primary";
}

function riskColor(r: string): string {
  if (r === "LOW") return "text-mastered";
  if (r === "HIGH") return "text-weak";
  return "text-partial";
}

function riskBg(r: string): string {
  if (r === "LOW") return "bg-mastered/10 border-mastered/20 text-mastered";
  if (r === "HIGH") return "bg-weak/10 border-weak/20 text-weak";
  return "bg-partial/10 border-partial/20 text-partial";
}

// ── component ────────────────────────────────────────────────────────────────

function WellbeingPage() {
  const t = useT();
  const navigate = useNavigate();
  const { boundChildId } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MentalHealthHistory | null>(null);

  // Resolve children list (try backend first, fall back to mock)
  const [backendChildren, setBackendChildren] = useState<typeof mockChildren>([]);
  const children = backendChildren.length > 0 ? backendChildren : mockChildren;
  const child = useMemo(
    () => children.find((c) => c.id === boundChildId) ?? children[0],
    [children, boundChildId],
  );

  useEffect(() => {
    apiGetChildren()
      .then((list) => {
        if (list.length > 0) {
          setBackendChildren(
            list.map((c, i) => ({
              id: c.id,
              name: c.name,
              grade: "",
              lastSync: "",
              avatar: i === 0 ? "👦" : "👧",
            })),
          );
        }
      })
      .catch(() => {
        /* keep mock */
      });
  }, []);

  // Fetch mental health history when the active child changes
  useEffect(() => {
    if (!child) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGetMentalHealthHistory(child.id, { limit: 30 })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError(t("pw.fetchError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [child?.id, t]);

  // Derive display values
  const hasData = data !== null && data.records.length > 0;
  const latestStatusLabel = hasData ? data!.latestStatusLabel : "NEUTRAL";
  const latestEmotionPolarity = hasData ? data!.latestEmotionPolarity : "NEUTRAL";
  const latestRiskLevel = hasData ? data!.latestRiskLevel : "LOW";

  const polarityText =
    latestEmotionPolarity === "POSITIVE"
      ? t("pw.polarity.positive")
      : latestEmotionPolarity === "NEGATIVE"
        ? t("pw.polarity.negative")
        : t("pw.polarity.neutral");

  const riskText =
    latestRiskLevel === "LOW"
      ? t("pw.risk.low")
      : latestRiskLevel === "HIGH"
        ? t("pw.risk.high")
        : t("pw.risk.medium");

  // Chart data (needs at least 2 points)
  const chartData = useMemo(() => {
    if (!data || data.trend.length < 2) return [];
    return data.trend.map((p) => ({
      day: new Date(p.date).toLocaleDateString(undefined, { weekday: "short" }),
      mastery: p.statusScore,
      time: Math.abs(p.scoreDelta),
    }));
  }, [data]);

  // Top-level indicator cards
  const indicatorCards = useMemo(
    () => [
      {
        Icon: Smile,
        label: t("pw.mood"),
        value: hasData ? polarityText : "—",
        color:
          latestEmotionPolarity === "POSITIVE"
            ? "text-mastered"
            : latestEmotionPolarity === "NEGATIVE"
              ? "text-weak"
              : "text-primary",
      },
      {
        Icon: Activity,
        label: t("pw.signals"),
        value: hasData
          ? data!.latestSignals.slice(0, 2).join(" · ") || t("pw.status.neutral")
          : "—",
        color: hasData ? polarityColor(latestEmotionPolarity) : "text-primary",
      },
      {
        Icon: AlertCircle,
        label: t("pw.risk"),
        value: hasData ? riskText : t("pw.riskLow"),
        color: hasData ? riskColor(latestRiskLevel) : "text-mastered",
      },
    ],
    [hasData, t, polarityText, latestEmotionPolarity, latestRiskLevel, riskText, data],
  );

  return (
    <MobileShell title={t("pw.title")} tabs={parentTabs}>
      {/* Hero / child selector */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/85 via-primary/75 to-primary/60 px-4 pb-5 pt-5 text-primary-foreground">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl backdrop-blur-sm">
              {child?.avatar ?? "👤"}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">
                {child?.name ?? t("pw.selectChild")}
              </h1>
              <p className="text-xs text-white/60">{child?.grade}</p>
            </div>
            <button
              onClick={() => navigate({ to: "/parent/children" })}
              className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95"
            >
              {t("po.switch")} <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Status indicator cards */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {indicatorCards.map(({ Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/50 bg-card p-3.5 text-center shadow-sm"
          >
            <Icon className={`mx-auto h-5 w-5 ${color} opacity-60`} />
            <p className="mt-2 text-sm font-bold leading-tight">{value}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/50">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-primary/40" />
          <p className="mt-2 text-xs text-muted-foreground/50">Loading…</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mt-4 rounded-2xl border border-weak/20 bg-weak/5 p-4 text-center">
          <p className="text-sm text-weak">{error}</p>
        </div>
      )}

      {/* No data */}
      {!loading && !error && !hasData && (
        <div className="mt-4">
          <EmptyState
            icon={<Heart className="h-8 w-8 text-muted-foreground/20" />}
            title={t("pw.noRecords")}
            desc={t("pw.noRecordsDesc")}
          />
        </div>
      )}

      {/* Data available */}
      {!loading && !error && hasData && (
        <div className="mt-4 space-y-4">
          {/* Score + risk level */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label={t("pw.wellbeingScore")}
              value={data!.latestScore}
              icon={
                <StatusIcon
                  label={latestStatusLabel}
                  className="h-3.5 w-3.5"
                />
              }
              tint={statusColor(latestStatusLabel)}
            />
            <div
              className={`rounded-2xl border p-4 shadow-sm ${riskBg(latestRiskLevel)}`}
            >
              <span className="text-[11px] opacity-70">{t("pw.risk")}</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight">
                  {riskText}
                </span>
              </div>
            </div>
          </div>

          {/* Trend chart */}
          {chartData.length >= 2 && (
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary/60" />
                <h3 className="text-sm font-bold">{t("pw.trend")}</h3>
              </div>
              <TrendChart data={chartData} />
            </div>
          )}

          {/* Current signals */}
          {data!.latestSignals.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold">{t("pw.signals")}</h3>
              <div className="flex flex-wrap gap-2">
                {data!.latestSignals.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border/40 bg-muted/30 px-3 py-1 text-xs text-foreground/70"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Last updated timestamp */}
          {data!.records[0] && (
            <p className="text-center text-[10px] text-muted-foreground/30">
              {t("pw.lastUpdated")}:{" "}
              {new Date(data!.records[0].createdAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Privacy notice */}
      <div className="mt-4">
        <PermissionNotice text={t("pw.permission")} />
      </div>
    </MobileShell>
  );
}
