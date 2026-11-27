'use client';

import React from 'react';
import { useFormField } from './useFormField';
import FieldShell from './FieldShell';
import { FieldVariant, fieldControlClass } from './styles';
import { useFieldVariant } from './FieldVariantContext';

export interface TextAreaFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  showError?: boolean;
}

export default function TextAreaField({
  name,
  label,
  hint,
  variant: variantProp,
  showError = true,
  className = '',
  id,
  required,
  rows = 5,
  ...rest
}: TextAreaFieldProps) {
  const contextVariant = useFieldVariant();
  const variant = variantProp ?? contextVariant;
  const { field, meta, hasError } = useFormField(name);
  const inputId = id || name;

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
      <textarea
        id={inputId}
        rows={rows}
        {...field}
        {...rest}
        required={required}
        aria-invalid={hasError}
        className={`${fieldControlClass(variant, { hasError })} resize-none`}
      />
    </FieldShell>
  );
}
