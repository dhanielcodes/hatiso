'use client';

import { useQuery } from '@tanstack/react-query';
import { DigitalServiceCategory, getDigitalServiceCatalogues, getDigitalServiceCategories } from '@/lib/api/digitalServices';

export const digitalServiceCategoriesQueryKey = ['digital-service-categories'] as const;
export const digitalServiceCataloguesQueryKey = ['digital-service-catalogues'] as const;

export function useDigitalServiceCategories() {
  return useQuery({
    queryKey: digitalServiceCategoriesQueryKey,
    queryFn: getDigitalServiceCategories,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDigitalServiceCatalogues(category: DigitalServiceCategory, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: [...digitalServiceCataloguesQueryKey, category, page, size],
    queryFn: () => getDigitalServiceCatalogues(category, page, size),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(category),
  });
}
