'use client';

import React from 'react';
import { useField } from 'formik';
import { Calendar } from 'lucide-react';
import FieldShell from './FieldShell';
import { FieldVariant, fieldControlClass } from './styles';

export interface DateFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  showError?: boolean;
  /** Minimum date as YYYY-MM-DD */
  minDate?: string;
  /** Maximum date as YYYY-MM-DD */
  maxDate?: string;
}

export default function DateField({
  name,
  label,
  hint,
  variant = 'light',
  showError = true,
  className = '',
  id,
  required,
  minDate,
  maxDate,
  min,
  max,
  ...rest
}: DateFieldProps) {
  const [field, meta] = useField(name);
  const inputId = id || name;
  const hasError = Boolean(meta.touched && meta.error);

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
      <div className="relative">
        <input
          id={inputId}
          type="date"
          {...field}
          {...rest}
          min={minDate ?? min}
          max={maxDate ?? max}
          required={required}
          aria-invalid={hasError}
          className={fieldControlClass(variant, { hasError, withIcon: true })}
        />
        <Calendar className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </FieldShell>
  );
}
