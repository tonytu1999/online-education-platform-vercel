// App shell — left nav, top bar, view router.

import { useEffect, useRef, useState } from 'react';
import type { Klass, Lang, NavState, Role, Student, TweakState, UserProfile } from './types';
import { CLASSES_ALL, CLASSES_TEACHER, SUBJECTS } from './lib/data';
import { hexToSoft } from './lib/format';
import { classDisplayName, setLang, subjectLabel, t, useLang } from './lib/i18n';
import {
  apiGetAdminDashboard,
  apiGetClassStudents,
  apiGetTeacherDashboard,
  type ApiSchoolStat,
} from './lib/api';
import { buildKlassFromStat, buildPlaceholderStudents, buildStudentFromReal } from './lib/mappers';
import { registerToast } from './lib/toast';

import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SettingsModal } from './components/SettingsModal';

import { ViewDashboard } from './views/Dashboard';
import { ViewClassesIndex } from './views/Classes';
import { ViewClassDetail } from './views/ClassDetail';
import { ViewStudentDetail } from './views/StudentDetail';
import { ViewStudents } from './views/Students';
import { ViewMentalHealth } from './views/MentalHealth';
import { ViewAdminSchool } from './views/AdminSchool';
import { ViewAdminGrade } from './views/AdminGrade';
import { ViewAdminClasses } from './views/AdminClasses';
import { ViewAdminTeachers } from './views/AdminTeachers';
import { ViewLogin } from './views/Login';
import { ViewJoinSchool } from './views/JoinSchool';

const ACCENT = '#2f5cff';

interface AuthUser { id: number; name: string; role: string; }

function deriveRole(user: AuthUser): Role {
  return user.role === 'SCHOOL_ADMIN' ? 'admin' : 'teacher';
}

function initialNav(user: AuthUser | null): NavState {
  if (!user) return { view: 'dashboard' };
  return { view: deriveRole(user) === 'admin' ? 'admin-school' : 'dashboard' };
}

