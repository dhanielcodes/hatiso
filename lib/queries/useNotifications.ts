'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  type UpdateNotificationSettingsPayload,
} from '@/lib/api/notifications';

export const notificationsQueryKey = ['notifications'] as const;
export const notificationSettingsQueryKey = ['notification-settings'] as const;

export function useNotifications(page: number, size: number, status: string | null, category: string | null) {
  return useQuery({
    queryKey: [...notificationsQueryKey, page, size, status, category],
    queryFn: () => getNotifications(page, size, status, category),
    select: (response) => response.data,
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationSettingsQueryKey,
    queryFn: getNotificationSettings,
    select: (response) => response.data,
    staleTime: 30_000,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNotificationSettingsPayload) =>
      updateNotificationSettings(payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSettingsQueryKey });
    },
  });
}
