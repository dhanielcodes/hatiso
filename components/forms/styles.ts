/**
 * - `light`: marketplace / public pages
 * - `dark`: dark panels
 * - `auth`: sign-in, sign-up and recovery screens
 * - `dashboard`: signed-in dashboard pages (profile, support, banking…)
 */
export type FieldVariant = 'light' | 'dark' | 'auth' | 'dashboard';

const DASHBOARD_BORDER = (hasError?: boolean, within = false) => {
  const f = within ? 'focus-within' : 'focus';
  return hasError
    ? `border-status-error ${f}:border-status-error ${f}:ring-3 ${f}:ring-status-error/15`
    : `border-tone-100 hover:border-tone-414 ${f}:border-brand-361 ${f}:ring-3 ${f}:ring-silver/50`;
};

/* Public pages (light) and the auth screens share the Hatiso field: white, Grey 150 border, Carbon focus with a Silver ring. */
const BRAND_BORDER = (hasError?: boolean, within = false) => {
  const f = within ? 'focus-within' : 'focus';
  return hasError
    ? `border-status-error ${f}:border-status-error ${f}:ring-3 ${f}:ring-status-error/15`
    : `border-grey-150 hover:border-grey-400 ${f}:border-carbon ${f}:ring-3 ${f}:ring-silver/60`;
};

export function fieldLabelClass(variant: FieldVariant = 'light') {
  if (variant === 'dark') {
    return 'mb-2 block text-sm font-medium text-silver';
  }
  if (variant === 'dashboard') {
    return 'mb-2 block text-sm font-medium text-ink-510';
  }
  return 'mb-2 block text-sm font-medium text-carbon';
}

export function fieldControlClass(
  variant: FieldVariant = 'light',
  opts?: { hasError?: boolean; withIcon?: boolean }
) {
  if (variant === 'dark') {
    return [
      'min-h-12 w-full rounded-lg border bg-graphite px-3.5 text-[15px] text-cloud placeholder:text-grey-500 outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
      opts?.hasError ? 'border-status-error' : 'border-grey-700 focus:border-silver focus:ring-3 focus:ring-silver/30',
      opts?.withIcon ? 'pr-11' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (variant === 'dashboard') {
    return [
      'min-h-11 w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-tone-744 placeholder:text-tone-270 outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
      DASHBOARD_BORDER(opts?.hasError),
      opts?.withIcon ? 'pr-11' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return [
    'min-h-12 w-full rounded-lg border bg-white px-3.5 py-3 text-[15px] text-carbon placeholder:text-grey-500 outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
    BRAND_BORDER(opts?.hasError),
    opts?.withIcon ? 'pr-11' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function fieldShellClass(
  variant: FieldVariant = 'light',
  opts?: { hasError?: boolean }
) {
  if (variant === 'dark') {
    return [
      'relative flex min-h-12 w-full items-center rounded-lg border bg-graphite px-3.5 transition',
      opts?.hasError ? 'border-status-error' : 'border-grey-700 focus-within:border-silver focus-within:ring-3 focus-within:ring-silver/30',
    ].join(' ');
  }

  if (variant === 'dashboard') {
    return [
      'relative flex min-h-11 w-full items-center rounded-lg border bg-surface px-3.5 py-2.5 transition',
      DASHBOARD_BORDER(opts?.hasError, true),
    ].join(' ');
  }

  return [
    'relative flex min-h-12 w-full items-center rounded-lg border bg-white px-3.5 transition',
    BRAND_BORDER(opts?.hasError, true),
  ].join(' ');
}

export function fieldErrorClass(variant: FieldVariant = 'light') {
  return variant === 'dark' ? 'mt-1.5 text-[13px] text-[#FDA29B]' : 'mt-1.5 text-[13px] text-status-error';
}

export function fieldHintClass(variant: FieldVariant = 'light') {
  return variant === 'dark' ? 'mt-1.5 text-[13px] text-grey-400' : 'mt-1.5 text-[13px] text-grey-600';
}

export function checkboxClass(variant: FieldVariant = 'light') {
  return variant === 'dark'
    ? 'h-4.5 w-4.5 rounded-[5px] border-grey-700 bg-graphite accent-cloud'
    : 'h-4.5 w-4.5 rounded-[5px] border-grey-150 accent-carbon';
}

/* ─── Buttons ──────────────────────────────────────────────────── */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-311 font-medium text-on-brand hover:bg-brand-365',
  secondary: 'border border-tone-98 bg-surface font-medium text-tone-744 hover:border-tone-270',
  ghost: 'font-medium text-brand-361 hover:opacity-70',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 rounded-lg px-3.5 text-[13px]',
  md: 'min-h-11 rounded-xl px-5 text-sm',
  lg: 'min-h-12 rounded-xl px-6 text-[15px]',
};

export function buttonClass(
  variant: ButtonVariant = 'primary',
  opts?: { size?: ButtonSize; fullWidth?: boolean }
) {
  return [
    'hz-press inline-flex items-center justify-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50',
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[opts?.size ?? 'md'],
    opts?.fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
