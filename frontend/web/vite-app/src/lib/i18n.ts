// Tiny in-house i18n layer. Wraps a Traditional Chinese (zh-TW) dictionary,
// falls back to the literal English key. Swap for `react-i18next` or `i18next`
// when ready — the call surface (t('English', { params })) is intentionally
// compatible.

import { useSyncExternalStore } from 'react';
import type { Klass, Lang, Subject } from '../types';
import { SCHOOL } from './data';
import { ZH_TW } from './i18n.zh-TW';

let currentLang: Lang = 'en';
const listeners = new Set<() => void>();

export function setLang(lang: Lang) {
  if (currentLang === lang) return;
  currentLang = lang;
  document.documentElement.lang = lang === 'zh-TW' ? 'zh-Hant' : 'en';
  listeners.forEach((fn) => fn());
}

export function getLang(): Lang {
  return currentLang;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Hook to force a re-render when language changes. Use it once near the root.
export function useLang() {
  return useSyncExternalStore(subscribe, () => currentLang, () => currentLang);
}

export function t(key: string, params?: Record<string, string | number>) {
  let out =
    currentLang === 'zh-TW' && Object.prototype.hasOwnProperty.call(ZH_TW, key)
      ? ZH_TW[key]
      : key;
  if (params) {
    for (const k of Object.keys(params)) {
      out = out.split('{' + k + '}').join(String(params[k]));
    }
  }
  return out;
}

// Display helpers for items whose label depends on language.
export const subjectLabel = (s: Subject) => t(s.label);
export const chapterLabel = (n: string) => t(n);
export const pointLabel   = (n: string) => t(n);

export function classDisplayName(klass: Pick<Klass, 'name'>) {
  const m = /Grade (\d+)([A-Z]+)/.exec(klass.name);
  if (!m) return klass.name;
  if (currentLang === 'zh-TW') return `${m[1]}${m[2]} 班`;
  return klass.name;
}

export const schoolName  = () => t(SCHOOL.name);
export const termLabel   = () => t(SCHOOL.term);
export const gradesLabel = () => t(SCHOOL.gradesCovered);
