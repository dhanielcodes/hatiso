'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Zap,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';
import CustomerInvitePopup, { shouldInviteGuest } from '@/components/marketplace/CustomerInvitePopup';
import { useAuthStore } from '@/lib/store/authStore';
import ServiceTabsSelector from './ServiceTabsSelector';
import ServicePaymentForm, { PendingPayment } from './ServicePaymentForm';
import {
  useCreateDigitalServiceOrder,
  useCreatePayment,
  useCreatePaymentQuote,
  useDigitalServiceCatalogues,
  useVerifyPayment,
} from '@/lib/queries/useDigitalServices';
import type { DigitalServiceOrder, GuestPaymentQuote } from '@/lib/api/digitalServices';
import { CATEGORY_BY_SLUG, SINGLE_PRODUCT_SERVICES, billersForService } from '@/lib/digitalServices/categoryServices';
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
    <article className="w-full max-w-xl overflow-hidden rounded-[24px] bg-white text-slate-900 shadow-2xl">
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

  const heroContent = {
    airtime: {
      headlineOrange: 'Airtime, ',
      headlineWhite: 'instantly',
      body: "Recharge any Nigerian network in seconds, whether it's your own line or a loved one's. Enter the number, pick an amount from ₦100 upwards, and the credit lands straight away. You also earn cashback on every top-up, so staying in touch gives something back.",
      image: '/images/airtime_hero_2x.png',
      cardTitle: 'Top up in seconds',
      cardSubtitle: 'Enter a number, pick an amount and you’re done. No account needed.',
    },
    data: {
      headlineOrange: 'Stay connected ',
      headlineWhite: 'for less',
      body: 'Choose from daily, weekly and monthly data bundles for MTN, Airtel, Glo and 9mobile, all at clear, upfront prices. Pick the plan that fits how you browse, stream or work, and it activates within moments. No hidden charges, and no need to dial codes.',
      image: '/images/data_hero.png',
      cardTitle: 'One home for every service',
      cardSubtitle: 'Airtime, data, bills and more. Everything you pay for, all in one place.',
    },
    'internet-services': {
      headlineOrange: 'Home internet, ',
      headlineWhite: 'renewed',
      body: 'Renew your Smile, Spectranet and other internet plans without logging into another app. Enter your account number, pick a plan, and you stay online.',
      image: '/images/data_hero.png',
      cardTitle: 'Stay online without the hassle',
      cardSubtitle: 'Renew your home or office internet in a few taps.',
    },
    electricity: {
      headlineWhite: 'Keep the ',
      headlineOrange: 'lights on',
      body: 'Buy prepaid tokens or pay postpaid bills for your distribution company without queuing or travelling. Enter your meter number, confirm the name on the account, and get your token instantly on screen and by email. It works at any hour, even when power is out',
      image: '/images/bills_hero.png',
      cardTitle: 'Pay any bill, anytime',
      cardSubtitle: 'Electricity, TV, betting and more, settled instantly without queues or extra apps.',
    },
    tv: {
      headlineOrange: 'Never miss ',
      headlineWhite: 'your show',
      body: 'Renew or change your DStv, GOtv or StarTimes package in a few taps. Just enter your smartcard or IUC number, choose a plan, and your subscription is refreshed right away. That means no blank screens on match day or finale night.',
      image: '/images/bills_hero.png',
      cardTitle: 'Pay any bill, anytime',
      cardSubtitle: 'Electricity, TV, betting and more, settled instantly without queues or extra apps.',
    },
    betting: {
      headlineOrange: 'Fund ',
      headlineWhite: 'your wallet fast',
      body: 'Add money to your Bet9ja, SportyBet or 1xBet account in seconds, with no bank trips or delays. Your payment is encrypted and credited straight to your betting wallet. Please bet responsibly and only stake what you can afford to lose.',
      image: '/images/bills_hero.png',
      cardTitle: 'Pay any bill, anytime',
      cardSubtitle: 'Electricity, TV, betting and more, settled instantly without queues or extra apps.',
    },
  }[activeSlug] || {
    headlineOrange: `${activeSlug.replace('-', ' ').toUpperCase()}, `,
    headlineWhite: 'instantly',
    body: 'Fulfill digital transactions instantly and securely across top providers in Nigeria.',
    image: '/images/airtime_hero_2x.png',
    cardTitle: 'Pay instantly',
    cardSubtitle: 'Safe and encrypted digital payments on Hatiso.',
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
    <div className="relative min-h-screen bg-[#1B3C4A] text-white selection:bg-[#E95312] selection:text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
        <svg
          className="absolute -top-40 -left-40 h-[1200px] w-[1400px]"
          viewBox="0 0 1000 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -100 200 C 150 150, 250 400, 500 320 C 750 240, 850 480, 1100 420"
            stroke="#1E4757"
            strokeWidth="1.6"
            strokeDasharray="6 8"
          />
          <path
            d="M -100 350 C 180 300, 320 550, 600 480 C 880 410, 920 620, 1150 580"
            stroke="#1E4757"
            strokeWidth="1.6"
          />
          <path
            d="M -50 500 C 220 460, 380 680, 700 620 C 1020 560, 980 750, 1200 700"
            stroke="#1E4757"
            strokeWidth="1.4"
          />
        </svg>
      </div>

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

      <main className="relative z-10 mx-auto max-w-7xl px-4 xl:px-0 pt-4 pb-24">
        <section
          className={`mt-4 mb-12 sm:mb-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14 w-full transition-all duration-300 ease-out ${isFading ? 'opacity-30 scale-[0.99] blur-[0.4px]' : 'opacity-100 scale-100 blur-0'
            }`}
        >
          <div className="flex flex-col lg:col-span-6 xl:col-span-7 min-h-[220px] sm:min-h-[250px] justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl transition-all duration-300">
              <span className="text-[#FF6500]">{heroContent.headlineOrange}</span>
              <span className="text-white">{heroContent.headlineWhite}</span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base min-h-[72px]">
              {heroContent.body}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-[#1E3A46]/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E95312]/20 text-[#E95312]">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                </div>
                <span className="text-xs font-medium text-slate-200 sm:text-sm">
                  Instant delivery, usually under few seconds
                </span>
              </div>

              <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-[#1E3A46]/70 px-4 py-2.5 shadow-sm backdrop-blur-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E95312]/20 text-[#E95312]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-medium text-slate-200 sm:text-sm">
                  Bank-grade encryption on every payment
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-6 xl:col-span-5">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/60 bg-[#25414C] p-3.5 shadow-2xl transition-all duration-300 hover:border-slate-600 sm:p-4">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-900 shadow-inner">
                <Image
                  src={heroContent.image}
                  alt={heroContent.cardTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  priority
                  className="object-cover object-center transition-opacity duration-300"
                />
              </div>

              <div className="mt-3.5 flex items-center justify-between px-1.5 py-1">
                <div>
                  <h3 className="text-sm font-bold text-white sm:text-base">
                    {heroContent.cardTitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-300">{heroContent.cardSubtitle}</p>
                </div>

                <div className="flex items-end gap-1 pl-3">
                  <span className="h-5 w-1.5 rounded-full bg-[#E95312]" />
                  <span className="h-3.5 w-1.5 rounded-full bg-[#64748B]" />
                  <span className="h-2 w-1.5 rounded-full bg-[#475569]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServiceTabsSelector activeSlug={activeSlug} onSelectService={handleServiceClick} />

        <section className="my-10 flex justify-center">
          {isConfirmModalOpen && pendingPayment ? (
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
          ) : (
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
            />
          )}
        </section>
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
    </div>
  );
}
