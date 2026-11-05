import { apiGet, apiPut } from '@/lib/api/axios';
import type { DigitalServiceCategory } from '@/lib/api/digitalServices';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedUrl: string;
  createdAt: string;
  readAt: string | null;
}

interface NotificationResponse {
  code: number;
  status: boolean;
  data: Notification[];
}

interface NotificationSettingsResponse {
  code: number;
  status: boolean;
  data: Notification;
}

export function getNotifications(page: number, size: number, status: string | null, category: string | null) {
  return apiGet<NotificationResponse>('/api/individual/notifications', { page, size, category, status });
}


export function getNotificationSettings() {
  return apiGet<NotificationSettingsResponse>('/api/individual/notifications/settings');
}

export function updateNotificationSettings(settings: any) {
  return apiPut<unknown>('/api/individual/notifications/settings', settings);
} 