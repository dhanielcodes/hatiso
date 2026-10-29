'use client';

import React from 'react';
import { useField } from 'formik';
import FieldShell from './FieldShell';
import { FieldVariant, fieldControlClass } from './styles';

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'onChange'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  showError?: boolean;
  /** Store value as number in Formik (default true). Empty becomes '' when false-ish. */
  asNumber?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
  onValueChange?: (value: number | '') => void;
}

function parseNumeric(raw: string): number | '' {
  if (raw === '' || raw === '-' || raw === '.') return '';
  const n = Number(raw);
  return Number.isFinite(n) ? n : '';
}

export default function NumberField({
  name,
  label,
  hint,
  variant = 'light',
  showError = true,
  asNumber = true,
  className = '',
  id,
  required,
  min,
  max,
  step = 'any',
  onValueChange,
  ...rest
}: NumberFieldProps) {
  const [field, meta, helpers] = useField(name);
  const inputId = id || name;
  const hasError = Boolean(meta.touched && meta.error);

  const displayValue =
    field.value === null || field.value === undefined || field.value === ''
      ? ''
      : String(field.value);

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
      <input
        id={inputId}
        type="number"
        inputMode="decimal"
        {...rest}
        name={field.name}
        value={displayValue}
        min={min}
        max={max}
        step={step}
        onBlur={field.onBlur}
        onChange={(e) => {
          const raw = e.target.value;
          const next = asNumber ? parseNumeric(raw) : raw;
          helpers.setValue(next);
          onValueChange?.(asNumber ? (next as number | '') : parseNumeric(raw));
        }}
        required={required}
        aria-invalid={hasError}
        className={fieldControlClass(variant, { hasError })}
      />
    </FieldShell>
  );
}
