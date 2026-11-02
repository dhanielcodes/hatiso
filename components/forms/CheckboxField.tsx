'use client';

import React from 'react';
import { useField } from 'formik';
import { FieldVariant, checkboxClass, fieldErrorClass } from './styles';

export interface CheckboxFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: string;
  label: React.ReactNode;
  variant?: FieldVariant;
  showError?: boolean;
}

export default function CheckboxField({
  name,
  label,
  variant = 'light',
  showError = true,
  className = '',
  id,
  ...rest
}: CheckboxFieldProps) {
  const [field, meta] = useField({ name, type: 'checkbox' });
  const inputId = id || name;
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div className={className}>
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-2.5 text-xs">
        <input
          id={inputId}
          type="checkbox"
          {...field}
          {...rest}
          checked={Boolean(field.checked ?? field.value)}
          className={`mt-0.5 ${checkboxClass(variant)}`}
        />
        <span className={variant === 'dark' ? 'text-slate-300' : variant === 'auth' ? 'text-[13px] text-slate-700' : 'text-slate-700'}>{label}</span>
      </label>
      {showError && hasError ? <p className={fieldErrorClass(variant)}>{meta.error}</p> : null}
    </div>
  );
}
