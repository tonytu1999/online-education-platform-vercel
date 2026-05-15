import { Globe } from "lucide-react";
import { LANGUAGES, useT } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function LanguageSelector({ variant = "card" }: { variant?: "card" | "inline" }) {
  const lang = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const t = useT();

  if (variant === "inline") {
    return (
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
              lang === l.code ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <Globe className="h-3.5 w-3.5" />
        {t("lang.label")}
      </div>
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              lang === l.code ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
