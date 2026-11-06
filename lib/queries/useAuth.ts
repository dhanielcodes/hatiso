'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  forgotPassword,
  getCurrentUser,
  recoverPassword,
  registerUser,
  resendVerification,
  resetPassword,
  updateProfile,
  verifyUser,
  type ProfileUpdatePayload,
  type RecoverPasswordPayload,
  type RegisterPayload,
  type ResendVerificationPayload,
  type ResetPasswordPayload,
  type VerifyUserPayload,
} from '@/lib/api/auth';

export const currentUserQueryKey = ['current-user'] as const;

/* ─── Current user ─────────────────────────────────────────────── */
export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    select: (response) => response.data,
    staleTime: 60_000,
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload).then((response) => response.data),
  });
}

/* ─── Password recovery ────────────────────────────────────────── */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword({ email }).then((response) => response.data),
  });
}

export function useRecoverPassword() {
  return useMutation({
    mutationFn: (payload: RecoverPasswordPayload) => recoverPassword(payload).then((response) => response.data),
  });
}

/* ─── Registration ─────────────────────────────────────────────── */
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload).then((response) => response.data),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (payload: ResendVerificationPayload) => resendVerification(payload).then((response) => response.data),
  });
}

export function useVerifyUser() {
  return useMutation({
    mutationFn: (payload: VerifyUserPayload) => verifyUser(payload).then((response) => response.data),
  });
}
