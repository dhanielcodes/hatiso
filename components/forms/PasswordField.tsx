'use client';

import React, { useState } from 'react';
import { useField } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import FieldShell from './FieldShell';
import { FieldVariant, fieldControlClass } from './styles';

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  labelAction?: React.ReactNode;
  showError?: boolean;
}

export default function PasswordField({
  name,
  label,
  hint,
  variant = 'light',
  labelAction,
  showError = true,
  className = '',
  id,
  required,
  ...rest
}: PasswordFieldProps) {
  const [field, meta] = useField(name);
  const [visible, setVisible] = useState(false);
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
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          {...field}
          {...rest}
          required={required}
          aria-invalid={hasError}
          className={fieldControlClass(variant, { hasError, withIcon: true })}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 ${
            variant === 'dark' ? 'hover:text-white' : 'hover:text-slate-700'
          }`}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FieldShell>
  );
}
