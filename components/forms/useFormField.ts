'use client';

import type React from 'react';
import { useField, useFormikContext, type FieldHookConfig } from 'formik';

/**
 * Shared Formik binding for every field in `components/forms`.
 *
 * - Errors show while typing: the field is marked touched on its first change, not only on blur.
 * - Errors also show for untouched fields once the user has tried to submit.
 * - `setValue` validates the new value. `markTouched` never validates, because Formik's
 *   `setFieldTouched` validates the values from the previous render, which made errors lag one
 *   change behind when it ran after `setValue`.
 */
// Default `V` mirrors Formik's own `useField` default so plain inputs can spread `field`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormField<V = any>(config: string | FieldHookConfig<V>) {
  const [field, meta, helpers] = useField<V>(config);
  const { submitCount } = useFormikContext();

  const markTouched = () => {
    if (!meta.touched) helpers.setTouched(true, false);
  };

  /** Set the value (validated against the new value) and mark the field touched. */
  const setValue = (value: V) => {
    markTouched();
    return helpers.setValue(value);
  };

  /** Drop-in for `field.onChange` that also marks the field touched. */
  const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    markTouched();
    field.onChange(event);
  };

  const hasError = Boolean(meta.error && (meta.touched || submitCount > 0));

  return {
    field: { ...field, onChange },
    meta,
    helpers,
    setValue,
    markTouched,
    hasError,
    error: hasError ? meta.error : undefined,
  };
}
