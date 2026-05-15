import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Camera, Check } from "lucide-react";

export const Route = createFileRoute("/edit-profile")({
  head: () => ({ meta: [{ title: "编辑资料 — 智学" }] }),
  component: EditProfilePage,
});

function EditProfilePage() {
  const { loggedIn, nickname, setNickname } = useAppStore();
  const [editName, setEditName] = useState(nickname);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const t = useT();

  if (!loggedIn) return <Navigate to="/login" />;

  const handleSave = () => {
    setNickname(editName.trim());
    setSaved(true);
    setTimeout(() => navigate({ to: "/student/me" }), 600);
  };

  return (
    <div className="phone-frame">
      <div className="flex flex-1 flex-col px-6 pt-12 pb-8">
        <h2 className="text-xl font-bold tracking-tight">{t("editProfile.title")}</h2>

        {/* Avatar selector */}
        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-4xl">
              👦
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t("editProfile.avatar")}</p>
        </div>

        {/* Nickname */}
        <div className="mt-6">
          <label className="text-xs font-medium text-muted-foreground">{t("editProfile.nickname")}</label>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder={t("editProfile.nicknamePh")}
            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Save */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all active:scale-[0.98]"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                {t("common.save")}
              </>
            ) : (
              t("common.save")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
