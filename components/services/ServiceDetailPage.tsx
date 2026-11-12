'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { CheckCircle2, CreditCard, Smartphone } from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';
import CtaBanner from '@/components/marketplace/CtaBanner';
import {
  BentoTiles,
  DarkHero,
  FeatureRow,
  HeroBadge,
  HeroHeadline,
  HeroLead,
  HeroPillInput,
  LandingPage,
  LpIcon,
  type LpIconName,
  ProviderRow,
} from '@/components/landing/LandingKit';
import { matchBiller, takeServicePrefill, type ServicePrefill } from '@/lib/marketing/servicePrefill';
import { serviceLanding } from './serviceLanding';
import CustomerInvitePopup, { shouldInviteGuest } from '@/components/marketplace/CustomerInvitePopup';
import { useAuthStore } from '@/lib/store/authStore';
import ServicePaymentForm, { PendingPayment } from './ServicePaymentForm';
import {
  useCreateDigitalServiceOrder,
  useCreatePayment,
  useCreatePaymentQuote,
  useDigitalServiceCatalogues,
  useDigitalServiceCategories,
  useVerifyPayment,
} from '@/lib/queries/useDigitalServices';
import type { DigitalServiceCategory, DigitalServiceOrder, GuestPaymentQuote } from '@/lib/api/digitalServices';
import type { PaystackCheckoutRequest } from './PaystackCheckout';

const PaystackCheckout = dynamic(() => import('./PaystackCheckout'), { ssr: false });

interface ServiceDetailPageProps {
  initialSlug?: string;
  initialTitle?: string;
}

type PreparedPayment = PendingPayment & {
  order: DigitalServiceOrder;
  quote: GuestPaymentQuote;
};

