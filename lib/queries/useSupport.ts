'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSupportEnquiry,
  getSupportHistory,
  getSupportOptions,
  getSupportTicket,
  reopenSupportTicket,
  replyToSupportTicket,
  submitSupportFeedback,
  type CreateEnquiryPayload,
  type FeedbackPayload,
} from '@/lib/api/support';

export const supportOptionsQueryKey = ['support-options'] as const;
export const supportHistoryQueryKey = ['support-history'] as const;
export const supportTicketQueryKey = ['support-ticket'] as const;

/** Enquiry types and published help entries (HELP, FAQ, CONTACT, TERMS, PRIVACY). */
export function useSupportOptions() {
  return useQuery({
    queryKey: supportOptionsQueryKey,
    queryFn: getSupportOptions,
    select: (response) => response.data ?? { enquiryTypes: [], content: [] },
    staleTime: 5 * 60 * 1000,
  });
}

/** The signed-in individual's tickets, newest first. */
export function useSupportHistory(page: number, size: number) {
  return useQuery({
    queryKey: [...supportHistoryQueryKey, page, size],
    queryFn: () => getSupportHistory(page, size),
    select: (response) => response.data ?? [],
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}

export function useSupportTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: [...supportTicketQueryKey, ticketId],
    queryFn: () => getSupportTicket(ticketId as string),
    select: (response) => response.data,
    enabled: Boolean(ticketId),
    staleTime: 15_000,
  });
}

type WithKey<T> = T & { idempotencyKey?: string };

export function useCreateSupportEnquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idempotencyKey, ...payload }: WithKey<CreateEnquiryPayload>) =>
      createSupportEnquiry(payload, idempotencyKey).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supportHistoryQueryKey }),
  });
}

export function useSubmitSupportFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idempotencyKey, ...payload }: WithKey<FeedbackPayload>) =>
      submitSupportFeedback(payload, idempotencyKey).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supportHistoryQueryKey }),
  });
}

export function useReplyToSupportTicket(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: string; idempotencyKey?: string }) =>
      replyToSupportTicket(ticketId, body, idempotencyKey).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...supportTicketQueryKey, ticketId] }),
  });
}

export function useReopenSupportTicket(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reason, idempotencyKey }: { reason: string; idempotencyKey?: string }) =>
      reopenSupportTicket(ticketId, reason, idempotencyKey).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...supportTicketQueryKey, ticketId] });
      queryClient.invalidateQueries({ queryKey: supportHistoryQueryKey });
    },
  });
}
