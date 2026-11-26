'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';
import CustomerInvitePopup, { shouldInviteGuest } from '@/components/marketplace/CustomerInvitePopup';
import { useAuthStore } from '@/lib/store/authStore';
import ServiceTabsSelector from './ServiceTabsSelector';
import ServicePaymentForm, { type PendingPayment, type ServiceDraft } from './ServicePaymentForm';
import { providerShort } from './ProviderSelector';
import {
  useCreateDigitalServiceOrder,
  useCreatePayment,
  useCreatePaymentQuote,
  useDigitalServiceCatalogues,
  useVerifyPayment,
} from '@/lib/queries/useDigitalServices';
import type { DigitalServiceOrder, GuestPaymentQuote } from '@/lib/api/digitalServices';
import { CATEGORY_BY_SLUG, SERVICE_LABEL_BY_SLUG, SINGLE_PRODUCT_SERVICES, billersForService } from '@/lib/digitalServices/categoryServices';
import type { PaystackCheckoutRequest } from './PaystackCheckout';
import { ConfirmPaymentDialog, PAY_METHODS, PaymentSuccessDialog, ProcessingDialog, type PayMethod } from './PayFlowDialogs';

const PaystackCheckout = dynamic(() => import('./PaystackCheckout'), { ssr: false });

interface ServiceDetailPageProps {
  initialSlug?: string;
  initialTitle?: string;
}

type PreparedPayment = PendingPayment & {
  order: DigitalServiceOrder;
  quote: GuestPaymentQuote;
};

/** "0803 ••• 4512" for the hero receipt; falls back to a placeholder until a number is typed. */
function maskRecipient(value?: string) {
  const digits = (value ?? '').replace(/\D/g, '');
  const local = digits.startsWith('234') ? `0${digits.slice(3)}` : digits;
  if (local.length < 7) return '•••• ••• ••••';
  return `${local.slice(0, 4)} ••• ${local.slice(-4)}`;
}

/** "Airtime · MTN · 0803 ••• 4512" line on the confirm dialog. */
function paymentLine(payment: PendingPayment) {
  const label = SERVICE_LABEL_BY_SLUG[payment.slug] ?? payment.slug;
  return [label, payment.providerName, maskRecipient(payment.recipientNumber)].filter(Boolean).join(' · ');
}

