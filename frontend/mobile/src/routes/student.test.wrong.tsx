import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useT } from "@/lib/i18n";
import { Camera, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/student/test/wrong")({
  component: WrongEntry,
});

function WrongEntry() {
  const [file, setFile] = useState<File | null>(null);
  const t = useT();
  return (
    <MobileShell title={t("test.wrong.title")} back>
      <label className="flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <ImageIcon className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium text-foreground">{file.name}</span>
            <span className="text-xs">{t("test.wrong.recognizing")}</span>
          </>
        ) : (
          <>
            <Camera className="h-8 w-8" />
            <span className="text-sm">{t("test.wrong.upload")}</span>
          </>
        )}
      </label>
      {file && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">{t("test.wrong.aiResult")}</p>
          <p className="mt-2 text-sm font-semibold">{t("test.wrong.subjectVal")}</p>
          <p className="text-sm">{t("test.wrong.pointVal")}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t("test.wrong.added")}</p>
        </div>
      )}
    </MobileShell>
  );
}
