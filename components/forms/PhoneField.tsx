'use client';

import React from 'react';
import { useField } from 'formik';
import { ChevronDown } from 'lucide-react';
import FieldShell from './FieldShell';
import { FieldVariant, fieldControlClass, fieldShellClass } from './styles';

export interface PhoneFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  showError?: boolean;
  /** Show NG flag affix (contact-style). Default true for light, false for dark. */
  showCountryAffix?: boolean;
  icon?: React.ReactNode;
}

export default function PhoneField({
  name,
  label,
  hint,
  variant = 'light',
  showError = true,
  showCountryAffix,
  icon,
  className = '',
  id,
  required,
  ...rest
}: PhoneFieldProps) {
  const [field, meta] = useField(name);
  const inputId = id || name;
  const hasError = Boolean(meta.touched && meta.error);
  const withAffix = showCountryAffix ?? variant === 'light';

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
      {withAffix ? (
        <div className={fieldShellClass(variant, { hasError })}>
          <div className="flex items-center gap-1.5 border-r border-slate-200/60 pr-2">
            <svg className="h-4 w-5 overflow-hidden rounded-xs shadow-xs" viewBox="0 0 24 16">
              <rect width="8" height="16" fill="#008751" />
              <rect x="8" width="8" height="16" fill="#FFFFFF" />
              <rect x="16" width="8" height="16" fill="#008751" />
            </svg>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <input
            id={inputId}
            type="tel"
            inputMode="tel"
            {...field}
            {...rest}
            required={required}
            aria-invalid={hasError}
            className="w-full bg-transparent px-3 py-0.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>
      ) : (
        <div className="relative">
          <input
            id={inputId}
            type="tel"
            inputMode="tel"
            {...field}
            {...rest}
            required={required}
            aria-invalid={hasError}
            className={fieldControlClass(variant, { hasError, withIcon: Boolean(icon) })}
          />
          {icon ? (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </span>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}
