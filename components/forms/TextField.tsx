'use client';

import React from 'react';
import { useField } from 'formik';
import FieldShell from './FieldShell';
import { FieldVariant, fieldControlClass, fieldShellClass } from './styles';

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  /** Trailing icon (right side) */
  icon?: React.ReactNode;
  /** Leading icon inside a shell control (left side) */
  startIcon?: React.ReactNode;
  labelAction?: React.ReactNode;
  showError?: boolean;
}

export default function TextField({
  name,
  label,
  hint,
  variant = 'light',
  icon,
  startIcon,
  labelAction,
  showError = true,
  className = '',
  id,
  required,
  ...rest
}: TextFieldProps) {
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
      labelAction={labelAction}
      className={className}
    >
      {startIcon ? (
        <div className={fieldShellClass(variant, { hasError })}>
          <span className="mr-2.5 text-slate-400">{startIcon}</span>
          <input
            id={inputId}
            {...field}
            {...rest}
            required={required}
            aria-invalid={hasError}
            className={`w-full bg-transparent text-sm font-medium focus:outline-none ${
              variant === 'dark'
                ? 'text-white placeholder-slate-500'
                : 'text-slate-900 placeholder-slate-400'
            }`}
          />
          {icon ? <span className="ml-2 text-slate-400">{icon}</span> : null}
        </div>
      ) : (
        <div className="relative">
          <input
            id={inputId}
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
