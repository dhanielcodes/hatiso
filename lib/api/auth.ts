import { apiGet, apiPost } from '@/lib/api/axios';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface LoginResponse {
  code: number;
  status: boolean;
  data: LoginSession;
}

export interface CurrentUserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

interface CurrentUserResponse {
  code: number;
  status: boolean;
  data: CurrentUserProfile;
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginSession> {
  const response = await apiPost<LoginResponse>('/api/public/auth/login', credentials);

  if (!response.status || !response.data?.accessToken) {
    throw new Error('Unable to sign in. Please verify your credentials and try again.');
  }

  return response.data;
}

export async function getCurrentUser() {
  const response = await apiGet<CurrentUserResponse>('/api/v1/users/me');

  if (!response.status || !response.data?.userId) {
    throw new Error('Unable to retrieve your profile.');
  }

  return response.data;
}
