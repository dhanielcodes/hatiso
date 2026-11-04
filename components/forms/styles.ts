export type FieldVariant = 'light' | 'dark' | 'auth';

export function fieldLabelClass(variant: FieldVariant = 'light') {
  if (variant === 'dark') {
    return 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300';
  }
  if (variant === 'auth') {
    return 'mb-1.5 block text-[13px] font-medium text-[#1C1C1C]';
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
      'bg-[#0F222A] text-white placeholder-slate-500',
      opts?.hasError
        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
        : 'border-slate-600 focus:border-[#E95312] focus:ring-[#E95312]',
      opts?.withIcon ? 'pr-11' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (variant === 'auth') {
    return [
      'w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 bg-white',
      opts?.hasError
        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
        : 'border-[#E8E4DE] focus:border-[#E95312] focus:ring-[#E95312]',
      opts?.withIcon ? 'pr-11' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return [
    base,
    'bg-[#F8FAFC] font-medium text-slate-900 placeholder-slate-400 focus:bg-white',
    opts?.hasError
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
      : 'border-slate-200/80 focus:border-[#FF5A1F] focus:ring-[#FF5A1F]',
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
      'bg-[#0F222A]',
      opts?.hasError
        ? 'border-rose-500 focus-within:border-rose-500 focus-within:ring-rose-500'
        : 'border-slate-600 focus-within:border-[#E95312] focus-within:ring-[#E95312]',
    ].join(' ');
  }

  return [
    base,
    'bg-white',
    opts?.hasError
      ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500'
      : 'border-slate-200 focus-within:border-[#E95312] focus-within:ring-2 focus-within:ring-[#E95312]/20',
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
    ? 'rounded border-slate-600 bg-[#0F222A] text-[#E95312] focus:ring-[#E95312]'
    : 'h-4 w-4 rounded border-slate-300 text-[#E95312] focus:ring-[#E95312]';
}
