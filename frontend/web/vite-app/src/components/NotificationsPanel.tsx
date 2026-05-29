import { useEffect, useRef, useState } from 'react';
import { t } from '../lib/i18n';

interface Notif {
  id: string;
  kind: 'positive' | 'risk' | 'accent' | 'neutral';
  icon: string;
  text: string;
  when: string;
  unread: boolean;
}

const INITIAL: Notif[] = [
  { id: '1', kind: 'positive', icon: '↑', text: 'Lin Yu mastered Pythagoras', when: '2h ago', unread: true },
  { id: '2', kind: 'risk',     icon: '!', text: '3 students flagged for medium risk in Grade 7B', when: 'Yesterday', unread: true },
  { id: '3', kind: 'accent',   icon: 'A', text: 'Assessment results ready for Grade 7B Math', when: '1d ago', unread: false },
  { id: '4', kind: 'neutral',  icon: '+', text: 'New student joined Grade 7A Math', when: '3d ago', unread: false },
];

interface Props { onClose: () => void }

export function NotificationsPanel({ onClose }: Props) {
  const [items, setItems] = useState(INITIAL);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const unread = items.filter((n) => n.unread).length;
  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <div ref={ref} className="notif-panel card">
      <div className="notif-panel__head">
        <span className="notif-panel__title">
          {t('Notifications')}
          {unread > 0 && <span className="notif-panel__badge">{unread}</span>}
        </span>
        {unread > 0 && <button className="btn btn--text" onClick={markAll}>{t('Mark all read')}</button>}
      </div>
      <div className="notif-panel__list">
        {items.length === 0 && (
          <div style={{ padding: '20px 16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
            {t('No notifications')}
          </div>
        )}
        {items.map((n) => (
          <div key={n.id} className={`notif-item${n.unread ? ' notif-item--unread' : ''}`}>
            <div className={`activity__icon activity__icon--${n.kind}`}>{n.icon}</div>
            <div className="notif-item__body">
              <div className="notif-item__text">{t(n.text)}</div>
              <div className="notif-item__when">{t(n.when)}</div>
            </div>
            {n.unread && <div className="notif-item__dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}
