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

export interface RegisterPayload {
  type: 'INDIVIDUAL' | 'BUSINESS';
  email: string;
  phone: string | null;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponseData {
  userId: string;
  message: string;
}

interface RegisterResponse {
  code: number;
  status: boolean;
  data: RegisterResponseData;
}

export interface ResendVerificationPayload {
  userId: string;
}

export interface ResendVerificationResponseData {
  message: string;
}

interface ResendVerificationResponse {
  code: number;
  status: boolean;
  data: ResendVerificationResponseData;
}

export interface VerifyUserPayload {
  purpose: 'VERIFY_EMAIL' | 'VERIFY_PHONE';
  userId: string;
  code: string;
}

export interface VerifyUserResponseData {
  message?: string;
  [key: string]: unknown;
}

interface VerifyUserResponse {
  code: number;
  status: boolean;
  data: VerifyUserResponseData;
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

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponseData> {
  const response = await apiPost<RegisterResponse>('/api/public/users/register', payload);

  if (!response.status || !response.data?.userId) {
    throw new Error(response.data?.message || 'Registration failed. Please try again.');
  }

  return response.data;
}

export async function resendVerification(payload: ResendVerificationPayload): Promise<ResendVerificationResponseData> {
  const response = await apiPost<ResendVerificationResponse>('/api/public/users/user/resend-verification', payload);

  if (!response.status) {
    throw new Error(response.data?.message || 'Failed to resend verification code.');
  }

  return response.data;
}

export async function verifyUser(payload: VerifyUserPayload): Promise<VerifyUserResponseData> {
  const response = await apiPost<VerifyUserResponse>('/api/public/users/user/verify', payload);

  if (!response.status) {
    throw new Error(response.data?.message || 'Verification failed. Please check the code.');
  }

  return response.data;
}
