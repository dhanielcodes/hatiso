'use client';

import React, { createContext, useContext } from 'react';
import type { FieldVariant } from './styles';

const FieldVariantContext = createContext<FieldVariant>('light');

/**
 * Sets the default look of every form field inside it (a field's own `variant` prop still wins). The dashboard
 * layout uses `dashboard`, whose colours follow the theme and light/dark mode; elsewhere fields default to `light`.
 */
export function FieldVariantProvider({ variant, children }: { variant: FieldVariant; children: React.ReactNode }) {
  return <FieldVariantContext.Provider value={variant}>{children}</FieldVariantContext.Provider>;
}

/** The default field variant here: the nearest FieldVariantProvider's, or `light`. */
export function useFieldVariant(): FieldVariant {
  return useContext(FieldVariantContext);
}
