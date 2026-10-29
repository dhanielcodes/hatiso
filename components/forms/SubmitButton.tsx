'use client';

import React from 'react';
import { useFormikContext } from 'formik';

export interface SubmitButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  loadingLabel?: React.ReactNode;
  /** When true, also disable while Formik isSubmitting */
  disableWhileSubmitting?: boolean;
}

export default function SubmitButton({
  children,
  loadingLabel,
  disableWhileSubmitting = true,
  disabled,
  className = '',
  ...rest
}: SubmitButtonProps) {
  const { isSubmitting } = useFormikContext();
  const busy = disableWhileSubmitting && isSubmitting;

  return (
    <button
      type="submit"
      disabled={disabled || busy}
      className={className}
      {...rest}
    >
      {busy ? loadingLabel ?? children : children}
    </button>
  );
}
