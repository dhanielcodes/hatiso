'use client';

import type { ReactNode } from 'react';
import type { MarketplaceSectionId } from '@/lib/api/marketplace';
import { useSectionVisible } from '@/lib/queries/useMarketplace';

/** Shows a home page section only when GET /api/public/marketplace/page-configuration has it visible. */
export default function PageSection({ id, children }: { id: MarketplaceSectionId; children: ReactNode }) {
  return useSectionVisible(id) ? <>{children}</> : null;
}
