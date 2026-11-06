'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createDigitalServiceOrder,
  createDigitalServiceOrderAuthenticated,
  createGuestPayment,
  createGuestPaymentAuthenticated,
  createGuestPaymentQuote,
  createGuestPaymentQuoteAuthenticated,
  getDigitalServiceCatalogues,
  getDigitalServiceCategories,
  verifyGuestPayment,
  verifyGuestPaymentAuthenticated,
  type CreateDigitalServiceOrderInput,
  type DigitalServiceCategory,
} from '@/lib/api/digitalServices';

export const digitalServiceCategoriesQueryKey = ['digital-service-categories'] as const;
export const digitalServiceCataloguesQueryKey = ['digital-service-catalogues'] as const;

/* ─── Catalogue ────────────────────────────────────────────────── */
export function useDigitalServiceCategories() {
  return useQuery({
    queryKey: digitalServiceCategoriesQueryKey,
    queryFn: getDigitalServiceCategories,
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDigitalServiceCatalogues(category: DigitalServiceCategory, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: [...digitalServiceCataloguesQueryKey, category, page, size],
    queryFn: () => getDigitalServiceCatalogues(category, page, size),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(category),
  });
}

/* ─── Checkout (order → quote → payment → verify) ──────────────── */
// `authenticated` picks the signed-in endpoints; otherwise the public guest endpoints are used.
export function useCreateDigitalServiceOrder(authenticated = false) {
  return useMutation({
    mutationFn: (input: CreateDigitalServiceOrderInput) =>
      (authenticated ? createDigitalServiceOrderAuthenticated : createDigitalServiceOrder)(input).then(
        (response) => response.data
      ),
  });
}

export function useCreatePaymentQuote(authenticated = false) {
  return useMutation({
    mutationFn: ({ orderRef, email, guestToken }: { orderRef: string; email: string; guestToken: string }) =>
      (authenticated ? createGuestPaymentQuoteAuthenticated : createGuestPaymentQuote)(
        { orderRef, provider: 'PAYSTACK', email },
        guestToken
      ).then((response) => response.data),
  });
}

export function useCreatePayment(authenticated = false) {
  return useMutation({
    mutationFn: ({ orderRef, expectedTotalMinor, guestToken }: { orderRef: string; expectedTotalMinor: number; guestToken: string }) =>
      (authenticated ? createGuestPaymentAuthenticated : createGuestPayment)(
        { orderRef, provider: 'PAYSTACK', expectedTotalMinor },
        guestToken
      ).then((response) => response.data),
  });
}

export function useVerifyPayment(authenticated = false) {
  return useMutation({
    mutationFn: ({ txnRef, guestToken }: { txnRef: string; guestToken: string }) =>
      (authenticated ? verifyGuestPaymentAuthenticated : verifyGuestPayment)({ txnRef }, guestToken).then(
        (response) => response.data
      ),
  });
}
