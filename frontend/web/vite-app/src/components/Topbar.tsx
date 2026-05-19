// App-wide top bar: breadcrumbs, role switch, notifications, profile chip.
import { Fragment } from 'react';
import type { Role, UserProfile } from '../types';
import { classNames } from '../lib/format';
import { t } from '../lib/i18n';
import { Avatar, Icon } from './primitives';

export interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface TopbarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  breadcrumbs: Breadcrumb[];
  profile: UserProfile;
}

export function Topbar({ role, onRoleChange, breadcrumbs, profile }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar__bc">
        {breadcrumbs.map((b, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="bc-sep">/</span>}
            <button
              className={classNames('bc-item', i === breadcrumbs.length - 1 && 'bc-item--current')}
              onClick={b.onClick}
              disabled={!b.onClick}
            >
              {b.label}
            </button>
          </Fragment>
        ))}
      </div>
      <div className="topbar__right">
        <div className="role-switch" role="tablist" aria-label={t('Role')}>
          <button
            role="tab"
            aria-selected={role === 'teacher'}
            className={classNames('role-switch__opt', role === 'teacher' && 'is-active')}
            onClick={() => onRoleChange('teacher')}
          >
            {t('Teacher')}
          </button>
          <button
            role="tab"
            aria-selected={role === 'admin'}
            className={classNames('role-switch__opt', role === 'admin' && 'is-active')}
            onClick={() => onRoleChange('admin')}
          >
            {t('Admin')}
          </button>
        </div>
        <button className="iconbtn" title={t('Notifications')}>
          <Icon name="bell" />
          <span className="iconbtn__dot" />
        </button>
        <div className="profile">
          <Avatar name={profile.name} size={32} />
          <div className="profile__meta">
            <div className="profile__name">{profile.name}</div>
            <div className="profile__role">{profile.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
