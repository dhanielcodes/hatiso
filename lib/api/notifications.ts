import { apiGet, apiPut } from '@/lib/api/axios';
import type { ApiResponse } from '@/types';

/* ─── Types ────────────────────────────────────────────────────── */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedUrl: string;
  createdAt: string;
  readAt: string | null;
}

export type NotificationChannel = 'EMAIL' | 'SMS' | 'OFF';

export interface NotificationSettings {
  purchaseChannel: NotificationChannel;
  availableChannels: NotificationChannel[];
}

export interface UpdateNotificationSettingsPayload {
  purchaseChannel: NotificationChannel;
}

/* ─── Endpoints ────────────────────────────────────────────────── */
export function getNotifications(page: number, size: number, status: string | null, category: string | null) {
  return apiGet<ApiResponse<Notification[]>>('/api/individual/notifications', { page, size, category, status });
}

export function getNotificationSettings() {
  return apiGet<ApiResponse<NotificationSettings>>('/api/individual/notifications/settings');
}

export function updateNotificationSettings(payload: UpdateNotificationSettingsPayload) {
  return apiPut<ApiResponse<NotificationSettings>>('/api/individual/notifications/settings', payload);
}
