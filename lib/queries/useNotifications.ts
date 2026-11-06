'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getNotificationSettings, updateNotificationSettings, type Notification } from '../api/notifications';

export function useNotifications(page: number, size: number, status: string | null, category: string | null) {
  return useQuery({
    queryKey: ['notifications', page, size, status, category],
    queryFn: () => getNotifications(page, size, status, category),
    select: (response) => response.data,
    placeholderData: (previousData: any) => previousData,
    staleTime: 30_000,
  });
}


export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => getNotificationSettings(),
    select: (response) => response.data,
    placeholderData: (previousData: any) => previousData,
    staleTime: 30_000,
  });
}


export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: { purchaseChannel: 'EMAIL' | 'SMS' | 'OFF' }) => updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });
}