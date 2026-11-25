'use client';

import { useLayoutEffect, useSyncExternalStore } from 'react';

/**
 * App colour themes. The colours live in app/theme.css: Classic is the base set of tokens,
 * and every other theme overrides them under `html[data-theme="<id>"]`.
 * Themes only apply inside the signed-in dashboard (THEMED_PATH), which uses Hatiso Monochrome
 * until the user picks another; the landing, marketing and auth pages always use Classic. The choice is stored in this browser only (localStorage) and applied
 * before first paint by the inline script in app/layout.tsx (THEME_INIT_SCRIPT) on a full page load,
 * and by useDashboardTheme() when the dashboard is reached by client-side navigation.
 */
export const THEMES = [
  {
    id: 'hatiso',
    name: 'Hatiso Monochrome',
    description: 'The Hatiso brand palette: Carbon, Graphite, Cloud and Silver.',
    swatches: ['#12151A', '#23272F', '#F1F2F4', '#B8BCC2', '#FFFFFF'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original Hatiso look: deep teal surfaces with orange highlights.',
    swatches: ['#1B3C4A', '#E95312', '#FFFAF7', '#E6E3E0', '#FFFFFF'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep navy surfaces with bright blue highlights.',
    swatches: ['#24394E', '#158AFF', '#F9FBFE', '#E1E4E7', '#FFFFFF'],
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep green surfaces with fresh green highlights.',
    swatches: ['#1B3F35', '#02A849', '#F7FDFB', '#E0E5E3', '#FFFFFF'],
  },
  {
    id: 'plum',
    name: 'Plum',
    description: 'Aubergine surfaces with violet highlights.',
    swatches: ['#3C324B', '#BD5BD5', '#FCFAFF', '#E4E3E6', '#FFFFFF'],
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark backgrounds and light text, easier on the eyes at night.',
    swatches: ['#1B3C4A', '#E95312', '#181513', '#312F2D', '#1E2228'],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

/** The look of every page outside the dashboard (and what the server renders). */
export const BASE_THEME: ThemeId = 'classic';
/** The dashboard's theme until the user chooses one in Appearance. */
export const DEFAULT_THEME: ThemeId = 'hatiso';
export const THEME_STORAGE_KEY = 'hatiso_theme';
/** Only routes under this prefix are themed. */
export const THEMED_PATH = '/dashboard';
const THEME_EVENT = 'hatiso-theme-change';

const isThemeId = (value: unknown): value is ThemeId => THEMES.some((t) => t.id === value);

/** Runs in <head> before the page paints, so a saved theme never flashes the default first. */
export const THEME_INIT_SCRIPT = `(function(){try{if(location.pathname.indexOf(${JSON.stringify(THEMED_PATH)})!==0)return;var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});document.documentElement.setAttribute("data-theme",${JSON.stringify(THEMES.map((t) => t.id))}.indexOf(t)>-1?t:${JSON.stringify(
  DEFAULT_THEME,
)})}catch(e){}})()`;

function readTheme(): ThemeId {
  const value = document.documentElement.getAttribute('data-theme');
  return isThemeId(value) ? value : BASE_THEME;
}

function storedTheme(): ThemeId {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute('data-theme', theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Saves and applies a theme. Called from the dashboard's Appearance settings. */
export function setTheme(theme: ThemeId) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode etc.): the theme still applies for this visit.
  }
  applyTheme(theme);
}

/**
 * Mount in the dashboard layout: applies the saved theme while the dashboard is open and puts
 * Classic back when the user leaves it (e.g. the logo link to the landing page).
 */
export function useDashboardTheme() {
  useLayoutEffect(() => {
    applyTheme(storedTheme());
    return () => applyTheme(BASE_THEME);
  }, []);
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY || !location.pathname.startsWith(THEMED_PATH)) return;
    document.documentElement.setAttribute('data-theme', isThemeId(e.newValue) ? e.newValue : DEFAULT_THEME);
    onChange();
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener('storage', onStorage); // keeps other open tabs in step
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/** The active theme; re-renders when it changes (here or in another tab). */
export function useTheme(): ThemeId {
  return useSyncExternalStore(subscribe, readTheme, () => BASE_THEME);
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
