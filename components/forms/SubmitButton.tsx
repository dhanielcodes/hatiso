'use client';

import React from 'react';
import { useFormikContext } from 'formik';
import { ButtonSize, ButtonVariant, buttonClass } from './styles';

export interface SubmitButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  loadingLabel?: React.ReactNode;
  /** When true, also disable while Formik isSubmitting */
  disableWhileSubmitting?: boolean;
  /** Shared button style. Leave unset to style the button entirely through `className`. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export default function SubmitButton({
  children,
  loadingLabel,
  disableWhileSubmitting = true,
  disabled,
  variant,
  size,
  fullWidth,
  className = '',
  ...rest
}: SubmitButtonProps) {
  const { isSubmitting } = useFormikContext();
  const busy = disableWhileSubmitting && isSubmitting;
  const base = variant ? buttonClass(variant, { size, fullWidth }) : '';

  return (
    <button
      type="submit"
      disabled={disabled || busy}
      aria-busy={busy}
      className={[base, className, 'disabled:cursor-not-allowed'].filter(Boolean).join(' ')}
      {...rest}
    >
      {busy ? (
        React.isValidElement(loadingLabel) ? (
          // A custom element (usually spinner + text) is rendered as given
          <span aria-live="polite">{loadingLabel}</span>
        ) : (
          <span className="inline-flex items-center justify-center gap-2" aria-live="polite">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            {loadingLabel ? <span>{loadingLabel}</span> : <span className="sr-only">Submitting form</span>}
          </span>
        )
      ) : children}
    </button>
  );
}
