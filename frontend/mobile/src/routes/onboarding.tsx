import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore, type Role } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";

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

const GRADES = [
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

const SCHOOLS = [
  "北京市第一中学", "北京市第四中学", "北京师范大学附属中学",
  "上海市上海中学", "华东师范大学第二附属中学", "复旦大学附属中学",
  "广州市执信中学", "深圳中学", "华南师范大学附属中学",
  "杭州市第二中学", "南京师范大学附属中学", "武汉市第二中学",
  "成都市第七中学", "西安市高新一中", "长沙市雅礼中学",
];

function OnboardingPage() {
  // Step 0: Country → Step 1: Role → Student: 2:Gender → 3:Age → 4:School → 5:Grade | Parent: 2:School  → 3:Link
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState("");
  const [role, setRoleState] = useState<Role | "">("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [linked, setLinked] = useState(false);
  const [grade, setGrade] = useState("");

  const navigate = useNavigate();
  const t = useT();
  const setRoleInStore = useAppStore((s) => s.setRole);

  // Total steps: student = 6, parent = 4
  const totalSteps = role === "parent" ? 4 : role === "student" ? 6 : 2;

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
    (step === 4 && role === "student" && school !== "") ||
    (step === 5 && role === "student" && grade !== "");

  const handleNext = () => {
    if (step === 1) {
      // Role selected — set in store
      if (role) setRoleInStore(role as Role);
    }
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      // Finish onboarding
      useAppStore.getState().setOnboarded();
      const r = role as Role;
      navigate({ to: r === "student" ? "/student/learn" : "/parent/overview" });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate({ to: "/login" });
  };

  const filteredSchools = schoolQuery
    ? SCHOOLS.filter((s) => s.includes(schoolQuery))
    : SCHOOLS;

  const steps = [
    // Step 0: Country/Region
    <div key="country" className="flex flex-col items-center pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
        🌏
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{t("onboard.country.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboard.country.subtitle")}</p>
      <div className="mt-6 grid w-full grid-cols-2 gap-2">
        {COUNTRIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCountry(c.id)}
            className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left transition-colors ${
              country === c.id
                ? "border-primary bg-primary-soft"
                : "border-border bg-card hover:bg-muted"
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

    // Step 1: Role selection
    <div key="role" className="flex flex-col items-center pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
        🧑‍🎓
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{t("onboard.role.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboard.role.subtitle")}</p>
      <div className="mt-8 w-full space-y-3">
        {([
          { r: "student" as const, emoji: "📚" },
          { r: "parent" as const, emoji: "👨‍👩‍👧" },
        ]).map(({ r, emoji }) => (
          <button
            key={r}
            onClick={() => setRoleState(r)}
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
              role === r
                ? "border-primary bg-primary-soft"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <span className={`text-sm font-semibold ${role === r ? "text-primary" : "text-foreground"}`}>
                {t(`onboard.role.${r}`)}
              </span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t(`onboard.role.${r}Desc`)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>,
  ];

  // Student-only steps (inserted after step 1)
  const studentSteps = [
    // Step 2: Gender
    <div key="gender" className="flex flex-col items-center pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
        🧑
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{t("onboard.gender.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboard.gender.subtitle")}</p>
      <div className="mt-8 flex w-full gap-3">
        {GENDERS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGender(g.id)}
            className={`flex flex-1 flex-col items-center gap-3 rounded-2xl border p-5 transition-colors ${
              gender === g.id
                ? "border-primary bg-primary-soft"
                : "border-border bg-card hover:bg-muted"
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

    // Step 3: Age
    <div key="age" className="flex flex-col items-center pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
        🎂
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{t("onboard.age.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboard.age.subtitle")}</p>
      <div className="mt-8 w-full">
        <input
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))}
          type="number"
          min={1}
          max={99}
          placeholder={t("onboard.age.placeholder")}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-center text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
      </div>
    </div>,

    // Step 4: School selection
    <div key="school" className="flex flex-col items-center pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
        🏫
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{t("onboard.school.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboard.school.subtitle")}</p>
      <div className="mt-6 w-full">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={schoolQuery}
            onChange={(e) => setSchoolQuery(e.target.value)}
            placeholder={t("onboard.school.placeholder")}
            className="w-full rounded-xl border border-input bg-background py-3 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto">
          {filteredSchools.map((s) => (
            <button
              key={s}
              onClick={() => setSchool(s)}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                school === s
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => setSchool(t("onboard.school.other"))}
            className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
              school === t("onboard.school.other")
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {t("onboard.school.other")}
          </button>
        </div>
      </div>
    </div>,

    // Step 5: Grade
    <div key="grade" className="flex flex-col items-center pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
        📚
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{t("onboard.grade.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboard.grade.subtitle")}</p>
      <div className="mt-6 grid w-full grid-cols-2 gap-2">
        {GRADES.map((g) => (
          <button
            key={g.id}
            onClick={() => setGrade(g.id)}
            className={`rounded-2xl border px-3 py-2.5 text-center text-sm font-medium transition-colors ${
              grade === g.id
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
    </div>,
  ];

  // Parent-only steps (inserted after step 1)
  const parentSteps = [
    // Step 2: School selection
    <div key="school" className="flex flex-col items-center pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
        🏫
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{t("onboard.school.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboard.school.subtitle")}</p>
      <div className="mt-6 w-full">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={schoolQuery}
            onChange={(e) => setSchoolQuery(e.target.value)}
            placeholder={t("onboard.school.placeholder")}
            className="w-full rounded-xl border border-input bg-background py-3 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto">
          {filteredSchools.map((s) => (
            <button
              key={s}
              onClick={() => setSchool(s)}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                school === s
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => setSchool(t("onboard.school.other"))}
            className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
              school === t("onboard.school.other")
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {t("onboard.school.other")}
          </button>
        </div>
      </div>
    </div>,

    // Step 3: Student linking
    <div key="link" className="flex flex-col items-center pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-3xl">
        🔗
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight">{t("onboard.link.title")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("onboard.link.subtitle")}</p>
      <div className="mt-8 w-full space-y-3">
        <input
          value={linkPhone}
          onChange={(e) => setLinkPhone(e.target.value)}
          placeholder={t("onboard.link.phonePlaceholder")}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <div className="relative">
          <input
            value={linkCode}
            onChange={(e) => setLinkCode(e.target.value)}
            placeholder={t("onboard.link.codePlaceholder")}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-24 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary"
          >
            {t("onboard.link.getCode")}
          </button>
        </div>
        {linked && (
          <div className="flex items-center gap-2 rounded-xl bg-mastered-soft p-3 text-sm text-mastered">
            <span>✅</span>
            {t("onboard.link.success")}
          </div>
        )}
        {!linked && linkPhone && linkCode && (
          <button
            onClick={() => setLinked(true)}
            className="w-full rounded-xl bg-primary-soft py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            {t("onboard.next")}
          </button>
        )}
      </div>
    </div>,
  ];

  // Build the steps array based on role
  let allSteps = [...steps];
  if (role === "student") {
    allSteps = [...allSteps, ...studentSteps];
  } else if (role === "parent") {
    allSteps = [...allSteps, ...parentSteps];
  }

  return (
    <div className="phone-frame">
      <div className="flex flex-1 flex-col px-6">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex flex-1 flex-col">{allSteps[step]}</div>

        {/* Navigation buttons */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-1 rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("onboard.back")}
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext}
            className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
              canNext
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step < totalSteps - 1 ? t("onboard.next") : t("onboard.finish")}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
