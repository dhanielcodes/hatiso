/**
 * - `light`: marketplace / public pages
 * - `dark`: dark panels
 * - `auth`: sign-in, sign-up and recovery screens
 * - `dashboard`: signed-in dashboard pages (profile, support, banking…)
 */
export type FieldVariant = 'light' | 'dark' | 'auth' | 'dashboard';

const DASHBOARD_BORDER = (hasError?: boolean, within = false) => {
  const f = within ? 'focus-within' : 'focus';
  return hasError ? `border-rose-400 ${f}:border-rose-500` : `border-tone-98 ${f}:border-brand-361`;
};

export function fieldLabelClass(variant: FieldVariant = 'light') {
  if (variant === 'dark') {
    return 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300';
  }
  if (variant === 'auth') {
    return 'mb-1.5 block text-[13px] font-medium text-tone-774';
  }
  if (variant === 'dashboard') {
    return 'mb-2 block text-sm font-medium text-ink-510';
  }
  return 'mb-2 block text-xs font-semibold text-slate-700';
}

export function fieldControlClass(
  variant: FieldVariant = 'light',
  opts?: { hasError?: boolean; withIcon?: boolean }
) {
  const base =
    'w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60';

  if (variant === 'dark') {
    return [
      base,
      'bg-tone-761 text-white placeholder-slate-500',
      opts?.hasError
        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
        : 'border-slate-600 focus:border-brand-361 focus:ring-brand-361',
      opts?.withIcon ? 'pr-11' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (variant === 'dashboard') {
    return [
      'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-tone-744 placeholder:text-tone-270 outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
      DASHBOARD_BORDER(opts?.hasError),
      opts?.withIcon ? 'pr-11' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (variant === 'auth') {
    return [
      'w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 bg-surface',
      opts?.hasError
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
        : 'border-tone-95 focus:border-brand-361 focus:ring-brand-361',
      opts?.withIcon ? 'pr-11' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return [
    base,
    'bg-tone-17 font-medium text-slate-900 placeholder-slate-400 focus:bg-surface',
    opts?.hasError
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
      : 'border-slate-200/80 focus:border-brand-318 focus:ring-brand-318',
    opts?.withIcon ? 'pr-11' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function fieldShellClass(
  variant: FieldVariant = 'light',
  opts?: { hasError?: boolean }
) {
  const base =
    'relative flex w-full items-center rounded-xl border px-3.5 py-3 transition focus-within:ring-1';

  if (variant === 'dark') {
    return [
      base,
      'bg-tone-761',
      opts?.hasError
        ? 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-500'
        : 'border-slate-600 focus-within:border-brand-361 focus-within:ring-brand-361',
    ].join(' ');
  }

  if (variant === 'dashboard') {
    return [
      'relative flex w-full items-center rounded-lg border bg-surface px-3.5 py-2.5 transition',
      DASHBOARD_BORDER(opts?.hasError, true),
    ].join(' ');
  }

  if (variant === 'auth') {
    return [
      'relative flex w-full items-center rounded-xl border bg-surface px-4 py-3.5 transition focus-within:ring-1',
      opts?.hasError
        ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500'
        : 'border-tone-95 focus-within:border-brand-361 focus-within:ring-brand-361',
    ].join(' ');
  }

  return [
    base,
    'bg-surface',
    opts?.hasError
      ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500'
      : 'border-slate-200 focus-within:border-brand-361 focus-within:ring-2 focus-within:ring-brand-361/20',
  ].join(' ');
}

export function fieldErrorClass(variant: FieldVariant = 'light') {
  return variant === 'dark'
    ? 'mt-1.5 text-xs text-rose-300'
    : 'mt-1.5 text-xs text-rose-600';
}

export function fieldHintClass(variant: FieldVariant = 'light') {
  return variant === 'dark'
    ? 'mt-1.5 text-xs text-slate-400'
    : 'mt-1.5 text-xs text-slate-500';
}

export function checkboxClass(variant: FieldVariant = 'light') {
  return variant === 'dark'
    ? 'rounded border-slate-600 bg-tone-761 text-brand-361 focus:ring-brand-361'
    : 'h-4 w-4 rounded border-slate-300 text-brand-361 focus:ring-brand-361';
}

/* ─── Buttons ──────────────────────────────────────────────────── */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-311 font-semibold text-on-brand hover:bg-brand-365',
  secondary: 'border border-tone-98 bg-surface font-medium text-tone-744 hover:bg-slate-50',
  ghost: 'font-medium text-brand-361 hover:opacity-70',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'rounded-md px-3 py-1.5 text-xs',
  md: 'rounded-lg px-6 py-3 text-sm',
  lg: 'rounded-xl px-8 py-3.5 text-sm',
};

export function buttonClass(
  variant: ButtonVariant = 'primary',
  opts?: { size?: ButtonSize; fullWidth?: boolean }
) {
  return [
    'inline-flex items-center justify-center gap-1.5 transition disabled:cursor-not-allowed disabled:opacity-50',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[opts?.size ?? 'md'],
    opts?.fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