export function App() {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lumen_lang') as Lang) || 'en',
  );
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('lumen_user') || 'null'); } catch { return null; }
  });
  const [nav, setNavRaw] = useState<NavState>(() => initialNav(
    (() => { try { return JSON.parse(localStorage.getItem('lumen_user') || 'null'); } catch { return null; } })()
  ));
  const [schoolJoined, setSchoolJoined] = useState(() =>
    localStorage.getItem('lumen_school_joined') === 'true'
  );
  const [collapsed, setCollapsed] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => { registerToast(setToast); }, []);

  // Real data from backend — fall back to mock if API unavailable
  const [realClasses, setRealClasses] = useState<Klass[] | null>(null);
  const [apiSchool, setApiSchool] = useState<ApiSchoolStat | null>(null);
  const [studentCache, setStudentCache] = useState<Record<string, Student[]>>({});
  const fetchingStudents = useRef<Set<string>>(new Set());

  useLang();

  useEffect(() => {
    setLang(lang);
    localStorage.setItem('lumen_lang', lang);
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = 'light';
    root.dataset.density = 'comfortable';
    root.style.setProperty('--accent', ACCENT);
    root.style.setProperty('--accent-soft', hexToSoft(ACCENT, 0.12));
    root.style.setProperty('--accent-strong', hexToSoft(ACCENT, 0.22));
  }, []);

  // Fetch real data when logged in
  useEffect(() => {
    if (!authUser) return;
    const role = deriveRole(authUser);

    if (role === 'teacher') {
      apiGetTeacherDashboard().then((stats) => {
        const klasses = stats.map((s) =>
          buildKlassFromStat(s, buildPlaceholderStudents(s.classId, s.totalStudents))
        );
        setRealClasses(klasses);
        stats.forEach((s) => fetchStudentsForClass(s.classId));
      }).catch(() => { /* silently fall back to mock data */ });
    } else {
      apiGetAdminDashboard().then(setApiSchool).catch(() => {});
    }
  }, [authUser]);

  function fetchStudentsForClass(classId: string) {
    if (studentCache[classId] || fetchingStudents.current.has(classId)) return;
    fetchingStudents.current.add(classId);
    apiGetClassStudents(classId).then((apiStudents) => {
      const students = apiStudents.map((s) => buildStudentFromReal(s, classId));
      setStudentCache((prev) => ({ ...prev, [classId]: students }));
      setRealClasses((prev) =>
        prev ? prev.map((k) => k.id === classId ? { ...k, students } : k) : prev
      );
    }).catch(() => {
      fetchingStudents.current.delete(classId);
    });
  }

  // Lazy-load real students when navigating to a class detail
  useEffect(() => {
    const classId = nav.classId;
    if (nav.view !== 'class-detail' || !classId) return;
    fetchStudentsForClass(classId);
  }, [nav.view, nav.classId]);

  function handleLogin(token: string, user: AuthUser) {
    localStorage.setItem('lumen_token', token);
    localStorage.setItem('lumen_user', JSON.stringify(user));
    setAuthUser(user);
    setRealClasses(null);
    setApiSchool(null);
    setStudentCache({});
    fetchingStudents.current.clear();
    setNavRaw(initialNav(user));
  }

  function handleLogout() {
    localStorage.removeItem('lumen_token');
    localStorage.removeItem('lumen_user');
    setAuthUser(null);
    setRealClasses(null);
    setApiSchool(null);
    setStudentCache({});
    fetchingStudents.current.clear();
    setNavRaw({ view: 'dashboard' });
  }

  function handleJoinSchool() {
    localStorage.setItem('lumen_school_joined', 'true');
    setSchoolJoined(true);
  }

  // Intercept navigation to class-detail so we can trigger student fetch
  function setNav(n: NavState) {
    setNavRaw(n);
  }

  if (!authUser) return <ViewLogin onLogin={handleLogin} />;

  const role = deriveRole(authUser);

  if (role === 'teacher' && !schoolJoined) {
    return <ViewJoinSchool onJoin={handleJoinSchool} />;
  }

  const isAdmin = role === 'admin';

  // Use real classes for teacher when available, otherwise fall back to mock
  const classes: Klass[] = realClasses ?? CLASSES_TEACHER;
  const allClasses: Klass[] = isAdmin ? CLASSES_ALL : classes;

  const klassSource = isAdmin ? allClasses : classes;
  const klass = nav.classId ? klassSource.find((c) => c.id === nav.classId) : undefined;
  const student = nav.studentId && klass ? klass.students.find((s) => s.id === nav.studentId) : undefined;

  const profile: UserProfile = {
    name: authUser.name,
    role: isAdmin ? t('School Administrator') : t('Mathematics · Grade 7–8'),
  };

  if (!isAdmin) {
    const subjectIds = [...new Set(classes.map((c) => c.subjectId))];
    const subjects = subjectIds.map((id) => SUBJECTS.find((s) => s.id === id)).filter(Boolean);
    profile.role = subjects.length > 0 ? subjects.map((s) => subjectLabel(s!)).join(' · ') : t('Teacher');
  }

  const homeNav: NavState = { view: isAdmin ? 'admin-school' : 'dashboard' };
  const home = () => ({ label: isAdmin ? t('School Overview') : t('Dashboard'), onClick: () => setNav(homeNav) });

  let crumbs: Array<{ label: string; onClick?: () => void }>;
  switch (nav.view) {
    case 'dashboard':      crumbs = [{ label: t('Dashboard') }]; break;
    case 'admin-school':   crumbs = [{ label: t('School Overview') }]; break;
    case 'admin-grade':    crumbs = [home(), { label: t('Grade View') }]; break;
    case 'admin-classes':  crumbs = [home(), { label: t('All Classes') }]; break;
    case 'admin-teachers': crumbs = [home(), { label: t('Teachers') }]; break;
    case 'classes':        crumbs = [home(), { label: t('Classes') }]; break;
    case 'class-detail':   crumbs = [
      home(),
      { label: t('Classes'), onClick: () => setNav({ view: isAdmin ? 'admin-classes' : 'classes' }) },
      { label: klass ? classDisplayName(klass) : t('Class') },
    ]; break;
    case 'student-detail': crumbs = [
      home(),
      { label: klass ? classDisplayName(klass) : t('Class'),
        onClick: () => setNav({ view: 'class-detail', classId: nav.classId }) },
      { label: student ? student.name : t('Student') },
    ]; break;
    case 'students':       crumbs = [home(), { label: t('Students') }]; break;
    case 'mental-health':  crumbs = [home(), { label: t('Mental Health') }]; break;
    default:               crumbs = [home()];
  }

  const tweak: TweakState = {
    role,
    density: 'comfortable',
    accent: [ACCENT, '#0e1422', '#e7e9ef'],
    sidebar: collapsed ? 'collapsed' : 'labeled',
    chartStyle: 'stacked',
    dark: false,
    lang,
  };

  // Real school name for admin header (falls back to mock via i18n schoolName())
  const schoolNameOverride = apiSchool?.schoolName;

  return (
    <div className="app">
      <Sidebar
        view={nav.view}
        onNavigate={(n) => setNav(n as NavState)}
        role={role}
        collapsed={collapsed}
        onCollapsedToggle={() => setCollapsed((v) => !v)}
        onSubscriptionClick={() => setShowSubscription(true)}
        onSettingsClick={() => setShowSettings(true)}
        onLogout={handleLogout}
      />

      <div className="main">
        <Topbar
          breadcrumbs={crumbs}
          profile={profile}
          lang={lang}
          onLangChange={setLangState}
        />

        <main className="main__body">
          {/* Teacher views */}
          {nav.view === 'dashboard' && (
            <ViewDashboard classes={classes} onNavigate={setNav} profile={profile} tweak={tweak} />
          )}
          {nav.view === 'classes' && (
            <ViewClassesIndex classes={classes} onNavigate={setNav} />
          )}
          {nav.view === 'students' && (
            <ViewStudents classes={classes} onNavigate={setNav} />
          )}

          {/* Shared views */}
          {nav.view === 'class-detail' && klass && (
            <ViewClassDetail klass={klass} onNavigate={setNav} focusPointId={nav.focusPointId} tweak={tweak} />
          )}
          {nav.view === 'student-detail' && student && klass && (
            <ViewStudentDetail student={student} klass={klass} onNavigate={setNav} />
          )}
          {nav.view === 'mental-health' && (
            <ViewMentalHealth classes={isAdmin ? allClasses : classes} onNavigate={setNav} />
          )}

          {/* Admin views */}
          {nav.view === 'admin-school' && (
            <ViewAdminSchool classes={allClasses} onNavigate={setNav} schoolNameOverride={schoolNameOverride} />
          )}
          {nav.view === 'admin-grade' && (
            <ViewAdminGrade classes={allClasses} onNavigate={setNav} />
          )}
          {nav.view === 'admin-classes' && (
            <ViewAdminClasses classes={allClasses} onNavigate={setNav} />
          )}
          {nav.view === 'admin-teachers' && (
            <ViewAdminTeachers classes={allClasses} onNavigate={setNav} />
          )}
        </main>
      </div>

      {showSubscription && <SubscriptionModal onClose={() => setShowSubscription(false)} />}
      {toast && (
        <div className="toast-banner" role="status">{toast}</div>
      )}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          profile={profile}
          lang={lang}
          onLangChange={setLangState}
        />
      )}
    </div>
  );
}
