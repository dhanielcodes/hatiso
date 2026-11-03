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
      aria-busy={busy}
      className={`${className} disabled:cursor-not-allowed`}
      {...rest}
    >
      {busy ? (
        <span className="inline-flex items-center justify-center" aria-live="polite">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="sr-only">{loadingLabel ?? 'Submitting form'}</span>
        </span>
      ) : children}
    </button>
  );
}
