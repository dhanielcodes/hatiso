import { apiClient } from '@/lib/api/axios';
import type { ApiResponse } from '@/types';

/** Home page sections the admin can show or hide. */
export type MarketplaceSectionId =
  | 'FEATURED_DIGITAL_SERVICES'
  | 'FEATURED_BANKS'
  | 'AUDIENCE'
  | 'BUSINESS'
  | 'CTA'
  | (string & {});

/** One entry in a visibility list: a section id, a bank id or a service id. */
export interface VisibilityEntry<Id extends string = string> {
  id: Id;
  visible: boolean;
}

/**
 * GET /api/public/marketplace/page-configuration (public; same for every visitor).
 * A disabled section is left out of `sections`, so only listed, visible sections show.
 */
export interface MarketplacePageConfiguration {
  sections: VisibilityEntry<MarketplaceSectionId>[];
  /** Bank ids from GET /banks, in the order to show them. Empty means "no picks": show the usual banks. */
  featuredBanks: VisibilityEntry[];
  /** Service ids (e.g. AIRTIME, DATA, CABLE_TV: `featureId` in categoryServices.ts), in order. Empty means "no picks". */
  featuredServices: VisibilityEntry[];
  version: number;
}

/** No error toast: if it fails, the home page just shows everything. */
export async function getMarketplacePageConfiguration() {
  const response = await apiClient.get<ApiResponse<MarketplacePageConfiguration>>(
    '/api/public/marketplace/page-configuration',
    { skipErrorToast: true },
  );
  return response.data;
}
