import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { LanguagePopup } from "@/components/LanguagePopup";
import { GraduationCap, Smartphone, Mail, User as UserIcon, Lock } from "lucide-react";
import WeChatIcon from "@/assets/icons8-wechat.svg";
import QQIcon from "@/assets/icons8-qq.svg";
import { apiLogin, apiRegister } from "@/lib/api";

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setLogin = useAppStore((s) => s.setLogin);
  const setRole = useAppStore((s) => s.setRole);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const navigate = useNavigate();
  const t = useT();

  const isEmailRegister = mode === "register" && tab === "email";

  const isFormValid = useMemo(() => {
    // login & phone register: account + code/password
    if (mode === "login" || tab === "phone") {
      return account.trim() !== "" && code.trim() !== "";
    }
    // email register: nickname + account + password + confirmPassword
    return (
      nickname.trim() !== "" &&
      account.trim() !== "" &&
      code.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      code === confirmPassword
    );
  }, [mode, tab, account, nickname, code, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await apiRegister({
          name: nickname.trim() || account.split("@")[0] || account,
          email: tab === "email" ? account : "",
          phone: tab === "phone" ? account : "",
          password: code,
          role: "STUDENT",
        });
        // 注册成功后自动登录获取 token
        const loginRes = await apiLogin(account, code);
        setLogin(
          account,
          loginRes.user.name || nickname.trim() || account.split("@")[0] || account,
          "dse",
          loginRes.token,
          loginRes.user.id,
        );
        setRole("student");
        navigate({ to: "/onboarding" });
      } else {
        const res = await apiLogin(account, code);
        const role = res.user.role?.toLowerCase() === "parent" ? "parent" : "student";
        setLogin(account, res.user.name, "dse", res.token, res.user.id);
        useAppStore.getState().setRole(role);
        useAppStore.getState().setOnboarded();
        navigate({ to: role === "parent" ? "/parent/overview" : "/student/learn" });
      }
    } catch (err: any) {
      setError(err.message || "请求失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-frame paper-texture">
      <div className="flex flex-1 flex-col px-7 pt-14 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <GraduationCap className="h-6 w-6" strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t("app.name")}</h1>
              <p className="text-[11px] text-muted-foreground/80">{t("app.tagline")}</p>
            </div>
          </div>
          <LanguagePopup />
        </div>

        {/* Welcome text */}
        <div className="mt-10">
          <h2 className="text-[26px] font-bold tracking-tight leading-tight">
            {mode === "login" ? t("login.welcome") : t("login.welcome")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground/80">
            {mode === "login" ? t("login.subtitle") : t("register.subtitle")}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex flex-1 gap-1 rounded-2xl bg-muted/80 p-1">
            {[
              { k: "phone", label: t("login.tab.phone"), Icon: Smartphone },
              { k: "email", label: t("login.tab.email"), Icon: Mail },
            ].map(({ k, label, Icon }) => (
              <button
                key={k}
                onClick={() => setTab(k as "phone" | "email")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium transition-all duration-200 ${
                  tab === k
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary-soft active:scale-95 whitespace-nowrap"
          >
            {mode === "login" ? t("login.toRegister") : t("login.toLogin")}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {mode === "register" && (
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("login.placeholder.nickname")}
                className="w-full rounded-2xl border border-border/80 bg-card py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>
          )}
          <input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={tab === "phone" ? t("login.placeholder.phone") : t("login.placeholder.email")}
            className="w-full rounded-2xl border border-border/80 bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
          <div className="relative">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={tab === "phone" ? t("login.placeholder.code") : t("login.placeholder.password")}
              type={tab === "email" ? "password" : "text"}
              className="w-full rounded-2xl border border-border/80 bg-card px-4 py-3.5 pr-24 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
            {tab === "phone" && (
              <button
                type="button"
                disabled={countdown > 0}
                onClick={() => {
                  if (!account) return;
                  setCountdown(60);
                  const timer = setInterval(() => {
                    setCountdown((c) => {
                      if (c <= 1) { clearInterval(timer); return 0; }
                      return c - 1;
                    });
                  }, 1000);
                }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  countdown > 0
                    ? "bg-muted text-muted-foreground/50"
                    : "bg-primary-soft text-primary hover:bg-primary/15 active:scale-95"
                }`}
              >
                {countdown > 0 ? `${countdown}s` : t("login.getCode")}
              </button>
            )}
          </div>
          {isEmailRegister && (
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("login.placeholder.confirmPassword")}
                type="password"
                className="w-full rounded-2xl border border-border/80 bg-card py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`mt-2 w-full rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.97] ${
              isFormValid && !loading
                ? "bg-primary/80 text-primary-foreground shadow-lg shadow-primary/15 hover:bg-primary hover:shadow-xl hover:shadow-primary/20"
                : "bg-muted text-muted-foreground/50 cursor-not-allowed"
            }`}
          >
            {loading ? "..." : mode === "login" ? t("login.submit") : t("register.submit")}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border/60" />
          <span className="text-[11px] text-muted-foreground/50">{t("login.thirdParty")}</span>
          <div className="h-px flex-1 bg-border/60" />
        </div>

        {/* Third party */}
        <div className="flex justify-center gap-4">
          {/* WeChat */}
          <button
            onClick={() => alert(t("login.toast.thirdParty", { p: "微信" }))}
            className="flex items-center justify-center rounded-full bg-[#e8f5ee] border border-[#07C160]/15 shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ width: 48, height: 48 }}
          >
            <img src={WeChatIcon} alt="微信" width="24" height="24" />
          </button>
          {/* QQ */}
          <button
            onClick={() => alert(t("login.toast.thirdParty", { p: "QQ" }))}
            className="flex items-center justify-center rounded-full bg-[#e3f2fd] border border-[#12B7F5]/15 shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ width: 48, height: 48 }}
          >
            <img src={QQIcon} alt="QQ" width="24" height="24" />
          </button>
          {/* Google */}
          <button
            onClick={() => alert(t("login.toast.thirdParty", { p: "Google" }))}
            className="flex items-center justify-center rounded-full bg-card border border-border/60 shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ width: 48, height: 48 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-muted-foreground/50 leading-relaxed">
          {t("login.terms")}
        </p>
      </div>
    </div>
  );
}
