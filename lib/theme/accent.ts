import type { CSSProperties } from 'react';

/** Hatiso's own accent (Silver, from the brand palette). Matches `--color-accent` in app/theme.css. */
export const HATISO_ACCENT = '#B8BCC2';

/**
 * Site-wide accent for a white-label deployment (a bank running its own copy of Hatiso).
 * Set NEXT_PUBLIC_ACCENT_COLOR=#0055A4 in the environment; unset keeps Hatiso's Silver.
 */
export const SITE_ACCENT = process.env.NEXT_PUBLIC_ACCENT_COLOR || null;

const CARBON = '#12151A';
const WHITE = '#FFFFFF';
/** Minimum contrast for the accent against the surface it sits on (WCAG non-text / large text). */
const MIN_CONTRAST = 3;

/** "#0055a4", "0055A4" or "#05A" → "#0055A4"; anything else → null. */
export function normalizeHex(value?: string | null): string | null {
  const raw = value?.trim().replace(/^#/, '') ?? '';
  if (/^[0-9a-f]{3}$/i.test(raw)) return `#${raw.split('').map((c) => c + c).join('')}`.toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`.toUpperCase();
  return null;
}

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (rgb: number[]) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

/** Relative luminance (WCAG) of a #RRGGBB colour. */
function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Mix towards white (amount > 0) or black (amount < 0). */
function mix(hex: string, amount: number): string {
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  return toHex(channels(hex).map((c) => c + (target - c) * t));
}

/** Carbon or white, whichever reads better on the given accent. */
export function onAccent(hex: string): string {
  return contrast(hex, CARBON) >= contrast(hex, WHITE) ? CARBON : WHITE;
}

/**
 * The colour nudged (keeping its hue) until it stands out from the surface it sits on:
 * lightened on dark surfaces, darkened on light ones. A navy bank colour still shows on Carbon.
 */
export function readableOn(hex: string, surface: 'dark' | 'light'): string {
  const background = surface === 'dark' ? CARBON : WHITE;
  let color = hex;
  for (let step = 1; step <= 20 && contrast(color, background) < MIN_CONTRAST; step += 1) {
    color = mix(hex, (surface === 'dark' ? 1 : -1) * step * 0.05);
  }
  return color;
}

interface AccentOptions {
  /** Surface the accent mostly sits on. `dark` (default) for the Carbon pages, `light` for white cards and dialogs. */
  surface?: 'dark' | 'light';
  /** Used when the colour is missing or invalid. Defaults to Hatiso's Silver. */
  fallback?: string;
}

/**
 * Inline style that re-skins everything inside a wrapper with a brand colour:
 * `<div style={accentStyle(bank.primaryColor, { surface: 'light' })}>…</div>`. Anything using
 * `bg-accent`, `text-accent`, `border-accent` or `text-on-accent` picks it up.
 */
export function accentStyle(hex?: string | null, { surface = 'dark', fallback = HATISO_ACCENT }: AccentOptions = {}): CSSProperties {
  const color = readableOn(normalizeHex(hex) ?? fallback, surface);
  return { '--color-accent': color, '--color-on-accent': onAccent(color) } as CSSProperties;
}

/** A bank's own colour for its cards and dialogs; banks without one stay neutral (Carbon / Cloud). */
export function bankAccentStyle(primaryColor: string | null | undefined, surface: 'dark' | 'light' = 'light'): CSSProperties {
  return accentStyle(primaryColor, { surface, fallback: surface === 'light' ? CARBON : '#F1F2F4' });
}