export default function ServiceDetailPage({ initialSlug = 'airtime', initialTitle = 'Airtime' }: ServiceDetailPageProps) {



  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [activeTitle, setActiveTitle] = useState(initialTitle);
  const [slugFromProp, setSlugFromProp] = useState(initialSlug);
  const [isFading, setIsFading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PreparedPayment | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [formResetKey, setFormResetKey] = useState(0);
  const [paymentError, setPaymentError] = useState('');
  const [draft, setDraft] = useState<ServiceDraft | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [paystackRequest, setPaystackRequest] = useState<PaystackCheckoutRequest | null>(null);
  // Guest sign-up invite, shown after the receipt is dismissed. `inviteNext` is where to go once it closes.
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteNext, setInviteNext] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';
  const createOrderMutation = useCreateDigitalServiceOrder();
  const quoteMutation = useCreatePaymentQuote();
  const createPaymentMutation = useCreatePayment();
  const verifyPaymentMutation = useVerifyPayment();

  if (initialSlug !== slugFromProp) {
    setSlugFromProp(initialSlug);
    setActiveSlug(initialSlug);
    setActiveTitle(initialTitle);
  }

  useEffect(() => {
    const handlePopState = () => {
      const parts = window.location.pathname.split('/');
      const slugFromUrl = parts[parts.length - 1];
      if (slugFromUrl && slugFromUrl !== activeSlug) {
        setIsFading(true);
        setTimeout(() => {
          setActiveSlug(slugFromUrl);
          setActiveTitle(initialTitle);
          setIsFading(false);
        }, 150);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeSlug]);

  /** Service board hero copy: headline, the highlighted tail, and one short line. */
  const heroContent = ({
    airtime: { head: 'Airtime,', tail: 'instantly.', body: 'Top up any Nigerian network, for yourself or someone else. The credit lands in seconds.' },
    data: { head: 'Data that', tail: 'keeps you online.', body: 'Daily, weekly and monthly bundles on every network, at clear prices. It activates in moments.' },
    'internet-services': { head: 'Home internet,', tail: 'renewed.', body: 'Renew your home or office plan without another app. Enter your account number and stay online.' },
    electricity: { head: 'Keep the', tail: 'lights on.', body: 'Buy prepaid tokens or pay postpaid bills at any hour. Your token shows on screen and by email.' },
    tv: { head: 'Never miss', tail: 'your show.', body: 'Renew DStv, GOtv or StarTimes in a few taps with your smartcard or IUC number.' },
    betting: { head: 'Fund your wallet,', tail: 'fast.', body: 'Top up your betting wallet in seconds. Please bet responsibly.' },
  } as Record<string, { head: string; tail: string; body: string }>)[activeSlug] ?? {
    head: `${activeTitle},`,
    tail: 'instantly.',
    body: 'Pay securely across trusted providers in Nigeria.',
  };

  const category = CATEGORY_BY_SLUG[activeSlug] ?? 'OTHER_SERVICES';
  const {
    data: categoryCatalogues,
    isError: hasCategoryRequestError,
    isLoading,
  } = useDigitalServiceCatalogues(category, 0);
  // Airtime and Data share the TELCO catalogue; keep only this service's products
  const serviceCatalogues = useMemo(
    () => (categoryCatalogues ? billersForService(activeSlug, categoryCatalogues) : undefined),
    [activeSlug, categoryCatalogues]
  );
  const heroBillers = (serviceCatalogues ?? []).slice(0, 4);


  const handleServiceClick = (slug: string, title: string) => {
    if (slug === activeSlug) return;

    setIsFading(true);
    setTimeout(() => {
      setActiveSlug(slug);
      setActiveTitle(title);

      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/categories/${slug}`);
      }
      setTimeout(() => {
        setIsFading(false);
      }, 50);
    }, 150);
  };

  const handleValidated = async (payment: PendingPayment) => {
    setPaymentError('');

    if (!payment.email) {
      setPaymentError('Enter an email address to receive your payment receipt.');
      return;
    }

    try {
      const fields = payment.values.fields;
      const order = await createOrderMutation.mutateAsync({
        productCode: payment.productCode,
        recipient: payment.recipientNumber,
        fields: fields && typeof fields === 'object' && !Array.isArray(fields)
          ? fields as Record<string, unknown>
          : {},
        amountMinor: payment.amountMinor,
        contactPhone: String(payment.values.contactPhone ?? payment.recipientNumber),
        email: payment.email,
      });
      const quote = await quoteMutation.mutateAsync({
        orderRef: order.reference,
        email: payment.email,
        guestToken: order.guestToken,
      });

      setPendingPayment({ ...payment, order, quote });
      setIsConfirmModalOpen(true);
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to prepare your payment. Please try again.');
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingPayment) return;
    if (!paystackPublicKey) {
      setPaymentError('Paystack is not configured. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to your environment.');
      return;
    }

    setIsProcessing(true);
    setPaymentError('');
    try {
      const payment = await createPaymentMutation.mutateAsync({
        orderRef: pendingPayment.order.reference,
        expectedTotalMinor: pendingPayment.quote.totalMinor,
        guestToken: pendingPayment.order.guestToken,
      });
      const transaction = payment;
      setTransactionRef(transaction.txnRef);
      setPaystackRequest({
        email: pendingPayment.email,
        totalMinor: transaction.totalMinor,
        txnRef: transaction.txnRef,
        currency: transaction.currency,
        orderRef: transaction.orderRef,
        guestToken: pendingPayment.order.guestToken,
        channels: PAY_METHODS.find((m) => m.id === payMethod)?.channels,
      });
    } catch (error) {
      setIsProcessing(false);
      setPaymentError(error instanceof Error ? error.message : 'Unable to initialise payment. Please try again.');
    }
  };

  const handleReset = () => {
    setIsSuccessModalOpen(false);
    setPendingPayment(null);
    setPaymentError('');
    setPaystackRequest(null);
    setFormResetKey((k) => k + 1);
  };

  /** Leaving the receipt: guests get the sign-up invite first, then continue to `next` (if any). */
  const finishService = (next?: string) => {
    if (shouldInviteGuest(isAuthenticated)) {
      setInviteNext(next ?? null);
      setInviteOpen(true);
    } else if (next) {
      router.push(next);
    }
  };

  const closeInvite = () => {
    setInviteOpen(false);
    if (inviteNext) router.push(inviteNext);
    setInviteNext(null);
  };


  return (
    <div className="relative flex min-h-screen flex-col bg-cloud text-carbon selection:bg-silver selection:text-carbon">
      <Navbar />
      <PaystackCheckout
        request={paystackRequest}
        publicKey={paystackPublicKey}
        onSuccess={async (response) => {
          if (!pendingPayment) return;

          setIsProcessing(true);
          setPaymentError('');
          const txnRef = response?.reference ?? response?.trxref ?? pendingPayment.order.paymentReference ?? transactionRef;
          try {
            const verification = await verifyPaymentMutation.mutateAsync({
              txnRef,
              guestToken: pendingPayment.order.guestToken,
            });
            if (verification.status !== 'SUCCESSFUL') {
              throw new Error('Your payment is still being confirmed. Please check again shortly.');
            }
            setTransactionRef(verification.txnRef);
            setIsProcessing(false);
            setPaystackRequest(null);
            setIsConfirmModalOpen(false);
            setIsSuccessModalOpen(true);
          } catch (error) {
            setIsProcessing(false);
            setPaystackRequest(null);
            setPaymentError(error instanceof Error ? error.message : 'We could not verify your payment. Please try again.');
          }
        }}
        onClose={() => {
          setIsProcessing(false);
          setPaystackRequest(null);
          setIsConfirmModalOpen(false);
          setPendingPayment(null);
          setPaymentError('');
          setFormResetKey((key) => key + 1);
        }}
      />

      {/* Hero: copy, a live receipt that follows the form, and the service switcher */}
      <section className="bg-carbon text-cloud">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-[clamp(16px,4vw,56px)] pt-[clamp(40px,6vw,80px)]">
          <nav aria-label="Breadcrumb" className="hz-rise flex gap-2 text-sm text-grey-400">
            <Link href="/#popular-categories" className="hover:text-cloud">Services</Link>
            <span aria-hidden="true">/</span>
            <span className="text-cloud">{activeTitle}</span>
          </nav>
          <div
            className={`flex flex-wrap items-center justify-between gap-[clamp(40px,6vw,80px)] transition-opacity duration-300 ${isFading ? 'opacity-30' : 'opacity-100'}`}
          >
            <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-7">
              <div className="hz-rise flex max-w-[640px] flex-col gap-4" style={{ '--d': 1 } as React.CSSProperties}>
                <h1 className="text-[clamp(38px,5.5vw,68px)] leading-[1.04] font-semibold tracking-[-0.035em]">
                  {heroContent.head} <span className="text-highlight">{heroContent.tail}</span>
                </h1>
                <p className="text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-silver">{heroContent.body}</p>
              </div>
              <ul className="hz-rise flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-grey-400" style={{ '--d': 2 } as React.CSSProperties}>
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-silver" aria-hidden="true" />Delivered in seconds</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-silver" aria-hidden="true" />Encrypted payment</li>
              </ul>
            </div>

            <div
              aria-hidden="true"
              className="hz-rise relative h-[360px] max-w-[520px] min-w-0 flex-[1_1_400px] overflow-hidden rounded-2xl bg-graphite bg-[radial-gradient(var(--color-grey-800)_1px,transparent_1px)] bg-[length:22px_22px]"
              style={{ '--d': 2 } as React.CSSProperties}
            >
              <div className="hz-stagger absolute top-6 left-6 flex gap-2">
                {heroBillers.map((biller) => {
                  const on = biller.billerCode === draft?.billerCode;
                  return (
                    <span
                      key={biller.billerCode}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border border-grey-800 text-[11px] font-bold transition-colors duration-200 ${on ? 'bg-cloud text-carbon' : 'bg-carbon text-grey-400'}`}
                    >
                      {providerShort(biller.billerName)}
                    </span>
                  );
                })}
              </div>
              <div className="absolute top-7 right-6 inline-flex items-center gap-2 rounded-md border border-grey-800 bg-carbon px-3.5 py-2 text-xs font-medium text-cloud">
                <Zap className="h-3.5 w-3.5 text-silver" />
                Lands in seconds
              </div>
              <div className="hz-card absolute inset-x-0 bottom-7 mx-auto flex w-[min(320px,calc(100%-48px))] flex-col gap-4 rounded-xl bg-cloud p-[22px] text-carbon shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-[13px] font-medium text-grey-600">
                    {activeTitle}{draft?.billerName ? ` · ${draft.billerName}` : ''}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-grey-100 bg-white px-2.5 py-1 text-xs font-medium text-status-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Delivered
                  </span>
                </span>
                <span className="text-4xl leading-none font-semibold tracking-[-0.02em] tabular-nums">
                  ₦{Math.floor((draft?.amountMinor ?? 0) / 100).toLocaleString('en-NG')}
                  <span className="text-lg text-grey-500">.{String((draft?.amountMinor ?? 0) % 100).padStart(2, '0')}</span>
                </span>
                <span className="border-t border-dashed border-grey-150" />
                <span className="flex flex-col gap-2 text-[13px]">
                  <span className="flex justify-between gap-3"><span className="text-grey-600">To</span><span className="font-medium">{maskRecipient(draft?.recipient)}</span></span>
                  <span className="flex justify-between gap-3"><span className="text-grey-600">Receipt</span><span className="font-medium">Sent to email</span></span>
                </span>
              </div>
            </div>
          </div>

          <ServiceTabsSelector activeSlug={activeSlug} onSelectService={handleServiceClick} />
        </div>
      </section>

      <main className="bg-cloud text-carbon">
        <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,56px)] pt-[clamp(32px,5vw,56px)] pb-[clamp(64px,8vw,112px)]">
            <ServicePaymentForm
              hideProductSelector={SINGLE_PRODUCT_SERVICES.has(activeSlug)}
              activeSlug={activeSlug}
              activeTitle={activeTitle}
              billers={serviceCatalogues ?? []}
              isLoading={isLoading}
              isError={hasCategoryRequestError}
              isFading={isFading}
              submissionError={paymentError}
              onValidated={handleValidated}
              formResetKey={formResetKey}
              onDraftChange={setDraft}
            />
        </div>
      </main>

      {isConfirmModalOpen && pendingPayment && !isProcessing && (
        <ConfirmPaymentDialog
          line={paymentLine(pendingPayment)}
          amountMinor={pendingPayment.quote.amountMinor}
          feeMinor={pendingPayment.quote.feeMinor}
          totalMinor={pendingPayment.quote.totalMinor}
          method={payMethod}
          onMethod={setPayMethod}
          onPay={handleConfirmPayment}
          error={paymentError}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setPendingPayment(null);
            setPaymentError('');
          }}
        />
      )}

      {(isProcessing || createOrderMutation.isPending || quoteMutation.isPending) && (
        <ProcessingDialog title={paystackRequest ? 'Confirming your payment' : 'Preparing your payment'} />
      )}

      {isSuccessModalOpen && pendingPayment && (
        <PaymentSuccessDialog
          totalMinor={pendingPayment.quote.totalMinor}
          line={`${pendingPayment.providerName} ${SERVICE_LABEL_BY_SLUG[pendingPayment.slug]?.toLowerCase() ?? pendingPayment.slug} sent to ${maskRecipient(pendingPayment.recipientNumber)}`}
          reference={transactionRef}
          methodLabel={PAY_METHODS.find((m) => m.id === payMethod)?.label ?? 'Card'}
          receiptHref={isAuthenticated ? '/dashboard/transactions' : undefined}
          guest={!isAuthenticated}
          onAgain={() => {
            handleReset();
            finishService();
          }}
          onClose={() => {
            setIsSuccessModalOpen(false);
            finishService();
          }}
        />
      )}

      {inviteOpen && <CustomerInvitePopup onClose={closeInvite} />}

      <Footer />
    </div>
  );
}
