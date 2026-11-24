import { apiGet, apiPost, apiPut } from '@/lib/api/axios';
import type { ApiResponse } from '@/types';

/* ─── Types ────────────────────────────────────────────────────── */
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

export interface CurrentUserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
}

export interface RegisterPayload {
  type: 'INDIVIDUAL' | 'BUSINESS';
  email?: string;
  phone?: string | null;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
}

export interface ResetPasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface RecoverPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResendVerificationPayload {
  userId: string;
}

export type VerificationPurpose = 'VERIFY_EMAIL' | 'VERIFY_PHONE';

export interface VerifyUserPayload {
  purpose: VerificationPurpose;
  userId: string;
  code: string;
}

export interface MessageData {
  message?: string;
}

export interface RegisterResponseData extends MessageData {
  userId: string;
  purpose?: VerificationPurpose;
}

export interface ResumeVerificationData extends MessageData {
  userId?: string;
  purpose?: VerificationPurpose;
  verificationRequired: boolean;
}

export interface VerifyUserResponseData extends MessageData {
  [key: string]: unknown;
}

/* ─── Session ──────────────────────────────────────────────────── */
export function loginUser(credentials: LoginCredentials) {
  return apiPost<ApiResponse<LoginSession>>('/api/public/auth/login', credentials);
}

/* ─── Current user ─────────────────────────────────────────────── */
export function getCurrentUser() {
  return apiGet<ApiResponse<CurrentUserProfile>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/users/me`);
}

export function updateProfile(payload: ProfileUpdatePayload) {
  return apiPut<ApiResponse<RegisterResponseData>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/users/me`, payload);
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiPost<ApiResponse<MessageData>>(`/api/${process.env.NEXT_PUBLIC_API_VERSION}/users/me/password/reset`, payload);
}

/* ─── Password recovery (public) ───────────────────────────────── */
export function forgotPassword(payload: { email: string }) {
  return apiPost<ApiResponse<MessageData>>('/api/public/auth/password/forgot', payload);
}

export function recoverPassword(payload: RecoverPasswordPayload) {
  return apiPost<ApiResponse<MessageData>>('/api/public/auth/password/recover', payload);
}

/* ─── Registration (public) ────────────────────────────────────── */
export function registerUser(payload: RegisterPayload) {
  // The sign-up page shows the error inline (or resumes verification), so no toast.
  return apiPost<ApiResponse<RegisterResponseData>>('/api/public/users/register', payload, { skipErrorToast: true });
}

/**
 * Finds an unfinished sign-up by email or phone and (re)sends its code.
 * Redirect only when `verificationRequired` is true: the response never says whether the account exists.
 */
export function resumeVerification(identifier: string) {
  return apiPost<ApiResponse<ResumeVerificationData>>('/api/public/users/user/resume-verification', { identifier }, { skipErrorToast: true });
}

export function resendVerification(payload: ResendVerificationPayload) {
  return apiPost<ApiResponse<MessageData>>('/api/public/users/user/resend-verification', payload);
}

export function verifyUser(payload: VerifyUserPayload) {
  return apiPost<ApiResponse<VerifyUserResponseData>>('/api/public/users/user/verify', payload);
}
