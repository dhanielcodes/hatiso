'use client';

import React from 'react';
import { useField } from 'formik';
import { ChevronDown } from 'lucide-react';
import FieldShell from './FieldShell';
import { FieldVariant, fieldControlClass } from './styles';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  options: SelectOption[];
  placeholder?: string;
  showError?: boolean;
}

export default function SelectField({
  name,
  label,
  hint,
  variant = 'light',
  options,
  placeholder = 'Select an option',
  showError = true,
  className = '',
  id,
  required,
  ...rest
}: SelectFieldProps) {
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
        <select
          id={inputId}
          {...field}
          {...rest}
          required={required}
          aria-invalid={hasError}
          className={`${fieldControlClass(variant, { hasError, withIcon: true })} appearance-none`}
        >
          {placeholder ? (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </FieldShell>
  );
}
