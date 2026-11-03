import { apiPost } from '@/lib/api/axios';

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

export async function loginUser(credentials: LoginCredentials): Promise<LoginSession> {
  const response = await apiPost<LoginResponse>('/api/public/auth/login', credentials);

  if (!response.status || !response.data?.accessToken) {
    throw new Error('Unable to sign in. Please verify your credentials and try again.');
  }

  return response.data;
}
