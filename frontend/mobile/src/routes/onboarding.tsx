import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { useAppStore, type Role } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ChevronRight, ChevronLeft, Search, X, Check, Loader2 } from "lucide-react";
import { apiGetStudentUuidByEmail, apiBindChild, apiSelectRole } from "@/lib/api";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "完善信息 — 智学" }] }),
  component: OnboardingPage,
});

const COUNTRIES = [
  { id: "cn", flag: "🇨🇳", label: "中国大陆" },
  { id: "hk", flag: "🇭🇰", label: "中国香港" },
  { id: "tw", flag: "🇹🇼", label: "中国台湾" },
  { id: "sg", flag: "🇸🇬", label: "新加坡" },
  { id: "my", flag: "🇲🇾", label: "马来西亚" },
  { id: "other", flag: "🌍", label: "其他" },
];

const GENDERS = [
  { id: "male", emoji: "👦", label: "onboard.gender.male" },
  { id: "female", emoji: "👧", label: "onboard.gender.female" },
];

const HK_SCHOOLS = [
  "拔萃男书院", "拔萃女书院", "圣保罗男女中学",
  "皇仁书院", "英皇书院", "庇理罗士女子中学",
  "圣保禄学校", "嘉诺撒圣心书院", "玛利曼中学",
  "香港华仁书院", "九龙华仁书院", "圣芳济各书院",
  "德望学校", "协恩中学", "圣士提反书院",
];

const CN_SCHOOLS = [
  "北京市第一中学", "北京市第四中学", "北京师范大学附属中学",
  "上海市上海中学", "华东师范大学第二附属中学", "复旦大学附属中学",
  "广州市执信中学", "深圳中学", "华南师范大学附属中学",
  "杭州市第二中学", "南京师范大学附属中学", "武汉市第二中学",
  "成都市第七中学", "西安市高新一中", "长沙市雅礼中学",
];

const HK_GRADES = [
  { id: "p1", label: "小一" },
  { id: "p2", label: "小二" },
  { id: "p3", label: "小三" },
  { id: "p4", label: "小四" },
  { id: "p5", label: "小五" },
  { id: "p6", label: "小六" },
  { id: "f1", label: "中一" },
  { id: "f2", label: "中二" },
  { id: "f3", label: "中三" },
  { id: "f4", label: "中四" },
  { id: "f5", label: "中五" },
  { id: "f6", label: "中六" },
];

const CN_GRADES = [
  { id: "p1", label: "小学一年级" },
  { id: "p2", label: "小学二年级" },
  { id: "p3", label: "小学三年级" },
  { id: "p4", label: "小学四年级" },
  { id: "p5", label: "小学五年级" },
  { id: "p6", label: "小学六年级" },
  { id: "j1", label: "初一 / 七年级" },
  { id: "j2", label: "初二 / 八年级" },
  { id: "j3", label: "初三 / 九年级" },
  { id: "s1", label: "高一" },
  { id: "s2", label: "高二" },
  { id: "s3", label: "高三" },
];

