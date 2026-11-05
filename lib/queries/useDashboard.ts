'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getAnalytics, getAnalyticsCSV, getDashboard, type DashboardParams } from '@/lib/api/dashboard';

export function useDashboard(params: DashboardParams, enabled = true, key: any) {
  return useQuery({
    queryKey: [`dashboard-${key}`, params],
    queryFn: () => getDashboard(params),
    select: (response) => response.data,
    staleTime: 60_000,
    enabled,
  });
}

export function useAnalytics(params: DashboardParams, enabled = true, key: any) {
  return useQuery({
    queryKey: [`analytics-${key}`, params],
    queryFn: () => getAnalytics(params),
    select: (response) => response.data,
    staleTime: 60_000,
    enabled,
  });
}

export function useAnalyticsCSV(key: any) {
  return useMutation({
    mutationFn: (params: DashboardParams) => getAnalyticsCSV(params),
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'analytics.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
}
