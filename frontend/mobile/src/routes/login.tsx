import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { LanguagePopup } from "@/components/LanguagePopup";
import { GraduationCap, Smartphone, Mail, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "登录 — 智学" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [account, setAccount] = useState("");
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");
  const setLogin = useAppStore((s) => s.setLogin);
  const navigate = useNavigate();
  const t = useT();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setLogin(account, nickname.trim(), "gaokao");
    if (mode === "register") {
      navigate({ to: "/onboarding" });
    } else {
      useAppStore.getState().setOnboarded();
      navigate({ to: "/role" });
    }
  };

  return (
    <div className="phone-frame">
      <div className="flex flex-1 flex-col px-6 pt-12 pb-8">
        {/* Header: logo + language globe */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t("app.name")}</h1>
              <p className="text-xs text-muted-foreground">{t("app.tagline")}</p>
            </div>
          </div>
          <LanguagePopup />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === "login" ? t("login.welcome") : t("register.welcome")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? t("login.subtitle") : t("register.subtitle")}
          </p>
        </div>

        {/* Login / Register toggle */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex flex-1 gap-1 rounded-xl bg-muted p-1">
            {[
              { k: "phone", label: t("login.tab.phone"), Icon: Smartphone },
              { k: "email", label: t("login.tab.email"), Icon: Mail },
            ].map(({ k, label, Icon }) => (
              <button
                key={k}
                onClick={() => setTab(k as "phone" | "email")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                  tab === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary-soft whitespace-nowrap"
          >
            {mode === "login" ? t("login.toRegister") : t("login.toLogin")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Nickname — only in register mode */}
          {mode === "register" && (
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("login.placeholder.nickname")}
                className="w-full rounded-xl border border-input bg-background py-3 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}
          <input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={tab === "phone" ? t("login.placeholder.phone") : t("login.placeholder.email")}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="relative">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={tab === "phone" ? t("login.placeholder.code") : t("login.placeholder.password")}
              type={tab === "email" ? "password" : "text"}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-24 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {tab === "phone" && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary"
              >
                {t("login.getCode")}
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-transform active:scale-[0.98]"
          >
            {mode === "login" ? t("login.submit") : t("register.submit")}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t("login.thirdParty")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex justify-center gap-6">
          {["微信", "QQ"].map((p) => (
            <button
              key={p}
              onClick={() => alert(t("login.toast.thirdParty", { p }))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-lg shadow-sm"
            >
              {p === "微信" ? "💬" : "🐧"}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          {t("login.terms")}
        </p>
      </div>
    </div>
  );
}
