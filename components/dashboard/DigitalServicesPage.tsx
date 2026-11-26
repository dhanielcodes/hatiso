'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Check,
  ChevronRight,
  History,
  GraduationCap,
  Landmark,
  Lock,
  Search,
  ShieldCheck,
  Smartphone,
  Tv,
  Signal,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/authStore';
import { getStoredUserEmail } from '@/lib/auth/session';
import { ProviderLogo, providerLogoSrc } from '@/components/services/ProviderSelector';
import { PAY_METHODS, type PayMethod } from '@/components/services/PayFlowDialogs';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import StateBlock from '@/components/ui/StateBlock';
import ServicePaymentForm, { type PendingPayment } from '@/components/services/ServicePaymentForm';
import type { PaystackCheckoutRequest } from '@/components/services/PaystackCheckout';
import type { DigitalServiceOrder, GuestPaymentQuote } from '@/lib/api/digitalServices';
import { CATEGORY_BY_SLUG, SINGLE_PRODUCT_SERVICES, billersForService, servicesForCategory } from '@/lib/digitalServices/categoryServices';
import {
  useCreateDigitalServiceOrder,
  useCreatePayment,
  useCreatePaymentQuote,
  useAllDigitalServiceCatalogues,
  useDigitalServiceCatalogues,
  useDigitalServiceCategories,
  useVerifyPayment,
} from '@/lib/queries/useDigitalServices';

const PaystackCheckout = dynamic(
  () => import('@/components/services/PaystackCheckout'),
  { ssr: false }
);

type ModalStep = 'service' | 'details' | 'review' | 'success';
type PreparedPayment = PendingPayment & {
  order: DigitalServiceOrder;
  quote: GuestPaymentQuote;
};

/**
 * Card details per service slug. Which services exist comes from the categories endpoint via
 * lib/digitalServices/categoryServices.ts: TELCO gives two cards (Airtime, Data), each with only its own products.
 */
const serviceConfig: Record<string, {
  description: string;
  Icon: typeof Smartphone;
  tone: string;
  badge?: string;
}> = {
  airtime: { description: 'MTN, Glo, Airtel, 9mobile', Icon: Smartphone, tone: 'bg-tone-44 text-tone-744', badge: 'Popular' },
  data: { description: 'Daily, weekly and monthly bundles', Icon: Signal, tone: 'bg-tone-44 text-tone-744', badge: 'Popular' },
  'internet-services': { description: 'Smile, Spectranet and more', Icon: Wifi, tone: 'bg-tone-44 text-tone-744' },
  electricity: { description: 'Prepaid and Postpaid', Icon: Zap, tone: 'bg-tone-44 text-tone-744', badge: '2% Cashback' },
  tv: { description: 'DStv, GOtv, StarTimes', Icon: Tv, tone: 'bg-tone-44 text-tone-744' },
  education: { description: 'Exam pins and school fees', Icon: GraduationCap, tone: 'bg-tone-44 text-tone-744' },
  insurance: { description: 'Renew trusted policies', Icon: ShieldCheck, tone: 'bg-tone-44 text-tone-744' },
  'other-services': { description: 'Pay verified providers', Icon: Landmark, tone: 'bg-tone-44 text-tone-744' },
};

