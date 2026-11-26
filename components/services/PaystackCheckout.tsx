'use client';

import { useEffect, useRef } from 'react';
import { usePaystackPayment } from 'react-paystack';

export interface PaystackCheckoutRequest {
  email: string;
  totalMinor: number;
  txnRef: string;
  currency: string;
  orderRef: string;
  guestToken: string;
  /** Paystack channels to offer, e.g. ['card'] or ['bank_transfer']. All channels when left out. */
  channels?: string[];
}

interface PaystackCheckoutProps {
  request: PaystackCheckoutRequest | null;
  publicKey: string;
  onSuccess: (response?: { reference?: string; trxref?: string }) => void;
  onClose: () => void;
}

export default function PaystackCheckout({
  request,
  publicKey,
  onSuccess,
  onClose,
}: PaystackCheckoutProps) {
  const initializePayment = usePaystackPayment({ publicKey });
  const openedTransactionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!request || openedTransactionRef.current === request.txnRef) return;

    openedTransactionRef.current = request.txnRef;
    initializePayment({
      config: {
        email: request.email,
        amount: request.totalMinor,
        reference: request.txnRef,
        currency: request.currency,
        ...(request.channels?.length ? { channels: request.channels } : {}),
        metadata: {
          custom_fields: [],
          orderRef: request.orderRef,
          guestToken: request.guestToken,
        },
      },
      onSuccess,
      onClose,
    });
  }, [initializePayment, onClose, onSuccess, request]);

  return null;
}