function SchoolGradePicker({
  schools,
  grades,
  selectedSchool,
  selectedGrade,
  onConfirm,
  onClose,
  t,
  showGrade,
}: {
  schools: string[];
  grades: { id: string; label: string }[];
  selectedSchool: string;
  selectedGrade: string;
  onConfirm: (school: string, grade: string) => void;
  onClose: () => void;
  t: (key: string) => string;
  showGrade: boolean;
}) {
  const [schoolQuery, setSchoolQuery] = useState("");
  const [tempSchool, setTempSchool] = useState(selectedSchool);
  const [tempGrade, setTempGrade] = useState(selectedGrade);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredSchools = schoolQuery
    ? schools.filter((s) => s.includes(schoolQuery))
    : schools;

  const canConfirm = showGrade
    ? tempSchool !== "" && tempGrade !== ""
    : tempSchool !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-[430px] rounded-t-3xl bg-background shadow-2xl slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-base font-bold">{t("onboard.school.title")}</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted">
            <X className="h-4 w-4 text-muted-foreground/60" />
          </button>
        </div>

        {/* School search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
            <input
              ref={inputRef}
              value={schoolQuery}
              onChange={(e) => setSchoolQuery(e.target.value)}
              placeholder={t("onboard.school.placeholder")}
              className="w-full rounded-2xl border border-border/80 bg-card py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>

        {/* School list */}
        <div className="max-h-36 overflow-y-auto px-5">
          <div className="space-y-1 pb-2">
            {filteredSchools.map((s) => (
              <button
                key={s}
                onClick={() => setTempSchool(s)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-all ${
                  tempSchool === s
                    ? "border-primary/50 bg-primary-soft text-primary"
                    : "border-border/60 bg-card text-foreground hover:bg-muted/50"
                }`}
              >
                <span>{s}</span>
                {tempSchool === s && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
            <button
              onClick={() => setTempSchool(t("onboard.school.other"))}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-all ${
                tempSchool === t("onboard.school.other")
                  ? "border-primary/50 bg-primary-soft text-primary"
                  : "border-border/60 bg-card text-foreground hover:bg-muted/50"
              }`}
            >
              <span>{t("onboard.school.other")}</span>
              {tempSchool === t("onboard.school.other") && <Check className="h-4 w-4 text-primary" />}
            </button>
          </div>
        </div>

        {/* Grade section */}
        {showGrade && (
          <div className="px-5 pt-3 pb-2">
            <p className="text-xs font-semibold text-muted-foreground/60 mb-2">{t("onboard.grade.title")}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {grades.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setTempGrade(g.id)}
                  className={`rounded-xl border px-2 py-2 text-center text-xs font-medium transition-all ${
                    tempGrade === g.id
                      ? "border-primary/50 bg-primary-soft text-primary"
                      : "border-border/60 bg-card text-foreground hover:bg-muted/50"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confirm button */}
        <div className="px-5 pb-6 pt-3">
          <button
            onClick={() => canConfirm && onConfirm(tempSchool, tempGrade)}
            disabled={!canConfirm}
            className={`w-full rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.97] ${
              canConfirm
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground/50"
            }`}
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [role, setRoleState] = useState<Role | "">("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [linkEmail, setLinkEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linked, setLinked] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);

  const navigate = useNavigate();
  const t = useT();
  const setRoleInStore = useAppStore((s) => s.setRole);

  const isHK = country === "hk";
  const schools = isHK ? HK_SCHOOLS : CN_SCHOOLS;
  const grades = isHK ? HK_GRADES : CN_GRADES;

  // Student: country(0) → role(1) → gender(2) → age(3) → school+grade(4) = 5 steps
  // Parent:  country(0) → role(1) → school(2) → link(3) = 4 steps
  const totalSteps = role === "parent" ? 4 : 5;

  const canNext =
    (step === 0 && country !== "") ||
    (step === 1 && role !== "") ||
    (step === 2 && (
      (role === "student" && gender !== "") ||
      (role === "parent" && school !== "")
    )) ||
    (step === 3 && (
      (role === "student" && age !== "" && Number(age) > 0 && Number(age) < 100) ||
      (role === "parent" && linked)
    )) ||
    (step === 4 && role === "student" && school !== "" && grade !== "");

  const handleNext = async () => {
    if (step === 1) {
      if (role) {
        setRoleInStore(role as Role);
        const userId = useAppStore.getState().userId;
        if (userId) {
          try {
            await apiSelectRole(userId, role.toUpperCase());
          } catch (_err) {
            // proceed to next step even if role sync fails
          }
        }
      }
    }
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      useAppStore.getState().setOnboarded();
      if (role === "student" && grade) {
        useAppStore.getState().setGrade(grade);
      }
      const r = role as Role;
      navigate({ to: r === "student" ? "/student/learn" : "/parent/overview" });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      if (step === 1) {
        setRoleState("");
        setGender("");
        setAge("");
        setSchool("");
        setGrade("");
        setLinked(false);
        setLinkEmail("");
        setLinkError("");
        setSearching(false);
      }
    } else {
      navigate({ to: "/login" });
    }
  };

  const handleSchoolConfirm = (selectedSchool: string, selectedGrade: string) => {
    setSchool(selectedSchool);
    if (role === "student") {
      setGrade(selectedGrade);
    }
    setShowSchoolPicker(false);
  };

  const stepContent = [
    /* Step 0: Country */
    <div key="country" className="flex flex-col items-center pt-10">
      <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-primary-soft text-4xl" style={{ width: 72, height: 72 }}>
        🌏
      </div>
      <h2 className="mt-7 text-xl font-bold tracking-tight">{t("onboard.country.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground/70">{t("onboard.country.subtitle")}</p>
      <div className="mt-7 grid w-full grid-cols-2 gap-2.5">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCountry(c.id)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ${
              country === c.id
                ? "border-primary/50 bg-primary-soft shadow-sm"
                : "border-border/60 bg-card hover:border-border hover:bg-muted/50"
            }`}
          >
            <span className="text-xl">{c.flag}</span>
            <span className={`text-sm font-medium ${country === c.id ? "text-primary" : "text-foreground"}`}>
              {c.label}
            </span>
          </button>
        ))}
      </div>
    </div>,

    /* Step 1: Role */
    <div key="role" className="flex flex-col items-center pt-10">
      <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-primary-soft text-4xl" style={{ width: 72, height: 72 }}>
        🧑‍🎓
      </div>
      <h2 className="mt-7 text-xl font-bold tracking-tight">{t("onboard.role.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground/70">{t("onboard.role.subtitle")}</p>
      <div className="mt-8 w-full space-y-3">
        {([
          { r: "student" as const, emoji: "📚" },
          { r: "parent" as const, emoji: "👨‍👩‍👧" },
        ]).map(({ r, emoji }) => (
          <button
            key={r}
            onClick={() => setRoleState(r)}
            className={`flex w-full items-center gap-4 rounded-2xl border p-4.5 text-left transition-all duration-200 ${
              role === r
                ? "border-primary/50 bg-primary-soft shadow-sm"
                : "border-border/60 bg-card hover:border-border hover:bg-muted/50"
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <span className={`text-sm font-semibold ${role === r ? "text-primary" : "text-foreground"}`}>
                {t(`onboard.role.${r}`)}
              </span>
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                {t(`onboard.role.${r}Desc`)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>,
  ];

  const studentSteps = [
    /* Step 2: Gender */
    <div key="gender" className="flex flex-col items-center pt-10">
      <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-primary-soft text-4xl" style={{ width: 72, height: 72 }}>
        🧑
      </div>
      <h2 className="mt-7 text-xl font-bold tracking-tight">{t("onboard.gender.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground/70">{t("onboard.gender.subtitle")}</p>
      <div className="mt-8 flex w-full gap-3">
        {GENDERS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGender(g.id)}
            className={`flex flex-1 flex-col items-center gap-3 rounded-2xl border p-6 transition-all duration-200 ${
              gender === g.id
                ? "border-primary/50 bg-primary-soft shadow-sm"
                : "border-border/60 bg-card hover:border-border hover:bg-muted/50"
            }`}
          >
            <span className="text-4xl">{g.emoji}</span>
            <span className={`text-sm font-medium ${gender === g.id ? "text-primary" : "text-foreground"}`}>
              {t(g.label)}
            </span>
          </button>
        ))}
      </div>
    </div>,

    /* Step 3: Age */
    <div key="age" className="flex flex-col items-center pt-10">
      <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-primary-soft text-4xl" style={{ width: 72, height: 72 }}>
        🎂
      </div>
      <h2 className="mt-7 text-xl font-bold tracking-tight">{t("onboard.age.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground/70">{t("onboard.age.subtitle")}</p>
      <div className="mt-8 w-full">
        <input
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))}
          type="number"
          min={1}
          max={99}
          placeholder={t("onboard.age.placeholder")}
          className="w-full rounded-2xl border border-border/80 bg-card px-4 py-4 text-center text-xl font-bold outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          autoFocus
        />
      </div>
    </div>,

    /* Step 4: School + Grade (trigger picker) */
    <div key="school-grade" className="flex flex-col items-center pt-10">
      <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-primary-soft text-4xl" style={{ width: 72, height: 72 }}>
        🏫
      </div>
      <h2 className="mt-7 text-xl font-bold tracking-tight">{t("onboard.school.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground/70">{t("onboard.school.subtitle")}</p>
      <div className="mt-6 w-full">
        <button
          onClick={() => setShowSchoolPicker(true)}
          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all ${
            school && grade
              ? "border-primary/50 bg-primary-soft"
              : "border-border/80 bg-card hover:border-border"
          }`}
        >
          <div className="flex flex-col">
            {school && grade ? (
              <>
                <span className="text-sm font-semibold text-primary">{school}</span>
                <span className="text-xs text-muted-foreground/60 mt-0.5">
                  {grades.find((g) => g.id === grade)?.label ?? grade}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground/50">{t("onboard.school.placeholder")}</span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        </button>
      </div>
    </div>,
  ];

  const parentSteps = [
    /* Step 2: School (parent also uses picker) */
    <div key="school" className="flex flex-col items-center pt-10">
      <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-primary-soft text-4xl" style={{ width: 72, height: 72 }}>
        🏫
      </div>
      <h2 className="mt-7 text-xl font-bold tracking-tight">{t("onboard.school.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground/70">{t("onboard.school.subtitle")}</p>
      <div className="mt-6 w-full">
        <button
          onClick={() => setShowSchoolPicker(true)}
          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all ${
            school
              ? "border-primary/50 bg-primary-soft"
              : "border-border/80 bg-card hover:border-border"
          }`}
        >
          <span className={`text-sm ${school ? "font-semibold text-primary" : "text-muted-foreground/50"}`}>
            {school || t("onboard.school.placeholder")}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        </button>
      </div>
    </div>,

    /* Step 3: Link child via email */
    <div key="link" className="flex flex-col items-center pt-10">
      <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-primary-soft text-4xl" style={{ width: 72, height: 72 }}>
        🔗
      </div>
      <h2 className="mt-7 text-xl font-bold tracking-tight">{t("onboard.link.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground/70">{t("onboard.link.subtitle")}</p>
      <div className="mt-8 w-full space-y-3">
        <div className="relative">
          <input
            value={linkEmail}
            onChange={(e) => {
              setLinkEmail(e.target.value);
              setLinkError("");
            }}
            placeholder={t("onboard.link.emailPlaceholder")}
            type="email"
            className="w-full rounded-2xl border border-border/80 bg-card px-4 py-3.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
          {searching && (
            <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>
        {linkError && (
          <div className="flex items-center gap-2 rounded-2xl bg-danger-soft/60 p-3.5 text-sm text-danger">
            <span>⚠️</span>
            {linkError}
          </div>
        )}
        {linked && (
          <div className="flex items-center gap-2 rounded-2xl bg-mastered-soft/80 p-3.5 text-sm text-mastered">
            <span>✅</span>
            {t("onboard.link.success")}
          </div>
        )}
        {!linked && linkEmail && !linkError && (
          <button
            disabled={searching}
            onClick={async () => {
              setSearching(true);
              setLinkError("");
              try {
                const result = await apiGetStudentUuidByEmail(linkEmail.trim());
                if (!result) {
                  setLinkError(t("onboard.link.notFound"));
                  setSearching(false);
                  return;
                }
                await apiBindChild(result.id);
                setLinked(true);
              } catch (err: any) {
                if (err?.message?.includes("409") || err?.message?.includes("already linked")) {
                  setLinkError(t("onboard.link.alreadyLinked"));
                } else {
                  setLinkError(t("onboard.link.failed"));
                }
              } finally {
                setSearching(false);
              }
            }}
            className="w-full rounded-2xl bg-primary-soft py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary/15 active:scale-[0.97] disabled:opacity-60"
          >
            {searching ? t("onboard.link.searching") : t("onboard.link.bind")}
          </button>
        )}
      </div>
    </div>,
  ];

  let allSteps = [...stepContent];
  if (role === "student") {
    allSteps = [...allSteps, ...studentSteps];
  } else if (role === "parent") {
    allSteps = [...allSteps, ...parentSteps];
  }

  return (
    <div className="phone-frame">
      <div className="flex flex-1 flex-col px-6">
        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 pt-5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-7 bg-primary" : i < step ? "w-1.5 bg-primary/60" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex flex-1 flex-col page-enter" key={step}>{allSteps[step]}</div>

        {/* Navigation */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={handleBack}
            className="flex h-13 items-center justify-center gap-1 rounded-2xl border border-border/60 bg-card px-5 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95"
            style={{ height: 52 }}
          >
            <ChevronLeft className="h-4 w-4" />
            {t("onboard.back")}
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext}
            className={`flex flex-1 items-center justify-center gap-1 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.97] ${
              canNext
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground/50"
            }`}
          >
            {step < totalSteps - 1 ? t("onboard.next") : t("onboard.finish")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* School & Grade Picker Modal */}
      {showSchoolPicker && (
        <SchoolGradePicker
          schools={schools}
          grades={grades}
          selectedSchool={school}
          selectedGrade={grade}
          onConfirm={handleSchoolConfirm}
          onClose={() => setShowSchoolPicker(false)}
          t={t}
          showGrade={role === "student"}
        />
      )}
    </div>
  );
}
