'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getMarketplacePageConfiguration,
  type MarketplaceSectionId,
  type VisibilityEntry,
} from '@/lib/api/marketplace';

export const marketplacePageConfigurationQueryKey = ['marketplace-page-configuration'] as const;

/** Which home page sections, banks and services every visitor sees. */
export function useMarketplacePageConfiguration() {
  return useQuery({
    queryKey: marketplacePageConfigurationQueryKey,
    queryFn: () => getMarketplacePageConfiguration(),
    select: (response) => response.data,
    // Admin changes show on the next page load, or within a minute for a page left open.
    staleTime: 60 * 1000,
    retry: 1,
  });
}

/**
 * Whether a home page section shows. A section shows only when the configuration lists it with `visible: true`:
 * disabling a section in the admin removes it from the list. While the configuration loads it says `false` (so a
 * hidden section never flashes in), and if the configuration fails to load it says `true` (show everything).
 */
export function useSectionVisible(id: MarketplaceSectionId) {
  const { data, isPending, isError } = useMarketplacePageConfiguration();
  if (isError) return true;
  if (isPending) return false;
  return data?.sections.some((section) => section.id === id && section.visible) ?? true;
}

/**
 * Applies a featured list to `items`. With no list (empty, still loading or failed) it returns `items` as they are.
 * With a list it returns the visible picks found in `items`, in the list's order (it can be empty).
 * `idsOf` gives every id an item can be matched by (compared without case).
 */
export function pickFeatured<T>(items: T[], featured: VisibilityEntry[] | undefined, idsOf: (item: T) => string[]): T[] {
  if (!featured?.length) return items;
  // One id can match several items (TELCO gives Airtime and Data).
  const byId = new Map<string, T[]>();
  for (const item of items) {
    for (const id of idsOf(item)) {
      const key = id.toLowerCase();
      byId.set(key, [...(byId.get(key) ?? []), item]);
    }
  }
  const picked: T[] = [];
  for (const entry of featured) {
    if (!entry.visible) continue;
    for (const item of byId.get(String(entry.id).toLowerCase()) ?? []) if (!picked.includes(item)) picked.push(item);
  }
  return picked;
}
