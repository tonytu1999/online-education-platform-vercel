# Lumen — Teacher / School Console (Vite + React + TypeScript)

Web client for the AI-Agent-Driven Online Education Platform. Implements the
Teacher and School Admin views from the PRD: dashboard, class detail with
knowledge-point mastery, student detail, mental-health module, and a
school-wide admin overview. Supports English and Traditional Chinese (繁體中文).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
npm run preview  # serve the build locally
```

## Project structure

```
src/
├── main.tsx                # Entry — mounts <App />
├── App.tsx                 # Shell: sidebar, topbar, router, tweaks panel
├── types.ts                # Shared type definitions
├── lib/
│   ├── data.ts             # Mock data (replace with API calls)
│   ├── format.ts           # classNames, fmtMinutes, lastActiveStr, hexToSoft
│   ├── mastery.ts          # Class- and student-level mastery math
│   ├── i18n.ts             # Tiny t() helper + setLang/useLang
│   └── i18n.zh-TW.ts       # Traditional Chinese dictionary
├── components/
│   ├── Icon.tsx            # Inline SVG icon set
│   ├── primitives.tsx      # Card, Avatar, ProgressBar, RiskBadge, Tabs, …
│   ├── charts.tsx          # Sparkline, Donut, MasteryHeatmap, AreaChart, …
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   └── TweaksPanel.tsx     # Floating dev panel for theme / density / lang
├── views/
│   ├── Dashboard.tsx       # Teacher home + ClassCard + activity feed
│   ├── Classes.tsx         # Class index w/ subject + grade filters
│   ├── ClassDetail.tsx     # Heatmap, mastery bars, student list, MH tab
│   ├── StudentDetail.tsx   # KPIs, 14-day trend, subject mastery, MH card
│   ├── Students.tsx        # Searchable directory across all classes
│   ├── MentalHealth.tsx    # Aggregate-only mental-health module
│   └── AdminSchool.tsx     # School-wide overview (admin role only)
└── styles/
    └── global.css          # Design tokens + component styles
```

## Tech stack

Aligned with PRD §4.2:

- **React 18 + TypeScript** via Vite
- **Plus Jakarta Sans** — bundled via `@fontsource-variable/plus-jakarta-sans`
- **CSS variables** for theming (light/dark, accent, density)

Bundled but not yet wired (ready when you connect a backend):

- **`react-router-dom`** — file-based routing instead of the local `nav` state in `App.tsx`
- **`zustand`** — for cross-view state (tweaks, auth, current school)
- **`axios`** — HTTP client; pair with a small `lib/api.ts` wrapper
- **`recharts`** — drop-in replacement for the hand-rolled charts in `components/charts.tsx`
- **`date-fns`** — replace `lastActiveStr` in `lib/format.ts` once timestamps are real
- **`jwt-decode`** — token claims for the role-based access control

## Next steps

1. **Auth + Join School** (PRD US-014, US-018) — add `(auth)/login` and `(auth)/join-school` routes.
2. **API client** — create `src/lib/api.ts` (Axios instance + token interceptor) and swap mock-data imports for `useEffect`/`useQuery` calls.
3. **Routing** — replace the `nav` state in `App.tsx` with `react-router-dom` so URLs are shareable.
4. **i18n at scale** — when the string table grows past ~300 entries, swap the local `t()` helper for `i18next` + the existing JSON dictionary.
5. **Real charts** — `components/charts.tsx` is intentionally minimal; once data shapes are stable, port to Recharts/ECharts.

## Tweaks panel

A floating button in the bottom-right opens a dev-only panel for switching
language, role, accent palette, dark mode, density, sidebar style, and chart
style. State lives in `App.tsx` (`useState<TweakState>`); migrate to a Zustand
store once it needs to persist or sync across tabs.
