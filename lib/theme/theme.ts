'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';

/**
 * App colour themes and light/dark mode. The colours live in app/theme.css: Classic is the base set of tokens,
 * every other theme overrides them under `html[data-theme="<id>"]`, and each theme's dark mode under
 * `html[data-theme="<id>"][data-mode="dark"]`.
 * The landing, marketing and auth pages always use Hatiso Monochrome in light mode (BASE_THEME). The picker
 * only applies inside the signed-in dashboard (THEMED_PATH), which uses Hatiso Monochrome in light mode until
 * the user picks otherwise. Both choices are stored in this browser only (localStorage) and applied
 * before first paint by the inline script in app/layout.tsx (THEME_INIT_SCRIPT) on a full page load,
 * and by useDashboardTheme() when the dashboard is reached by client-side navigation.
 */
export const THEMES = [
  {
    id: 'hatiso',
    name: 'Hatiso Monochrome',
    description: 'The Hatiso brand palette: Carbon, Graphite, Cloud and Silver.',
    // [sidebar, accent, background, line, card] in light mode, then in dark mode.
    swatches: ['#12151A', '#23272F', '#F1F2F4', '#B8BCC2', '#FFFFFF'],
    darkSwatches: ['#12151A', '#F1F2F4', '#12151A', '#393C40', '#23272F'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original Hatiso look: deep teal surfaces with orange highlights.',
    swatches: ['#1B3C4A', '#E95312', '#FFFAF7', '#E6E3E0', '#FFFFFF'],
    darkSwatches: ['#1B3C4A', '#E95312', '#201F1D', '#32302E', '#1E2228'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep navy surfaces with bright blue highlights.',
    swatches: ['#24394E', '#158AFF', '#F9FBFE', '#E1E4E7', '#FFFFFF'],
    darkSwatches: ['#24394E', '#158AFF', '#201F1D', '#32302E', '#1E2228'],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep green surfaces with fresh green highlights.',
    swatches: ['#1B3F35', '#02A849', '#F7FDFB', '#E0E5E3', '#FFFFFF'],
    darkSwatches: ['#1B3F35', '#02A849', '#201F1D', '#32302E', '#1E2228'],
  },
  {
    id: 'plum',
    name: 'Plum',
    description: 'Aubergine surfaces with violet highlights.',
    swatches: ['#3C324B', '#BD5BD5', '#FCFAFF', '#E4E3E6', '#FFFFFF'],
    darkSwatches: ['#3C324B', '#BD5BD5', '#201F1D', '#32302E', '#1E2228'],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

/** Light or dark, or follow the device setting. */
export const MODES = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'system', name: 'Match device' },
] as const;
export type ModeChoice = (typeof MODES)[number]['id'];
/** The mode actually on screen. */
export type ColorMode = 'light' | 'dark';

/** The look of every page outside the dashboard (and what the server renders). */
export const BASE_THEME: ThemeId = 'hatiso';
/** The dashboard's theme until the user chooses one in Appearance. */
export const DEFAULT_THEME: ThemeId = 'hatiso';
export const DEFAULT_MODE: ModeChoice = 'light';
export const THEME_STORAGE_KEY = 'hatiso_theme';
export const MODE_STORAGE_KEY = 'hatiso_mode';
/** Only routes under this prefix are themed. */
export const THEMED_PATH = '/dashboard';
const THEME_EVENT = 'hatiso-theme-change';
const DARK_QUERY = '(prefers-color-scheme: dark)';

const isThemeId = (value: unknown): value is ThemeId => THEMES.some((t) => t.id === value);
const isMode = (value: unknown): value is ModeChoice => MODES.some((m) => m.id === value);

/**
 * Runs in <head> before the page paints, so a saved theme never flashes the default first.
 * "dark" used to be a theme of its own: it now means Hatiso Monochrome in dark mode.
 */
export const THEME_INIT_SCRIPT = `(function(){try{if(location.pathname.indexOf(${JSON.stringify(THEMED_PATH)})!==0)return;var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)}),m=localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)});if(t==="dark"){t=${JSON.stringify(DEFAULT_THEME)};m=m||"dark"}var d=document.documentElement;d.setAttribute("data-theme",${JSON.stringify(
  THEMES.map((t) => t.id),
)}.indexOf(t)>-1?t:${JSON.stringify(DEFAULT_THEME)});if(m==="system")m=matchMedia(${JSON.stringify(DARK_QUERY)}).matches?"dark":"light";d.setAttribute("data-mode",m==="dark"?"dark":"light")}catch(e){}})()`;

function readTheme(): ThemeId {
  const value = document.documentElement.getAttribute('data-theme');
  return isThemeId(value) ? value : BASE_THEME;
}

function readMode(): ColorMode {
  return document.documentElement.getAttribute('data-mode') === 'dark' ? 'dark' : 'light';
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storedTheme(): ThemeId {
  const value = read(THEME_STORAGE_KEY);
  return isThemeId(value) ? value : DEFAULT_THEME;
}

function storedMode(): ModeChoice {
  const value = read(MODE_STORAGE_KEY);
  if (isMode(value)) return value;
  return read(THEME_STORAGE_KEY) === 'dark' ? 'dark' : DEFAULT_MODE;
}

function resolveMode(choice: ModeChoice): ColorMode {
  if (choice === 'system') return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
  return choice;
}

function apply(theme: ThemeId, mode: ColorMode) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-mode', mode);
  window.dispatchEvent(new Event(THEME_EVENT));
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked (private mode etc.): the choice still applies for this visit.
  }
}

/** Saves and applies a theme. Called from the dashboard's Appearance settings. */
export function setTheme(theme: ThemeId) {
  save(THEME_STORAGE_KEY, theme);
  apply(theme, readMode());
}

/** Saves and applies light, dark or match-device. Called from the dashboard's Appearance settings. */
export function setMode(mode: ModeChoice) {
  save(MODE_STORAGE_KEY, mode);
  apply(readTheme(), resolveMode(mode));
}

/**
 * Mount in the dashboard layout: applies the saved theme and mode while the dashboard is open, follows the
 * device when the mode is "Match device", and puts Hatiso light back when the user leaves (e.g. the logo link).
 */
export function useDashboardTheme() {
  useLayoutEffect(() => {
    // The old "Dark" theme becomes Hatiso Monochrome in dark mode.
    if (read(THEME_STORAGE_KEY) === 'dark') {
      if (!isMode(read(MODE_STORAGE_KEY))) save(MODE_STORAGE_KEY, 'dark');
      save(THEME_STORAGE_KEY, DEFAULT_THEME);
    }
    apply(storedTheme(), resolveMode(storedMode()));
    const media = window.matchMedia(DARK_QUERY);
    const onDevice = () => storedMode() === 'system' && apply(readTheme(), resolveMode('system'));
    media.addEventListener('change', onDevice);
    return () => {
      media.removeEventListener('change', onDevice);
      apply(BASE_THEME, 'light');
    };
  }, []);
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if ((e.key !== THEME_STORAGE_KEY && e.key !== MODE_STORAGE_KEY) || !location.pathname.startsWith(THEMED_PATH)) return;
    apply(storedTheme(), resolveMode(storedMode())); // keeps other open tabs in step
    onChange();
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** The active theme; re-renders when it changes (here or in another tab). */
export function useTheme(): ThemeId {
  return useSyncExternalStore(subscribe, readTheme, () => BASE_THEME);
}

/** The mode on screen (light or dark); re-renders when it changes. */
export function useColorMode(): ColorMode {
  return useSyncExternalStore(subscribe, readMode, () => 'light');
}

/** The saved mode choice, including "Match device", for the Appearance settings. */
export function useModeChoice(): ModeChoice {
  return useSyncExternalStore(subscribe, storedMode, () => DEFAULT_MODE);
}

/**
 * Chart series colours in Hatiso Monochrome: the brand allows no added colours, so categories are told apart by
 * Carbon and the supporting greys (and always carry a text label). Other themes keep their own chart colours.
 */
export const HATISO_SERIES = ['#12151A', '#616366', '#919397', '#C9CACB', '#393C40', '#79797A', '#B8BCC2', '#484B52'];
/** The same greys for Hatiso's dark mode, lightest first so they read on Graphite. */
export const HATISO_DARK_SERIES = ['#F1F2F4', '#919397', '#616366', '#C9CACB', '#B8BCC2', '#79797A', '#D3D4D5', '#484B52'];

/** The colour for the `index`th chart series: Hatiso greys in Hatiso Monochrome (lightest first in dark mode), otherwise `color`. */
export function seriesColor(theme: ThemeId, mode: ColorMode, color: string, index: number): string {
  if (theme !== 'hatiso') return color;
  const series = mode === 'dark' ? HATISO_DARK_SERIES : HATISO_SERIES;
  return series[index % series.length];
}

/** Resolves a theme colour token (e.g. `brand-361`) to its current value, for canvas charts that can't use CSS. */
export function themeColor(token: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--color-${token}`).trim();
  return value || fallback;
}

/** `#RRGGBB` + alpha -> `rgba(...)`, for canvas gradients. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
