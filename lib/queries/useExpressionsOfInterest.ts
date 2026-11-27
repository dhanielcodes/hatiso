'use client';

import { useMutation } from '@tanstack/react-query';
import { submitExpressionOfInterest, type ExpressionOfInterestPayload } from '@/lib/api/expressionsOfInterest';

/** Sends the public Contact form to POST /api/public/expressions-of-interest. */
export function useSubmitExpressionOfInterest() {
  return useMutation({
    mutationFn: (payload: ExpressionOfInterestPayload) => submitExpressionOfInterest(payload),
  });
}
