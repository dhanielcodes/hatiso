'use client';

import React, { useState } from 'react';
import { useField } from 'formik';
import FieldShell from './FieldShell';
import { FieldVariant, fieldShellClass } from './styles';

export interface AmountFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'onChange' | 'value'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  showError?: boolean;
  currencySymbol?: string;
  min?: number;
  max?: number;
  /** Decimal places allowed while typing / stored (default 2) */
  decimals?: number;
  onValueChange?: (value: number | '') => void;
}

function stripToDigits(raw: string, decimals: number): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  if (decimals <= 0) return whole;
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join('').slice(0, decimals)}`;
}

function formatAmount(value: number | string | '', decimals: number): string {
  if (value === '' || value === null || value === undefined) return '';
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function toNumber(raw: string): number | '' {
  if (!raw || raw === '.') return '';
  const n = Number(raw.replace(/,/g, ''));
  return Number.isFinite(n) ? n : '';
}

export default function AmountField({
  name,
  label,
  hint,
  variant = 'light',
  showError = true,
  currencySymbol = '₦',
  min,
  max,
  decimals = 2,
  className = '',
  id,
  required,
  placeholder = '0.00',
  onValueChange,
  ...rest
}: AmountFieldProps) {
  const [field, meta, helpers] = useField<number | ''>(name);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');
  const inputId = id || name;
  const hasError = Boolean(meta.touched && meta.error);

  const display = focused
    ? draft
    : formatAmount(field.value, decimals);

  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      required={required}
      error={showError && hasError ? meta.error : undefined}
      hint={hint}
      variant={variant}
      className={className}
    >
      <div className={fieldShellClass(variant, { hasError })}>
        <span
          className={`mr-2 text-sm font-bold ${
            variant === 'dark' ? 'text-slate-400' : 'text-slate-400'
          }`}
        >
          {currencySymbol}
        </span>
        <input
          id={inputId}
          inputMode="decimal"
          {...rest}
          name={field.name}
          value={display}
          placeholder={placeholder}
          onFocus={(e) => {
            setFocused(true);
            const raw =
              field.value === '' || field.value === null || field.value === undefined
                ? ''
                : String(field.value);
            setDraft(raw);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            const next = toNumber(draft);
            helpers.setValue(next);
            helpers.setTouched(true);
            onValueChange?.(next);
            field.onBlur(e);
            rest.onBlur?.(e);
          }}
          onChange={(e) => {
            const nextDraft = stripToDigits(e.target.value, decimals);
            setDraft(nextDraft);
            const next = toNumber(nextDraft);
            helpers.setValue(next);
            onValueChange?.(next);
          }}
          required={required}
          aria-invalid={hasError}
          className={`w-full bg-transparent text-sm font-semibold focus:outline-none ${
            variant === 'dark'
              ? 'text-white placeholder-slate-500'
              : 'text-slate-900 placeholder-slate-400'
          }`}
        />
      </div>
      {(min !== undefined || max !== undefined) && !hint && !hasError ? (
        <p className={`mt-1.5 text-[11px] ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {min !== undefined && max !== undefined
            ? `Min ${currencySymbol}${min.toLocaleString()} · Max ${currencySymbol}${max.toLocaleString()}`
            : min !== undefined
              ? `Minimum ${currencySymbol}${min.toLocaleString()}`
              : `Maximum ${currencySymbol}${Number(max).toLocaleString()}`}
        </p>
      ) : null}
    </FieldShell>
  );
}
