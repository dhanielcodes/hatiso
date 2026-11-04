'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard, type DashboardParams } from '@/lib/api/dashboard';

export function useDashboard(params: DashboardParams, enabled = true, key: any) {
  return useQuery({
    queryKey: [`dashboard-${key}`, params],
    queryFn: () => getDashboard(params),
    select: (response) => response.data,
    staleTime: 60_000,
    enabled,
  });
}
