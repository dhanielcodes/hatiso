'use client';

import React from 'react';
import {
  FieldVariant,
  fieldErrorClass,
  fieldHintClass,
  fieldLabelClass,
} from './styles';
import { useFieldVariant } from './FieldVariantContext';

export interface FieldShellProps {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  variant?: FieldVariant;
  labelAction?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function FieldShell({
  label,
  htmlFor,
  required,
  error,
  hint,
  variant: variantProp,
  labelAction,
  className = '',
  children,
}: FieldShellProps) {
  const contextVariant = useFieldVariant();
  const variant = variantProp ?? contextVariant;
  return (
    <div className={className}>
      {(label || labelAction) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label ? (
            <label htmlFor={htmlFor} className={`${fieldLabelClass(variant)} mb-0`}>
              {label}
              {required ? <span aria-hidden="true" className="ml-0.5 text-grey-500">*</span> : null}
            </label>
          ) : (
            <span />
          )}
          {labelAction}
        </div>
      )}
      {children}
      {error ? <p className={fieldErrorClass(variant)}>{error}</p> : null}
      {!error && hint ? <p className={fieldHintClass(variant)}>{hint}</p> : null}
    </div>
  );
}
