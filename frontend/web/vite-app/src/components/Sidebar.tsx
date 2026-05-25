import type { Role } from '../types';
import { classNames } from '../lib/format';
import { t } from '../lib/i18n';
import { Icon } from './Icon';

interface NavItem { id: string; label: string; icon: string }

interface SidebarProps {
  view: string;
  onNavigate: (next: { view: string }) => void;
  role: Role;
  collapsed: boolean;
  onCollapsedToggle: () => void;
  onSubscriptionClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
}

export function Sidebar({ view, onNavigate, role, collapsed, onCollapsedToggle, onSubscriptionClick, onSettingsClick, onLogout }: SidebarProps) {
  const items: NavItem[] = [
    { id: 'dashboard',     label: t('Dashboard'),     icon: 'home' },
    { id: 'classes',       label: t('Classes'),       icon: 'grid' },
    { id: 'students',      label: t('Students'),      icon: 'users' },
    { id: 'mental-health', label: t('Mental Health'), icon: 'heart' },
  ];
  const adminItems: NavItem[] = [
    { id: 'admin-school', label: t('School Overview'), icon: 'school' },
  ];

  const goTo = (id: string) => onNavigate({ view: id });

  return (
    <aside className={classNames('sidebar', collapsed && 'sidebar--collapsed')}>
      <div className="sidebar__brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <path d="M4 18 12 4l8 14H4z" fill="currentColor" />
            <circle cx="12" cy="14" r="2.5" fill="var(--bg-elev)" />
          </svg>
        </div>
        {!collapsed && (
          <div className="brand-text">
            <div className="brand-name">Lumen</div>
            <div className="brand-tag">{t('Teacher Console')}</div>
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__group-label">{!collapsed && t('Teach')}</div>
        {items.map((it) => (
          <button
            key={it.id}
            className={classNames('navitem', view === it.id && 'navitem--active')}
            onClick={() => goTo(it.id)}
          >
            <Icon name={it.icon} />
            {!collapsed && <span>{it.label}</span>}
          </button>
        ))}
        {role === 'admin' && (
          <>
            <div className="sidebar__group-label">{!collapsed && t('Administration')}</div>
            {adminItems.map((it) => (
              <button
                key={it.id}
                className={classNames('navitem', view === it.id && 'navitem--active')}
                onClick={() => goTo(it.id)}
              >
                <Icon name={it.icon} />
                {!collapsed && <span>{it.label}</span>}
              </button>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar__foot">
        <button
          className="navitem"
          onClick={onSubscriptionClick}
          title={t('Subscription')}
        >
          <Icon name="card" />
          {!collapsed && <span>{t('Subscription')}</span>}
        </button>
        <button
          className="navitem"
          onClick={onSettingsClick}
          title={t('Settings')}
        >
          <Icon name="settings" />
          {!collapsed && <span>{t('Settings')}</span>}
        </button>
        <button
          className="navitem"
          onClick={onLogout}
          title={t('Log out')}
        >
          <Icon name="logout" />
          {!collapsed && <span>{t('Log out')}</span>}
        </button>
        <button
          className="navitem sidebar__collapse-btn"
          onClick={onCollapsedToggle}
          title={collapsed ? t('Expand') : t('Collapse')}
        >
          <Icon
            name="chevron"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
          />
          {!collapsed && <span>{t('Collapse')}</span>}
        </button>
      </div>
    </aside>
  );
}