function formatNaira(amountMinor: number) {
  return `₦${(amountMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function PaymentReview({ payment, isProcessing, error, onReset, onContinue }: {
  payment: PreparedPayment;
  isProcessing: boolean;
  error: string;
  onReset: () => void;
  onContinue: () => void;
}) {
  const dateLabel = new Intl.DateTimeFormat('en-NG', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());

  return (
    <article className="w-full overflow-hidden bg-white text-slate-900">
      <header className="flex items-center justify-center gap-3 border-b border-slate-200 px-6 py-8 sm:py-10">
        <Smartphone className="h-6 w-6 text-[#E95312]" />
        <h2 className="text-xl font-semibold sm:text-2xl">{payment.slug?.toUpperCase()} Payment Review</h2>
      </header>
      <div className="space-y-8 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-[#EAF7FC] p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            {payment.providerImage ? <Image src={payment.providerImage} alt={payment.providerName} width={58} height={58} className="h-12 w-12 shrink-0 rounded-full object-contain sm:h-[58px] sm:w-[58px]" /> : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#204657] text-xs font-bold text-white sm:h-[58px] sm:w-[58px]">{payment.providerName.slice(0, 2).toUpperCase()}</span>}
            <div className="min-w-0"><p className="text-sm text-slate-500">Sending {payment.slug} to</p><p className="truncate text-xl font-semibold">{payment.recipientNumber}</p></div>
          </div>
          <span className="shrink-0 text-lg font-bold text-[#204657]">- {formatNaira(payment.quote.totalMinor)}</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700">Transaction Details</h3>
          <dl className="mt-5 divide-y divide-slate-100 text-sm">
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-slate-500">Transaction date</dt><dd className="text-right font-medium text-slate-700">{dateLabel}</dd></div>
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-slate-500">Transfer to</dt><dd className="font-semibold text-slate-700">{payment.recipientNumber}</dd></div>
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-slate-500">Transaction type</dt><dd className="font-semibold capitalize text-slate-700">{payment.slug}</dd></div>
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-slate-500">Amount to send</dt><dd className="font-semibold text-slate-700">{formatNaira(payment.quote.amountMinor)}</dd></div>
            <div className="flex items-center justify-between gap-4 py-4"><dt className="text-slate-500">Charges fee</dt><dd className="font-semibold text-slate-700">{formatNaira(payment.quote.feeMinor)}</dd></div>
          </dl>
        </div>
        {/* {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">{error}</p> : null} */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button type="button" onClick={onReset} disabled={isProcessing} className="rounded-xl border border-slate-200 px-7 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Reset</button>
          <button type="button" onClick={onContinue} disabled={isProcessing} aria-busy={isProcessing} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF6500] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E04B14] disabled:cursor-not-allowed disabled:opacity-50">{isProcessing ? <><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /><span className="sr-only">Preparing payment</span></> : <>Continue <CreditCard className="h-4 w-4" /></>}</button>
        </div>
      </div>
    </article>
  );
}

const categoryBySlug: Record<string, DigitalServiceCategory> = {
  airtime: 'TELCO',
  data: 'INTERNET_SERVICES',
  electricity: 'DISCO',
  tv: 'CABLE',
  education: 'EDUCATION',
  insurance: 'INSURANCE',
  'other-services': 'OTHER_SERVICES',
};

/** Service pills in the landing card, built from the categories the API actually offers. */
const tabByCategory: Partial<Record<DigitalServiceCategory, { slug: string; label: string; icon: LpIconName }>> = {
  TELCO: { slug: 'airtime', label: 'Airtime', icon: 'phone' },
  INTERNET_SERVICES: { slug: 'data', label: 'Data', icon: 'data' },
  DISCO: { slug: 'electricity', label: 'Electricity', icon: 'bolt' },
  CABLE: { slug: 'tv', label: 'TV', icon: 'tv' },
  EDUCATION: { slug: 'education', label: 'Education', icon: 'edu' },
  INSURANCE: { slug: 'insurance', label: 'Insurance', icon: 'shield' },
  OTHER_SERVICES: { slug: 'other-services', label: 'Other services', icon: 'bag' },
};

function focusServiceCard() {
  document.getElementById('svc-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function ServiceDetailPage({ initialSlug = 'airtime', initialTitle = 'Airtime & Data' }: ServiceDetailPageProps) {



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

  const landing = serviceLanding(activeSlug);

  // Details carried over from a landing widget (home "Pay a bill" card) or this page's hero input
  const [handoff, setHandoff] = useState<ServicePrefill | null>(null);
  const [handoffVersion, setHandoffVersion] = useState(0);
  const [heroValue, setHeroValue] = useState('');
  useEffect(() => {
    const carried = takeServicePrefill(activeSlug);
    if (!carried) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after mount
    setHandoff(carried);
    setHeroValue(carried.recipient ?? '');
    setHandoffVersion((v) => v + 1);
  }, [activeSlug]);

  const continueFromHero = () => {
    const recipient = heroValue.replace(/\s+/g, '');
    if (recipient) {
      setHandoff((prev) => ({ ...(prev?.slug === activeSlug ? prev : {}), slug: activeSlug, recipient }));
      setHandoffVersion((v) => v + 1);
    }
    focusServiceCard();
  };

  const { data: apiCategories, isLoading: isLoadingCategories } = useDigitalServiceCategories();
  const serviceTabs = (apiCategories ?? []).flatMap((c) => (tabByCategory[c] ? [tabByCategory[c]!] : []));

  const category = categoryBySlug[activeSlug] ?? 'OTHER_SERVICES';
  const {
    data: serviceCatalogues,
    isError: hasCategoryRequestError,
    isLoading,
  } = useDigitalServiceCatalogues(category, 0);

  const activeHandoff = handoff?.slug === activeSlug ? handoff : null;
  const preferredBiller = matchBiller(serviceCatalogues ?? [], activeHandoff?.provider)?.billerCode;
  const prefill = useMemo(
    () =>
      activeHandoff
        ? { recipient: activeHandoff.recipient, amountMinor: activeHandoff.amountMinor }
        : undefined,
    [activeHandoff],
  );


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
    <LandingPage>
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

      <main className="flex-1">
        <DarkHero>
          <Navbar />
          <section
            className={`relative mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-12 lg:items-start px-4 pb-16 pt-6 transition-opacity duration-300 sm:px-6 sm:pt-10 ${isFading ? 'opacity-60' : 'opacity-100'}`}
          >
            {/* The live form is taller than the hero copy, so pin the copy near the top on wide screens */}
            <div className="min-w-0 flex-[1_1_520px] lg:sticky lg:top-6 lg:pt-14">
              <HeroBadge>{landing.badge}</HeroBadge>
              <HeroHeadline key={activeSlug} lines={landing.lines} />
              <HeroLead>{landing.body}</HeroLead>
              <HeroPillInput
                icon={landing.input.icon}
                label={landing.input.label}
                action="Continue"
                onAction={continueFromHero}
                inputProps={{
                  id: 'service-hero-input',
                  type: landing.input.type,
                  inputMode: landing.input.type === 'tel' ? 'tel' : 'numeric',
                  autoComplete: landing.input.type === 'tel' ? 'tel-national' : 'off',
                  placeholder: landing.input.placeholder,
                  value: heroValue,
                  onChange: (e) => setHeroValue(e.target.value),
                }}
              />
              {landing.providers.length > 0 && <ProviderRow label={landing.providerLabel} items={landing.providers} />}
            </div>

            <div className="relative flex min-w-0 flex-[1_1_460px] justify-center">
              <section
                id="svc-card"
                aria-labelledby="svc"
                className="lp-phone relative z-[1] w-full max-w-[540px] scroll-mt-6 overflow-hidden rounded-[32px] border-8 border-[#1A2329] bg-white text-[#233C49]"
              >
                <div className="px-6 pt-6 sm:px-7">
                  <div className="text-sm font-bold text-[#C2531C]">Choose your digital service</div>
                  <h2 id="svc" className="m-0 mt-1.5 text-[22px] font-extrabold sm:text-2xl">
                    Select a service below to continue.
                  </h2>
                </div>
                <div className="no-scrollbar mt-[18px] flex gap-2 overflow-x-auto px-6 pb-1 sm:px-7">
                  {isLoadingCategories
                    ? Array.from({ length: 4 }, (_, i) => (
                        <span key={i} className="h-[46px] w-28 shrink-0 animate-pulse rounded-full bg-[#EEF1F3]" />
                      ))
                    : serviceTabs.map((tab) => {
                        const on = tab.slug === activeSlug;
                        return (
                          <button
                            key={tab.slug}
                            type="button"
                            aria-current={on ? 'page' : undefined}
                            onClick={() => handleServiceClick(tab.slug, tab.label)}
                            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-[11px] text-[15px] font-semibold transition-colors ${on ? 'border-[#233C49] bg-[#233C49] text-white' : 'border-[#C9D0D4] bg-white text-[#233C49] hover:border-[#8A989F]'}`}
                          >
                            <LpIcon name={tab.icon} size={18} />
                            {tab.label}
                          </button>
                        );
                      })}
                </div>

                <div className="px-6 pb-7 pt-6 sm:px-7">
                  {isConfirmModalOpen && pendingPayment ? (
                    <div className="-mx-6 -mb-7 -mt-6 sm:-mx-7">
                      <PaymentReview
                        payment={pendingPayment}
                        isProcessing={isProcessing}
                        error={paymentError}
                        onReset={() => {
                          setIsConfirmModalOpen(false);
                          setPendingPayment(null);
                          setPaymentError('');
                        }}
                        onContinue={handleConfirmPayment}
                      />
                    </div>
                  ) : (
                    <ServicePaymentForm
                      key={`${activeSlug}-${handoffVersion}-${preferredBiller ?? ''}`}
                      variant="landing"
                      activeSlug={activeSlug}
                      activeTitle={activeTitle}
                      billers={serviceCatalogues ?? []}
                      isLoading={isLoading}
                      isError={hasCategoryRequestError}
                      isFading={isFading}
                      submissionError={paymentError}
                      onValidated={handleValidated}
                      formResetKey={formResetKey}
                      initialBillerCode={preferredBiller}
                      prefill={prefill}
                    />
                  )}
                </div>
              </section>
            </div>
          </section>
          <FeatureRow items={landing.features} />
        </DarkHero>

        <BentoTiles
          label={landing.bento.hero.title}
          content={{
            ...landing.bento,
            hero: {
              ...landing.bento.hero,
              action: { label: landing.bento.hero.actionLabel, onClick: focusServiceCard },
            },
          }}
        />
        <CtaBanner />
      </main>

      {isSuccessModalOpen && pendingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102A36]/75 p-4 backdrop-blur-sm">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-[28px] bg-white text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 px-6 pb-7 pt-8 text-center sm:px-9 sm:pt-10 [@media(max-height:800px)]:pb-5 [@media(max-height:800px)]:pt-6">
              <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#E6F7ED] text-[#009447] ring-8 ring-[#F2FBF6]">
                <CheckCircle2 className="h-10 w-10 stroke-[2.4]" />
              </div>
              <span className="mt-5 inline-flex rounded-full bg-[#E8F7EE] px-3 py-1 text-[11px] font-bold tracking-wide text-[#008A46]">PAYMENT CONFIRMED</span>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#102A36]">Payment successful</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Your {pendingPayment.slug} transaction has been completed. The service will be delivered shortly.</p>
            </div>

            <div className="space-y-6 px-6 py-7 sm:px-9 sm:py-8 [@media(max-height:800px)]:space-y-4 [@media(max-height:800px)]:py-5">
              <div className="rounded-2xl bg-[#EAF7FC] px-5 py-4 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#55707D]">Total paid</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#204657]">{formatNaira(pendingPayment.quote.totalMinor)}</p>
                <p className="mt-1 text-xs text-slate-500">including {formatNaira(pendingPayment.quote.feeMinor)} service fee</p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between"><h4 className="text-sm font-semibold text-[#304A57]">Receipt details</h4><span className="text-xs text-slate-400">{pendingPayment.providerName}</span></div>
                <dl className="divide-y divide-slate-100 rounded-xl border border-slate-100 px-4">
                  <div className="flex items-center justify-between gap-5 py-3.5 text-sm"><dt className="text-slate-500">Recipient</dt><dd className="text-right font-semibold text-slate-700">{pendingPayment.recipientNumber}</dd></div>
                  <div className="flex items-center justify-between gap-5 py-3.5 text-sm"><dt className="text-slate-500">Service</dt><dd className="font-semibold capitalize text-slate-700">{pendingPayment.slug}</dd></div>
                  <div className="flex items-center justify-between gap-5 py-3.5 text-sm"><dt className="text-slate-500">Transaction reference</dt><dd className="max-w-[190px] break-all text-right font-mono text-xs font-semibold text-[#204657]">{transactionRef}</dd></div>
                </dl>
              </div>

              <div className="space-y-3 pt-1">
                <button type="button" onClick={() => { handleReset(); finishService(); }} className="w-full rounded-xl bg-[#FF6500] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#E95312]/20 transition hover:bg-[#E04B14] active:scale-[0.98]">Make another payment</button>
                <button type="button" onClick={() => { setIsSuccessModalOpen(false); finishService('/'); }} className="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-[#304A57] transition hover:bg-slate-50 active:scale-[0.98]">Return to marketplace</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {inviteOpen && <CustomerInvitePopup onClose={closeInvite} />}

      <Footer />
    </LandingPage>
  );
}
