'use client';

import { useQuery } from '@tanstack/react-query';
import { getBanks } from '@/lib/api/banks';

export const banksQueryKey = ['banks'] as const;

/** Partner banks for the banks page, the home banks section and the dashboard banking page. */
export function useBanks(page = 0, size = 100) {
  return useQuery({
    queryKey: [...banksQueryKey, page, size],
    queryFn: () => getBanks(page, size),
    select: (response) => response.data ?? [],
    staleTime: 5 * 60 * 1000,
  });
}
