// App shell — left nav, top bar, view router. State is local React for now;
// swap for React Router + Zustand stores when you wire up real routes/auth.

import { useEffect, useState } from 'react';
import type { NavState, Role, TweakState, UserProfile } from './types';
import { CLASSES_ADMIN_EXTRA, CLASSES_TEACHER } from './lib/data';
import { hexToSoft } from './lib/format';
import { classDisplayName, setLang, t, useLang } from './lib/i18n';

import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import {
  TweakColor,
  TweakRadio,
  TweakSection,
  TweakToggle,
  TweaksPanel,
} from './components/TweaksPanel';

import { ViewDashboard } from './views/Dashboard';
import { ViewClassesIndex } from './views/Classes';
import { ViewClassDetail } from './views/ClassDetail';
import { ViewStudentDetail } from './views/StudentDetail';
import { ViewStudents } from './views/Students';
import { ViewMentalHealth } from './views/MentalHealth';
import { ViewAdminSchool } from './views/AdminSchool';

const DEFAULT_TWEAKS: TweakState = {
  role: 'teacher',
  density: 'comfortable',
  accent: ['#2f5cff', '#0e1422', '#e7e9ef'],
  sidebar: 'labeled',
  chartStyle: 'stacked',
  dark: false,
  lang: 'en',
};

export function App() {
  const [tw, setTw] = useState<TweakState>(DEFAULT_TWEAKS);
  const [nav, setNav] = useState<NavState>({ view: 'dashboard' });

  // Subscribe to the i18n store so child components re-render on language change.
  useLang();

  // Apply language → i18n store + <html lang>.
  useEffect(() => { setLang(tw.lang); }, [tw.lang]);

  // Apply theme / density / accent → root data attributes + CSS vars.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = tw.dark ? 'dark' : 'light';
    root.dataset.density = tw.density;
    const accentHero = Array.isArray(tw.accent) ? tw.accent[0] : tw.accent;
    root.style.setProperty('--accent', accentHero);
    root.style.setProperty('--accent-soft', hexToSoft(accentHero, tw.dark ? 0.18 : 0.12));
    root.style.setProperty('--accent-strong', hexToSoft(accentHero, tw.dark ? 0.32 : 0.22));
  }, [tw.dark, tw.density, tw.accent]);

  // Reset to dashboard when the role changes so the user lands on the right home.
  useEffect(() => { setNav({ view: 'dashboard' }); }, [tw.role]);

  const teacherProfile: UserProfile = { name: 'Chen Wei',     role: 'Mathematics · Grade 7–8' };
  const adminProfile:   UserProfile = { name: 'Park Ji-hoon', role: 'School Administrator' };
  const profileRaw = tw.role === 'admin' ? adminProfile : teacherProfile;
  const profile: UserProfile = { ...profileRaw, role: t(profileRaw.role) };

  const teacherClasses = CLASSES_TEACHER;
  const adminClasses = [...CLASSES_TEACHER, ...CLASSES_ADMIN_EXTRA];
  const activeClasses = tw.role === 'admin' ? adminClasses : teacherClasses;

  const klass = nav.classId ? activeClasses.find((c) => c.id === nav.classId) : undefined;
  const student = nav.studentId && klass ? klass.students.find((s) => s.id === nav.studentId) : undefined;

  // Breadcrumbs
  const home = () => ({ label: t('Home'), onClick: () => setNav({ view: 'dashboard' }) });
  let crumbs: Array<{ label: string; onClick?: () => void }>;
  switch (nav.view) {
    case 'dashboard':     crumbs = [{ label: t('Dashboard') }]; break;
    case 'classes':       crumbs = [home(), { label: t('Classes') }]; break;
    case 'class-detail':  crumbs = [
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
    case 'admin-school':   crumbs = [home(), { label: t('School Overview') }]; break;
    default:               crumbs = [home()];
  }

  const setTweak = <K extends keyof TweakState>(key: K, value: TweakState[K]) =>
    setTw((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="app">
      <Sidebar view={nav.view} onNavigate={(n) => setNav(n as NavState)}
               role={tw.role} collapsed={tw.sidebar === 'collapsed'} />

      <div className="main">
        <Topbar role={tw.role} onRoleChange={(r: Role) => setTweak('role', r)}
                breadcrumbs={crumbs} profile={profile} />

        <main className="main__body">
          {nav.view === 'dashboard' && (
            tw.role === 'admin'
              ? <ViewAdminSchool classes={activeClasses} onNavigate={setNav} />
              : <ViewDashboard classes={activeClasses} onNavigate={setNav} profile={profile} tweak={tw} />
          )}
          {nav.view === 'classes' && (
            <ViewClassesIndex classes={activeClasses} onNavigate={setNav} />
          )}
          {nav.view === 'class-detail' && klass && (
            <ViewClassDetail klass={klass} onNavigate={setNav} focusPointId={nav.focusPointId} tweak={tw} />
          )}
          {nav.view === 'student-detail' && student && klass && (
            <ViewStudentDetail student={student} klass={klass} onNavigate={setNav} />
          )}
          {nav.view === 'students' && (
            <ViewStudents classes={activeClasses} onNavigate={setNav} />
          )}
          {nav.view === 'mental-health' && (
            <ViewMentalHealth classes={activeClasses} onNavigate={setNav} />
          )}
          {nav.view === 'admin-school' && (
            <ViewAdminSchool classes={adminClasses} onNavigate={setNav} />
          )}
        </main>
      </div>

      <TweaksPanel title={t('Tweaks') || 'Tweaks'}>
        <TweakSection label={t('Language')}>
          <TweakRadio
            label={t('Language')}
            value={tw.lang}
            options={[
              { value: 'en',    label: 'English' },
              { value: 'zh-TW', label: '繁體中文' },
            ]}
            onChange={(v) => setTweak('lang', v)}
          />
        </TweakSection>

        <TweakSection label={t('Role')}>
          <TweakRadio
            label={t('View as')}
            value={tw.role}
            options={[
              { value: 'teacher', label: t('Teacher') },
              { value: 'admin',   label: t('Admin') },
            ]}
            onChange={(v) => setTweak('role', v)}
          />
        </TweakSection>

        <TweakSection label={t('Appearance')}>
          <TweakColor
            label={t('Accent')}
            value={tw.accent}
            options={[
              ['#2f5cff', '#0e1422', '#e7e9ef'],
              ['#b86438', '#1a1612', '#e9e2d3'],
              ['#2f7a55', '#0f1814', '#e1e8e3'],
              ['#7a5ad6', '#16111f', '#e6e2ee'],
            ]}
            onChange={(v) => setTweak('accent', v as string[])}
          />
          <TweakToggle label={t('Dark mode')} value={tw.dark} onChange={(v) => setTweak('dark', v)} />
          <TweakRadio
            label={t('Density')}
            value={tw.density}
            options={[
              { value: 'compact',     label: t('Compact') },
              { value: 'comfortable', label: t('Comfy') },
            ]}
            onChange={(v) => setTweak('density', v)}
          />
        </TweakSection>

        <TweakSection label={t('Layout')}>
          <TweakRadio
            label={t('Sidebar')}
            value={tw.sidebar}
            options={[
              { value: 'labeled',   label: t('Labeled') },
              { value: 'collapsed', label: t('Icons') },
            ]}
            onChange={(v) => setTweak('sidebar', v)}
          />
          <TweakRadio
            label={t('Mastery chart')}
            value={tw.chartStyle}
            options={[
              { value: 'stacked', label: t('Stacked') },
              { value: 'split',   label: t('Split') },
            ]}
            onChange={(v) => setTweak('chartStyle', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
