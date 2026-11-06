'use client';

import { useQuery } from '@tanstack/react-query';
import { getDigitalServiceOrders } from '@/lib/api/orders';

export function useDigitalServiceOrders(page: number, size: number) {
  return useQuery({
    queryKey: ['digital-service-orders', page, size],
    queryFn: () => getDigitalServiceOrders(page, size),
    select: (response) => response.data,
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}
