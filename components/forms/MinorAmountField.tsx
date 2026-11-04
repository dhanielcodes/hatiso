'use client';

import React, { useState } from 'react';
import { useField } from 'formik';
import FieldShell from './FieldShell';
import { FieldVariant, fieldShellClass } from './styles';

export interface MinorAmountFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'onChange' | 'value'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  showError?: boolean;
  currencySymbol?: string;
  minimumMinor?: number;
  maximumMinor?: number;
}

function toNairaAmount(value: number | '') {
  return value === '' ? '' : value / 100;
}

function parseNaira(raw: string): number | '' {
  if (!raw || raw === '.') return '';
  const amount = Number(raw.replace(/,/g, ''));
  return Number.isFinite(amount) ? Math.round(amount * 100) : '';
}

export default function MinorAmountField({
  name,
  label,
  hint,
  variant = 'light',
  showError = true,
  currencySymbol = '₦',
  minimumMinor,
  maximumMinor,
  className = '',
  id,
  required,
  placeholder = '0.00',
  ...rest
}: MinorAmountFieldProps) {
  const [field, meta, helpers] = useField<number | ''>(name);
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');
  const inputId = id || name;
  const hasError = Boolean(meta.touched && meta.error);
  const nairaValue = toNairaAmount(field.value);
  const display = focused
    ? draft
    : nairaValue === ''
      ? ''
      : nairaValue.toLocaleString('en-NG', { maximumFractionDigits: 2 });

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
        <span className="mr-2 text-sm font-bold text-slate-400">{currencySymbol}</span>
        <input
          id={inputId}
          inputMode="decimal"
          {...rest}
          name={field.name}
          value={display}
          placeholder={placeholder?.replace(/\s*\(kobo\)/i, '')}
          onFocus={(event) => {
            setFocused(true);
            setDraft(nairaValue === '' ? '' : String(nairaValue));
            rest.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            helpers.setValue(parseNaira(draft));
            helpers.setTouched(true);
            field.onBlur(event);
            rest.onBlur?.(event);
          }}
          onChange={(event) => {
            const sanitized = event.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
            const [whole, decimal = ''] = sanitized.split('.');
            const nextDraft = sanitized.includes('.') ? `${whole}.${decimal.slice(0, 2)}` : whole;
            setDraft(nextDraft);
            helpers.setValue(parseNaira(nextDraft));
            helpers.setTouched(true, false);
          }}
          required={required}
          aria-invalid={hasError}
          className={`w-full bg-transparent text-sm font-semibold focus:outline-none ${variant === 'dark' ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
        />
      </div>
      {/*    {(minimumMinor !== undefined || maximumMinor !== undefined) && !hint && !hasError ? (
        <p className={`mt-1.5 text-[11px] ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          {minimumMinor !== undefined && `Minimum ${currencySymbol}${(minimumMinor / 100).toLocaleString('en-NG')}`}
          {minimumMinor !== undefined && maximumMinor !== undefined && ' · '}
          {maximumMinor !== undefined && `Maximum ${currencySymbol}${(maximumMinor / 100).toLocaleString('en-NG')}`}
        </p>
      ) : null} */}
    </FieldShell>
  );
}
