// App shell — left nav, top bar, view router.

import { useEffect, useState } from 'react';
import type { Lang, NavState, TweakState, UserProfile } from './types';
import { CLASSES_TEACHER } from './lib/data';
import { hexToSoft } from './lib/format';
import { classDisplayName, setLang, t, useLang } from './lib/i18n';

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
import { ViewLogin } from './views/Login';

const ACCENT = '#2f5cff';

interface AuthUser { id: number; name: string; role: string; }

export function App() {
  const [lang, setLangState] = useState<Lang>('en');
  const [nav, setNav] = useState<NavState>({ view: 'dashboard' });
  const [collapsed, setCollapsed] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try { return JSON.parse(localStorage.getItem('lumen_user') || 'null'); } catch { return null; }
  });

  useLang();

  useEffect(() => { setLang(lang); }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = 'light';
    root.dataset.density = 'comfortable';
    root.style.setProperty('--accent', ACCENT);
    root.style.setProperty('--accent-soft', hexToSoft(ACCENT, 0.12));
    root.style.setProperty('--accent-strong', hexToSoft(ACCENT, 0.22));
  }, []);

  function handleLogin(token: string, user: AuthUser) {
    localStorage.setItem('lumen_token', token);
    localStorage.setItem('lumen_user', JSON.stringify(user));
    setAuthUser(user);
  }

  if (!authUser) {
    return <ViewLogin onLogin={handleLogin} />;
  }

  const profile: UserProfile = { name: authUser.name, role: t('Mathematics · Grade 7–8') };

  const classes = CLASSES_TEACHER;
  const klass = nav.classId ? classes.find((c) => c.id === nav.classId) : undefined;
  const student = nav.studentId && klass ? klass.students.find((s) => s.id === nav.studentId) : undefined;

  const home = () => ({ label: t('Home'), onClick: () => setNav({ view: 'dashboard' }) });
  let crumbs: Array<{ label: string; onClick?: () => void }>;
  switch (nav.view) {
    case 'dashboard':      crumbs = [{ label: t('Dashboard') }]; break;
    case 'classes':        crumbs = [home(), { label: t('Classes') }]; break;
    case 'class-detail':   crumbs = [
      home(),
      { label: t('Classes'), onClick: () => setNav({ view: 'classes' }) },
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
    role: 'teacher',
    density: 'comfortable',
    accent: [ACCENT, '#0e1422', '#e7e9ef'],
    sidebar: collapsed ? 'collapsed' : 'labeled',
    chartStyle: 'stacked',
    dark: false,
    lang,
  };

  return (
    <div className="app">
      <Sidebar
        view={nav.view}
        onNavigate={(n) => setNav(n as NavState)}
        role="teacher"
        collapsed={collapsed}
        onCollapsedToggle={() => setCollapsed((v) => !v)}
        onSubscriptionClick={() => setShowSubscription(true)}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="main">
        <Topbar
          breadcrumbs={crumbs}
          profile={profile}
          lang={lang}
          onLangChange={setLangState}
        />

        <main className="main__body">
          {nav.view === 'dashboard' && (
            <ViewDashboard classes={classes} onNavigate={setNav} profile={profile} tweak={tweak} />
          )}
          {nav.view === 'classes' && (
            <ViewClassesIndex classes={classes} onNavigate={setNav} />
          )}
          {nav.view === 'class-detail' && klass && (
            <ViewClassDetail klass={klass} onNavigate={setNav} focusPointId={nav.focusPointId} tweak={tweak} />
          )}
          {nav.view === 'student-detail' && student && klass && (
            <ViewStudentDetail student={student} klass={klass} onNavigate={setNav} />
          )}
          {nav.view === 'students' && (
            <ViewStudents classes={classes} onNavigate={setNav} />
          )}
          {nav.view === 'mental-health' && (
            <ViewMentalHealth classes={classes} onNavigate={setNav} />
          )}
        </main>
      </div>

      {showSubscription && <SubscriptionModal onClose={() => setShowSubscription(false)} />}
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