function formatNaira(amountMinor: number) {
  return `₦${(amountMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

/** QuickPay board step bars: "1 · Service", "2 · Details", "3 · Review". */
function StepIndicator({ step }: { step: ModalStep }) {
  const activeIndex = step === 'service' ? 0 : step === 'details' ? 1 : 2;
  return (
    <ol aria-label="Steps" className="grid grid-cols-3 gap-2 px-[22px] pt-4">
      {['Service', 'Details', 'Review'].map((label, index) => (
        <li key={label} aria-current={index === activeIndex ? 'step' : undefined} className="flex flex-col gap-1.5">
          <span className={`h-1 rounded-full transition-colors duration-300 ${index <= activeIndex ? 'bg-brand-305' : 'bg-tone-100'}`} />
          <span className={`text-xs font-medium ${index <= activeIndex ? 'text-tone-744' : 'text-tone-414'}`}>
            {index + 1} · {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ModalShell({ children, onClose, canClose, title }: { children: React.ReactNode; onClose: () => void; canClose: boolean; title: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 p-4 backdrop-blur-sm"
      onClick={(e) => canClose && e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="qp-title" className="hz-pop max-h-[calc(100dvh-2rem)] w-full max-w-[520px] overflow-y-auto overscroll-contain rounded-[14px] bg-surface text-tone-744 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-tone-44 px-[22px] py-[18px]">
          <h2 id="qp-title" className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} disabled={!canClose} aria-label="Close" className="hz-press flex h-10 w-10 items-center justify-center rounded-lg bg-tone-44 text-tone-744 hover:bg-tone-100 disabled:cursor-not-allowed disabled:opacity-40">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function DigitalServicesPage() {
  const { user } = useAuthStore();
  const { data: categories, isLoading: categoriesLoading } = useDigitalServiceCategories();
  const [query, setQuery] = useState('');
  // DashServices board chips: "all" lists every service; a service slug lists its providers.
  const [chip, setChip] = useState<string>('all');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedBillerCode, setSelectedBillerCode] = useState<string | undefined>();
  const [step, setStep] = useState<ModalStep>('service');
  const [payment, setPayment] = useState<PreparedPayment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [formResetKey, setFormResetKey] = useState(0);
  const [paymentRequest, setPaymentRequest] = useState<PaystackCheckoutRequest | null>(null);
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';
  const receiptEmail = user?.email || getStoredUserEmail();
  const listSlug = selectedSlug ?? (chip !== 'all' ? chip : null);
  const activeCategory = (listSlug && CATEGORY_BY_SLUG[listSlug]) || 'TELCO';
  const { data: categoryBillers, isLoading: billersLoading, isError: billersError, refetch: refetchBillers } = useDigitalServiceCatalogues(activeCategory);
  // Airtime and Data share the TELCO catalogue; keep only the selected service's products
  const billers = useMemo(
    () => (categoryBillers && listSlug ? billersForService(listSlug, categoryBillers) : categoryBillers),
    [categoryBillers, listSlug]
  );

  const createOrderMutation = useCreateDigitalServiceOrder(true);
  const quoteMutation = useCreatePaymentQuote(true);
  const createPaymentMutation = useCreatePayment(true);
  const verifyPaymentMutation = useVerifyPayment(true);

  const services = useMemo(() => (categories ?? []).flatMap(servicesForCategory).flatMap((service) => {
    const config = serviceConfig[service.slug];
    return config ? [{ ...service, name: service.label, ...config }] : [];
  }), [categories]);

  // "All" lists every provider of every service, like the DashServices board.
  const serviceCategories = useMemo(() => [...new Set(services.map((service) => service.category))], [services]);
  const { data: allCatalogues, isLoading: allLoading, isError: allError, refetch: refetchAll } = useAllDigitalServiceCatalogues(serviceCategories);
  const allProviders = services.flatMap((service) => {
    const billersOfCategory = allCatalogues?.[service.category];
    return billersOfCategory ? billersForService(service.slug, billersOfCategory).map((biller) => ({ biller, service })) : [];
  });

  const q = query.trim().toLowerCase();
  const visibleProviders = allProviders.filter(({ biller, service }) => `${biller.billerName} ${service.name}`.toLowerCase().includes(q));
  const chipService = chip !== 'all' ? services.find((service) => service.slug === chip) : undefined;
  const visibleBillers = (chipService ? billers ?? [] : []).filter((biller) => biller.billerName.toLowerCase().includes(q));

  const resetFlow = () => {
    setSelectedSlug(null);
    setSelectedBillerCode(undefined);
    setStep('service');
    setPayment(null);
    setIsProcessing(false);
    setPaymentRequest(null);
    setFormResetKey((key) => key + 1);
  };

  // "/dashboard/services?service=airtime" (from the overview's Pay again) opens that service straight away.
  const searchParams = useSearchParams();
  const linkedSlug = searchParams.get('service');
  const [handledLink, setHandledLink] = useState<string | null>(null);
  if (linkedSlug && linkedSlug !== handledLink) {
    setHandledLink(linkedSlug);
    setSelectedSlug(linkedSlug);
    setSelectedBillerCode(undefined);
    setStep('service');
  }

  const openService = (slug: string) => {
    setSelectedSlug(slug);
    setSelectedBillerCode(undefined);
    setPayment(null);
    setStep('service');
  };

  const handleDetailsSubmit = async (pendingPayment: PendingPayment) => {
    if (!pendingPayment.email) {
      toast.error('Enter an email address to receive your payment receipt.');
      return;
    }

    const fields = pendingPayment.values.fields;
    const order = await createOrderMutation.mutateAsync({
      productCode: pendingPayment.productCode,
      recipient: pendingPayment.recipientNumber,
      fields: fields && typeof fields === 'object' && !Array.isArray(fields) ? fields as Record<string, unknown> : {},
      amountMinor: pendingPayment.amountMinor,
      contactPhone: String(pendingPayment.values.contactPhone ?? pendingPayment.recipientNumber),
      email: pendingPayment.email,
    });
    const quote = await quoteMutation.mutateAsync({
      orderRef: order.reference,
      email: pendingPayment.email,
      guestToken: order.guestToken,
    });
    setPayment({ ...pendingPayment, order, quote });
    setStep('review');
  };

  const handlePay = async () => {
    if (!payment) return;
    if (!paystackPublicKey) {
      toast.error('Paystack is not configured. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to your environment.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await createPaymentMutation.mutateAsync({
        orderRef: payment.order.reference,
        expectedTotalMinor: payment.quote.totalMinor,
        guestToken: payment.order.guestToken,
      });
      setPaymentRequest({
        email: payment.email,
        totalMinor: response.totalMinor,
        txnRef: response.txnRef,
        currency: response.currency,
        orderRef: response.orderRef,
        guestToken: payment.order.guestToken,
        channels: PAY_METHODS.find((m) => m.id === payMethod)?.channels,
      });
    } catch {
      setIsProcessing(false);
    }
  };

  const selectedService = selectedSlug ? services.find((service) => service.slug === selectedSlug) : undefined;
  const selectedBiller = (billers ?? []).find((biller) => biller.billerCode === selectedBillerCode) ?? billers?.[0];

  return (
    <div className="min-h-full bg-tone-44">
      <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
        <div className="hz-rise flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em] text-tone-744">Pay bills</h1>
            <span className="text-[15px] text-tone-414">Pick a service. Your saved numbers are filled in for you.</span>
          </div>
          <Link href="/dashboard/transactions" className="hz-press inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414">
            <History className="h-4 w-4" aria-hidden="true" />
            History
          </Link>
        </div>

        <label className="hz-rise flex min-h-12 items-center gap-2.5 rounded-[10px] border border-tone-100 bg-surface px-3.5 transition-colors focus-within:border-brand-305" style={{ '--d': 1 } as React.CSSProperties}>
          <Search className="h-4.5 w-4.5 shrink-0 text-tone-414" aria-hidden="true" />
          <span className="sr-only">Search services</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={chipService ? `Search ${chipService.name.toLowerCase()} providers` : 'Search for a provider, like DStv or Ikeja Electric'}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-tone-744 placeholder:text-tone-414 focus:outline-none"
          />
        </label>

        <div role="radiogroup" aria-label="Category" className="hz-rise flex flex-wrap gap-2" style={{ '--d': 2 } as React.CSSProperties}>
          {[{ slug: 'all', name: 'All' }, ...services].map((option) => {
            const on = chip === option.slug;
            return (
              <button
                key={option.slug}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setChip(option.slug)}
                className={`hz-press min-h-[38px] rounded-lg border px-3.5 text-sm font-medium transition-colors ${on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface text-tone-744 hover:border-tone-414'}`}
              >
                {option.name}
              </button>
            );
          })}
        </div>

        <section className="hz-rise flex flex-col gap-3.5" style={{ '--d': 3 } as React.CSSProperties}>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-tone-744">{chipService ? chipService.name : 'All services'}</h2>
            <span className="text-sm text-tone-414">
              {chipService ? (billersLoading ? 'Loading…' : `${visibleBillers.length} ${visibleBillers.length === 1 ? 'provider' : 'providers'}`) : allLoading ? 'Loading…' : `${visibleProviders.length} ${visibleProviders.length === 1 ? 'provider' : 'providers'}`}
            </span>
          </div>
          <div className="hz-stagger grid grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] gap-3">
            {(categoriesLoading || (chipService ? billersLoading : allLoading)) &&
              Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-[134px] rounded-[14px]" />)}
            {!chipService && !allLoading &&
              visibleProviders.map(({ biller, service }) => {
                const Icon = service.Icon;
                return (
                  <button
                    key={`${service.slug}-${biller.billerCode}`}
                    type="button"
                    onClick={() => {
                      setSelectedSlug(service.slug);
                      setSelectedBillerCode(biller.billerCode);
                      setPayment(null);
                      setStep('details');
                    }}
                    className="hz-lift group flex flex-col gap-[18px] rounded-[14px] border border-tone-100 bg-surface p-[18px] text-left text-tone-744"
                  >
                    <span className="flex items-start justify-between">
                      <span className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[10px] text-[13px] font-bold ${providerLogoSrc(biller) ? 'border border-tone-100 bg-white text-carbon' : 'bg-brand-305 text-on-brand'}`}>
                        <ProviderLogo name={biller.billerName} src={providerLogoSrc(biller)} />
                      </span>
                      <ChevronRight className="hz-arrow h-4 w-4 text-tone-414" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-base font-semibold">{biller.billerName}</span>
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-tone-414"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{service.name}</span>
                    </span>
                  </button>
                );
              })}
            {chipService && !billersLoading &&
              visibleBillers.map((biller) => {
                const Icon = chipService.Icon;
                return (
                  <button
                    key={biller.billerCode}
                    type="button"
                    onClick={() => {
                      setSelectedSlug(chipService.slug);
                      setSelectedBillerCode(biller.billerCode);
                      setPayment(null);
                      setStep('details');
                    }}
                    className="hz-lift group flex flex-col gap-[18px] rounded-[14px] border border-tone-100 bg-surface p-[18px] text-left text-tone-744"
                  >
                    <span className="flex items-start justify-between">
                      <span className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[10px] text-[13px] font-bold ${providerLogoSrc(biller) ? 'border border-tone-100 bg-white text-carbon' : 'bg-brand-305 text-on-brand'}`}>
                        <ProviderLogo name={biller.billerName} src={providerLogoSrc(biller)} />
                      </span>
                      <ChevronRight className="hz-arrow h-4 w-4 text-tone-414" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col gap-1">
                      <span className="text-base font-semibold">{biller.billerName}</span>
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-tone-414"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{chipService.name}</span>
                    </span>
                  </button>
                );
              })}
            {(chipService ? !billersLoading && billersError : !allLoading && allError) && (
              <div className="col-span-full rounded-[14px] border border-tone-100 bg-surface">
                <StateBlock tone="error" title="Providers are unavailable right now" action={{ label: 'Try again', onClick: () => (chipService ? refetchBillers() : refetchAll()) }}>
                  Check your connection and try again. Your money hasn&apos;t moved.
                </StateBlock>
              </div>
            )}
            {!categoriesLoading && ((chipService && !billersLoading && !billersError && !visibleBillers.length) || (!chipService && !allLoading && !allError && !visibleProviders.length)) && (
              <p className="col-span-full rounded-[14px] border border-dashed border-tone-100 bg-surface p-8 text-center text-sm text-tone-414">{query ? <>Nothing matches “{query}”.</> : "No providers are available right now."}</p>
            )}
          </div>
        </section>
      </div>

      {selectedSlug && selectedService && (
        <ModalShell onClose={resetFlow} canClose={!isProcessing} title={step === 'success' ? 'Payment complete' : `Buy ${selectedService.name.toLowerCase()}`}>
          {step !== 'success' && <StepIndicator step={step} />}

          {step === 'service' && (
            <div className="hz-pop flex flex-col gap-[18px] px-[22px] pt-5 pb-[22px]">
              <span className="text-sm font-medium">What would you like to pay for?</span>
              <div className="grid grid-cols-4 gap-2">
                {services.map((service) => {
                  const on = service.slug === selectedSlug;
                  const Icon = service.Icon;
                  return (
                    <button
                      key={service.slug}
                      type="button"
                      aria-pressed={on}
                      onClick={() => openService(service.slug)}
                      className={`hz-press flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-[10px] border px-1 text-center text-[13px] font-medium transition-colors ${
                        on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface text-tone-744 hover:border-tone-414'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span className="line-clamp-1">{service.name}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-sm font-medium">Choose the provider you want to pay</span>
              {billersLoading ? (
                <SkeletonGroup label="Loading providers" className="flex flex-col gap-2">
                  {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-[60px] rounded-[10px]" />)}
                </SkeletonGroup>
              ) : billersError || !billers?.length ? (
                <p className="rounded-[10px] bg-status-error/8 p-4 text-sm text-status-error">Providers are unavailable right now. Please try again.</p>
              ) : (
                <div className="overflow-hidden rounded-[10px] border border-tone-100">
                  {billers.map((biller) => (
                    <button
                      key={biller.billerCode}
                      type="button"
                      onClick={() => {
                        setSelectedBillerCode(biller.billerCode);
                        setStep('details');
                      }}
                      className="group flex w-full items-center gap-3 border-b border-tone-44 bg-surface px-3.5 py-3 text-left last:border-b-0 hover:bg-tone-44"
                    >
                      <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[11px] font-bold ${providerLogoSrc(biller) ? 'border border-tone-100 bg-white text-carbon' : 'bg-brand-305 text-on-brand'}`}><ProviderLogo name={biller.billerName} src={providerLogoSrc(biller)} sizes="36px" /></span>
                      <span className="flex-1 text-[15px] font-medium">{biller.billerName}</span>
                      <ChevronRight className="h-4 w-4 text-tone-414 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'details' && selectedBiller && (
            <div className="hz-pop flex flex-col gap-2 px-[22px] pt-5 pb-[22px]">
              <div className="flex items-center gap-3 rounded-[10px] bg-tone-44 px-3.5 py-3">
                <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[11px] font-bold ${providerLogoSrc(selectedBiller) ? 'border border-tone-100 bg-white text-carbon' : 'bg-brand-305 text-on-brand'}`}><ProviderLogo name={selectedBiller.billerName} src={providerLogoSrc(selectedBiller)} sizes="36px" /></span>
                <span className="flex flex-1 flex-col">
                  <span className="text-[15px] font-medium">{selectedBiller.billerName}</span>
                  <span className="text-[13px] text-tone-414">{selectedService.name}</span>
                </span>
                <button type="button" onClick={() => setStep('service')} className="border-b border-tone-744 text-sm font-medium">Change provider</button>
              </div>
              <ServicePaymentForm key={`${selectedSlug}-${selectedBiller.billerCode}-${receiptEmail}-${formResetKey}`} activeSlug={selectedService.slug} billers={billers ?? []} isLoading={billersLoading} isError={billersError} initialBillerCode={selectedBiller.billerCode} initialEmail={receiptEmail} variant="dashboard" hideProductSelector={SINGLE_PRODUCT_SERVICES.has(selectedService.slug)} hideBillerSelector onValidated={handleDetailsSubmit} formResetKey={formResetKey} />
            </div>
          )}

          {step === 'review' && payment && (
            <div className="hz-pop flex flex-col gap-5 px-[22px] pt-5 pb-[22px]">
              <dl className="flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-tone-414">Payment</dt><dd className="text-right font-medium">{selectedService.name} · {payment.providerName}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-tone-414">To</dt><dd className="font-medium tabular-nums">{payment.recipientNumber}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-tone-414">Amount</dt><dd className="font-medium tabular-nums">{formatNaira(payment.quote.amountMinor)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-tone-414">Charges</dt><dd className="font-medium tabular-nums">{formatNaira(payment.quote.feeMinor)}</dd></div>
                <div className="flex justify-between gap-4 border-t border-dashed border-tone-100 pt-2.5"><dt className="font-semibold">You pay</dt><dd className="font-semibold tabular-nums">{formatNaira(payment.quote.totalMinor)}</dd></div>
              </dl>
              <fieldset className="flex flex-col gap-2" role="radiogroup">
                <legend className="mb-2 text-sm font-medium">Pay with</legend>
                {PAY_METHODS.map((m) => {
                  const on = m.id === payMethod;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setPayMethod(m.id)}
                      className={`flex min-h-14 items-center gap-3 rounded-[10px] bg-surface px-3.5 text-left ${on ? 'border-2 border-brand-305 px-[13px]' : 'border border-tone-100 hover:border-tone-414'}`}
                    >
                      <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-brand-305' : 'border-tone-414'}`}>
                        <span className={`h-2 w-2 rounded-full ${on ? 'bg-brand-305' : 'bg-transparent'}`} />
                      </span>
                      <span className="flex flex-1 flex-col gap-0.5">
                        <span className="text-[15px] font-medium">{m.label}</span>
                        <span className="text-[13px] text-tone-414">{m.note}</span>
                      </span>
                    </button>
                  );
                })}
              </fieldset>
              <div className="grid grid-cols-[1fr_2fr] gap-2.5">
                <button type="button" onClick={() => setStep('details')} disabled={isProcessing} className="hz-press min-h-12 rounded-[10px] border border-tone-100 text-sm font-medium hover:border-tone-414 disabled:opacity-50">Back</button>
                <button type="button" onClick={handlePay} disabled={isProcessing} aria-busy={isProcessing} className="hz-press flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-brand-305 text-sm font-medium text-on-brand hover:bg-brand-361 disabled:cursor-not-allowed disabled:opacity-60">
                  {isProcessing ? (
                    <><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-on-brand border-t-transparent" />Preparing your payment</>
                  ) : (
                    <><Lock className="h-4 w-4" aria-hidden="true" />Pay {formatNaira(payment.quote.totalMinor)}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && payment && (
            <div className="hz-stagger flex flex-col items-center gap-3 px-[22px] pt-8 pb-[22px] text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-status-success text-white">
                <Check className="h-6 w-6" strokeWidth={2.6} aria-hidden="true" />
              </span>
              <span className="text-[13px] font-medium text-status-success">Payment successful</span>
              <span className="text-4xl font-semibold tracking-[-0.02em] tabular-nums">{formatNaira(payment.quote.totalMinor)}</span>
              <span className="text-sm text-tone-414">{selectedService.name} · {payment.providerName}</span>
              <div className="mt-3 grid w-full grid-cols-2 gap-2.5">
                <button type="button" onClick={resetFlow} className="hz-press min-h-12 rounded-[10px] border border-tone-100 text-sm font-medium hover:border-tone-414">Make another payment</button>
                <Link href="/dashboard/transactions" className="hz-press inline-flex min-h-12 items-center justify-center rounded-[10px] bg-brand-305 text-sm font-medium text-on-brand hover:bg-brand-361">View receipt</Link>
              </div>
            </div>
          )}
        </ModalShell>
      )}

      <PaystackCheckout request={paymentRequest} publicKey={paystackPublicKey} onSuccess={async (response) => {
        if (!payment) return;
        setIsProcessing(true);
        try {
          const verification = await verifyPaymentMutation.mutateAsync({ txnRef: response?.reference ?? response?.trxref ?? payment.order.paymentReference ?? '', guestToken: payment.order.guestToken });
          if (verification.status !== 'SUCCESSFUL') throw new Error('Your payment is still being confirmed.');
          setPaymentRequest(null);
          setIsProcessing(false);
          setStep('success');
        } catch {
          setPaymentRequest(null);
          setIsProcessing(false);
        }
      }} onClose={resetFlow} />
    </div>
  );
}
