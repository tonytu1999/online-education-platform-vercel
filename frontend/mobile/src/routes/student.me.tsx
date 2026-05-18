import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { studentTabs } from "@/components/mobile/student-tabs";
import { useAppStore, type ExamType } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { LogOut, Settings, Crown, School, ChevronRight, BookMarked, GraduationCap, X } from "lucide-react";

export const Route = createFileRoute("/student/me")({
  component: StudentMe,
});

function StudentMe() {
  const { account, nickname, examType, textbook, school, logout, setExamType, setSchool } = useAppStore();
  const navigate = useNavigate();
  const t = useT();
  const [showExamPicker, setShowExamPicker] = useState(false);
  const [showSchoolEditor, setShowSchoolEditor] = useState(false);
  const [editSchool, setEditSchool] = useState("");

  const examOptions: { key: ExamType; label: string }[] = [
    { key: "gaokao", label: t("exam.gaokao") },
    { key: "dse", label: t("exam.dse") },
    { key: "ib", label: t("exam.ib") },
    { key: "other", label: t("exam.other") },
  ];

  const handleSchoolSave = () => {
    if (editSchool.trim()) setSchool(editSchool.trim());
    setShowSchoolEditor(false);
  };

  const items: { Icon: typeof GraduationCap; label: string; value: string; to?: string; muted?: boolean; onClick?: () => void }[] = [
    { Icon: GraduationCap, label: t("me.examType"), value: t(`exam.${examType}`), onClick: () => setShowExamPicker(true) },
    { Icon: BookMarked, label: t("me.textbook"), value: textbook, to: "/student/textbook" },
    { Icon: School, label: t("me.school"), value: school || t("me.school.value"), onClick: () => { setEditSchool(school || ""); setShowSchoolEditor(true); } },
    { Icon: Crown, label: t("me.member"), value: t("me.member.value"), muted: true },
    { Icon: Settings, label: t("me.settings"), value: "", to: "/student/settings" },
  ];

  return (
    <MobileShell title={t("me.title")} tabs={studentTabs}>
      {/* Profile card */}
      <Link
        to="/edit-profile"
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/75 p-5 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
      >
        <div className="flex h-15 w-15 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm" style={{ width: 60, height: 60 }}>
          👦
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold truncate">{nickname || account || t("me.student.user")}</p>
          <p className="text-xs text-white/60">{t("me.student.role")}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-white/40" />
      </Link>

      {/* Settings list */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        {items.map(({ Icon, label, value, muted, to, onClick }, i) => {
          const inner = (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                <Icon className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <span className="flex-1 text-sm font-medium">{label}</span>
              <span className={`text-xs ${muted ? "text-muted-foreground/40" : "text-muted-foreground/70"}`}>{value}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
            </>
          );
          const cls = `flex items-center gap-3 px-4 py-3.5 transition-colors ${i > 0 ? "border-t border-border/40" : ""}`;
          if (to) {
            return <Link key={label} to={to} className={`${cls} hover:bg-muted/30 active:bg-muted/50`}>{inner}</Link>;
          }
          if (onClick) {
            return <button key={label} onClick={onClick} className={`${cls} w-full text-left hover:bg-muted/30 active:bg-muted/50`}>{inner}</button>;
          }
          return <div key={label} className={cls}>{inner}</div>;
        })}
      </div>

      {/* Actions */}
      <button
        onClick={() => { logout(); navigate({ to: "/login" }); }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-border/40 bg-card py-3.5 text-sm text-muted-foreground/60 transition-all active:scale-[0.97]"
      >
        <LogOut className="h-4 w-4" />
        {t("me.logout")}
      </button>

      {/* Exam picker modal */}
      {showExamPicker && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowExamPicker(false)}>
          <div className="w-full max-w-[430px] rounded-t-3xl bg-background p-5 shadow-2xl slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold">{t("me.examType")}</h3>
              <button onClick={() => setShowExamPicker(false)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted">
                <X className="h-4 w-4 text-muted-foreground/60" />
              </button>
            </div>
            <div className="space-y-2">
              {examOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setExamType(opt.key); setShowExamPicker(false); }}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                    examType === opt.key ? "border-primary/40 bg-primary-soft/50" : "border-border/50 bg-card hover:bg-muted/30"
                  }`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  {examType === opt.key && <span className="text-primary font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* School editor modal */}
      {showSchoolEditor && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSchoolEditor(false)}>
          <div className="w-full max-w-[430px] rounded-t-3xl bg-background p-5 shadow-2xl slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold">{t("me.school")}</h3>
              <button onClick={() => setShowSchoolEditor(false)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted">
                <X className="h-4 w-4 text-muted-foreground/60" />
              </button>
            </div>
            <input
              value={editSchool}
              onChange={(e) => setEditSchool(e.target.value)}
              placeholder={t("me.school.value")}
              className="w-full rounded-2xl border border-border/80 bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              autoFocus
            />
            <button
              onClick={handleSchoolSave}
              className="mt-4 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20"
            >
              {t("common.save")}
            </button>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
