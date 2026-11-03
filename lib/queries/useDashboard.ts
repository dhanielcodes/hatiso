'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard, type DashboardParams } from '@/lib/api/dashboard';

export function useDashboard(params: DashboardParams, enabled = true) {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => getDashboard(params),
    select: (response) => response.data,
    staleTime: 60_000,
    enabled,
  });
}
