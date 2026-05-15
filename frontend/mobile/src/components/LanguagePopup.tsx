import { useState } from "react";
import { Globe, Check, X } from "lucide-react";
import { LANGUAGES, useT } from "@/lib/i18n";
import { useAppStore, type Lang } from "@/lib/store";

export function LanguagePopup() {
  const [open, setOpen] = useState(false);
  const lang = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = useT();

  const choose = (code: Lang) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-[420px] rounded-t-3xl bg-background p-5 shadow-xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">{t("lang.label")}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {LANGUAGES.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    onClick={() => choose(l.code)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 transition-colors ${
                      active
                        ? "border-primary bg-primary-soft"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{l.code === "zh-CN" ? "🇨🇳" : l.code === "zh-TW" ? "🇹🇼" : "🇬🇧"}</span>
                      <span className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>
                        {l.label}
                      </span>
                    </div>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
