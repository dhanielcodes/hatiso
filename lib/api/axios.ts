import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { ApiError } from '@/types';
import { clearAuthSession } from '@/lib/auth/session';

interface BackendErrorDetails {
  message?: string;
  validationErrors?: Record<string, string[]> | null;
}

interface BackendErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  data?: BackendErrorDetails;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'https://f866-154-120-96-18.ngrok-free.app';

/**
 * Global Axios Instance for Hatiso Marketplace & Banking
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(BASE_URL.includes('.ngrok-free.app')
      ? { 'ngrok-skip-browser-warning': 'true' }
      : {}),
  },
});

/**
 * Global Request Interceptor
 * Injects JWT Bearer token and client metadata into all outgoing requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only access localStorage in client-side runtime
    if (typeof window !== 'undefined') {
      const storedToken =
        localStorage.getItem('hasito_auth_token') ||
        sessionStorage.getItem('hasito_auth_token');

      if (storedToken && config.headers) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }

      // Add device / client info header
      /*     config.headers['X-Client-Platform'] = 'Web';
          config.headers['X-Client-Version'] = '1.0.0';
          config.headers['X-Request-Timestamp'] = new Date().toISOString(); */
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Global Response Interceptor
 * Handles standardized responses, token expiration, 401/403/500 errors
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Some failures come back as HTTP 2xx with `status: false` in the envelope.
    // Reject them here so every endpoint fails the same way (and callers never need to check).
    const body = response.data as { status?: unknown; data?: { message?: string }; message?: string } | undefined;
    if (body && typeof body === 'object' && body.status === false) {
      const formattedError: ApiError = {
        message: body.data?.message || body.message || 'The request could not be completed. Please try again.',
        statusCode: response.status,
      };
      if (typeof window !== 'undefined') toast.error(formattedError.message);
      return Promise.reject(formattedError);
    }
    return response;
  },
  (error: AxiosError<BackendErrorResponse>) => {
    const status = error.response?.status;
    const responseData = error.response?.data;

    const formattedError: ApiError = {
      message:
        responseData?.data?.message ||
        responseData?.message ||
        error.message ||
        'An unexpected network error occurred. Please try again.',
      statusCode: status,
      errors: responseData?.data?.validationErrors || responseData?.errors,
    };

    if (typeof window !== 'undefined') {

      if (status === 401) {
        // Clear raw session keys AND the Zustand persist store
        clearAuthSession();

        // Also reset the Zustand auth store in-memory so no stale state survives
        // We import lazily to avoid a circular dependency
        import('@/lib/store/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });

        console.warn('[Axios Interceptor] Unauthorized (401). Session invalidated.');

        // Redirect to login if not already on an auth page
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth')) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      } else if (status === 403) {
        toast.error(formattedError.message);

        console.error('[Axios Interceptor] Forbidden (403): Access denied.');
      } else if (status === 500) {
        toast.error(formattedError.message);

        console.error('[Axios Interceptor] Internal Server Error (500).');
      }
      else {
        toast.error(formattedError.message);

      }
    }

    return Promise.reject(formattedError);
  }
);

/**
 * Generic API Helpers for type-safe requests
 */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.patch<T>(url, data);
  return response.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return response.data;
}

export default apiClient;
