'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Gift,
  GraduationCap,
  Landmark,
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
import ProviderSelector from '@/components/services/ProviderSelector';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import ServicePaymentForm, { type PendingPayment } from '@/components/services/ServicePaymentForm';
import type { PaystackCheckoutRequest } from '@/components/services/PaystackCheckout';
import type { DigitalServiceOrder, GuestPaymentQuote } from '@/lib/api/digitalServices';
import { CATEGORY_BY_SLUG, SINGLE_PRODUCT_SERVICES, billersForService, servicesForCategory } from '@/lib/marketing/serviceCategories';
import {
  useCreateDigitalServiceOrder,
  useCreatePayment,
  useCreatePaymentQuote,
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
 * lib/marketing/serviceCategories.ts: TELCO gives two cards (Airtime, Data), each with only its own products.
 */
const serviceConfig: Record<string, {
  name: string;
  description: string;
  Icon: typeof Smartphone;
  tone: string;
  badge?: string;
}> = {
  airtime: { name: 'Airtime', description: 'MTN, Glo, Airtel, 9mobile', Icon: Smartphone, tone: 'bg-[#FDE5D5] text-[#C2531C]', badge: 'Popular' },
  data: { name: 'Data', description: 'Daily, weekly and monthly bundles', Icon: Signal, tone: 'bg-[#FFF3E8] text-[#C2531C]', badge: 'Popular' },
  'internet-services': { name: 'Internet Services', description: 'Smile, Spectranet and more', Icon: Wifi, tone: 'bg-[#E1F2F8] text-[#277A9F]' },
  electricity: { name: 'Electricity', description: 'Prepaid and Postpaid', Icon: Zap, tone: 'bg-[#FFF2CF] text-[#C98200]', badge: '2% Cashback' },
  tv: { name: 'Cable TV', description: 'DStv, GOtv, StarTimes', Icon: Tv, tone: 'bg-[#EEE7FA] text-[#7656AE]' },
  education: { name: 'Education', description: 'Exam pins and school fees', Icon: GraduationCap, tone: 'bg-[#FBE7F7] text-[#D035A5]' },
  insurance: { name: 'Insurance', description: 'Renew trusted policies', Icon: ShieldCheck, tone: 'bg-[#FBF9E6] text-[#B5A200]' },
  'other-services': { name: 'Other Services', description: 'Pay verified providers', Icon: Landmark, tone: 'bg-[#EEF1F3] text-[#66808D]' },
};

function formatNaira(amountMinor: number) {
  return `₦${(amountMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function StepIndicator({ step }: { step: ModalStep }) {
  const activeIndex = step === 'service' ? 0 : step === 'details' ? 1 : 2;
  const label = activeIndex === 0 ? 'Step 1 · Service' : activeIndex === 1 ? 'Step 2 · Details' : 'Step 3 · Review';

  return (
    <div className="border-y border-[#F1EAE7] bg-[#FFF8F5] px-6 py-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex gap-3">
        {[0, 1, 2].map((index) => (
          <span key={index} className={`h-1.5 w-[74px] rounded-full ${index <= activeIndex ? 'bg-[#F49A66]' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}

function ModalShell({ children, onClose, canClose, title }: { children: React.ReactNode; onClose: () => void; canClose: boolean; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102A36]/45 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl">
        <div className="flex items-start justify-between px-6 pb-5 pt-6 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C2531C]">Quick payment</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
          </div>
          <button type="button" onClick={onClose} disabled={!canClose} aria-label="Close payment flow" className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">
            <X className="h-5 w-5" />
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
  const [filter, setFilter] = useState('All');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedBillerCode, setSelectedBillerCode] = useState<string | undefined>();
  const [step, setStep] = useState<ModalStep>('service');
  const [payment, setPayment] = useState<PreparedPayment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [paymentRequest, setPaymentRequest] = useState<PaystackCheckoutRequest | null>(null);
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';
  const receiptEmail = user?.email || getStoredUserEmail();
  const activeCategory = (selectedSlug && CATEGORY_BY_SLUG[selectedSlug]) || 'TELCO';
  const { data: categoryBillers, isLoading: billersLoading, isError: billersError } = useDigitalServiceCatalogues(activeCategory);
  // Airtime and Data share the TELCO catalogue; keep only the selected service's products
  const billers = useMemo(
    () => (categoryBillers && selectedSlug ? billersForService(selectedSlug, categoryBillers) : categoryBillers),
    [categoryBillers, selectedSlug]
  );

  const createOrderMutation = useCreateDigitalServiceOrder(true);
  const quoteMutation = useCreatePaymentQuote(true);
  const createPaymentMutation = useCreatePayment(true);
  const verifyPaymentMutation = useVerifyPayment(true);

  const services = useMemo(() => (categories ?? []).flatMap(servicesForCategory).flatMap((service) => {
    const config = serviceConfig[service.slug];
    return config ? [{ ...service, ...config }] : [];
  }), [categories]);

  const visibleServices = services.filter((service) => {
    const matchesQuery = `${service.name} ${service.description}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'All' || (filter === 'Popular' && service.badge === 'Popular') || (filter === 'Cashback' && service.badge?.includes('Cashback'));
    return matchesQuery && matchesFilter;
  });

  const resetFlow = () => {
    setSelectedSlug(null);
    setSelectedBillerCode(undefined);
    setStep('service');
    setPayment(null);
    setIsProcessing(false);
    setPaymentRequest(null);
    setFormResetKey((key) => key + 1);
  };

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
      });
    } catch {
      setIsProcessing(false);
    }
  };

  const selectedService = selectedSlug ? services.find((service) => service.slug === selectedSlug) : undefined;
  const selectedBiller = (billers ?? []).find((biller) => biller.billerCode === selectedBillerCode) ?? billers?.[0];

  return (
    <div className="min-h-full bg-[#F3F4F5]">
      <section className="border-b border-[#E3E8EB] px-5 py-7 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#C2531C]">Digital services</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#10202A] sm:text-3xl">Everything you need, <span className="text-[#C2531C]">paid in one place.</span></h2>
        <p className="mt-2 text-sm text-[#4A5B64] sm:text-base">Choose a service, enter the details, and pay securely through our payment partner.</p>
      </section>

      <section className="px-5 py-9 sm:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Search services</span>
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services or provider" className="h-15 w-full rounded-3xl border border-[#E3E8EB] bg-white pl-14 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#EE6E2D] focus:ring-4 focus:ring-[#EE6E2D]/10" />
          </label>
          <div className="flex gap-2 border-l-0 pl-0 xl:border-l xl:border-[#E3E8EB] xl:pl-4">
            {['All', 'Popular', 'Cashback'].map((option) => <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-full px-5 py-3 text-sm font-medium transition active:scale-[0.98] ${filter === option ? 'bg-[#10202A] text-white' : 'border border-[#E3E8EB] bg-white text-slate-700 hover:border-[#10202A]/30'}`}>{option}</button>)}
          </div>
        </div>

        <h3 className="mt-10 text-lg font-medium text-[#4A5B64]">What would you like to do?</h3>
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categoriesLoading && Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-30 rounded-xl" />)}
          {visibleServices.map((service) => {
            const Icon = service.Icon;
            return <button key={service.slug} type="button" onClick={() => openService(service.slug)} className="group flex min-h-30 items-center gap-4 rounded-3xl border border-[#E3E8EB] bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#EE6E2D]/35 hover:shadow-lg hover:shadow-[#10202A]/5 active:scale-[0.99]">
              <span className={`flex h-17 w-17 shrink-0 items-center justify-center rounded-xl ${service.tone}`}><Icon className="h-7 w-7" /></span>
              <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="text-lg font-semibold text-[#233C49]">{service.name}</span>{service.badge && <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${service.badge.includes('Cashback') ? 'bg-[#E7F6EB] text-[#008A46]' : 'bg-[#ECF1F3] text-[#10202A]'}`}>{service.badge}</span>}</span><span className="mt-2 block truncate text-sm text-[#777E8E]">{service.description}</span></span>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
            </button>;
          })}
        </div>

        <div className="mt-20 flex min-h-40 items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF3E8] to-[#FFE2CC] p-5 sm:p-7">
          <div><span className="rounded-full bg-white/50 px-3 py-1.5 text-xs font-semibold text-[#C2531C]">THIS WEEK</span><h3 className="mt-6 text-xl font-semibold text-[#10202A]">Get 5× points on every data bundle</h3><p className="mt-2 text-sm text-[#8F7975]">More data, more rewards. Ends Sunday.</p></div>
          <Gift className="mr-5 hidden h-28 w-28 rotate-[-12deg] text-[#FFB12B] sm:block" strokeWidth={1.4} />
        </div>
      </section>

      {selectedSlug && selectedService && <ModalShell onClose={resetFlow} canClose={!isProcessing} title={step === 'success' ? 'Payment complete' : `Buy ${selectedService.name}`}>
        {step !== 'success' && <StepIndicator step={step} />}

        {step === 'service' && <div className="space-y-6 px-6 py-8 sm:px-8"><div><h3 className="text-lg font-medium text-[#233C49]">Select biller</h3><p className="mt-1 text-sm text-slate-500">Choose the provider you want to pay.</p></div>{billersLoading ? <SkeletonGroup label="Loading providers" className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-20 rounded-xl" />)}</SkeletonGroup> : billersError || !billers?.length ? <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600">Providers are unavailable right now. Please try again.</p> : <ProviderSelector type='image' providers={billers.map((biller) => ({ id: biller.billerCode, name: biller.billerName, imageSrc: biller.logoUrl }))} selectedId={selectedBiller?.billerCode ?? ''} onSelect={(id) => setSelectedBillerCode(id)} />}</div>}

        {step === 'details' && <div className="px-6 py-2 sm:px-8"><button type="button" onClick={() => setStep('service')} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-[#10202A]"><ArrowLeft className="h-4 w-4" />Change provider</button><ServicePaymentForm key={`${selectedSlug}-${selectedBiller?.billerCode}-${receiptEmail}-${formResetKey}`} activeSlug={selectedService.slug} billers={billers ?? []} isLoading={billersLoading} isError={billersError} initialBillerCode={selectedBiller?.billerCode} initialEmail={receiptEmail} variant="dashboard" hideProductSelector={SINGLE_PRODUCT_SERVICES.has(selectedService.slug)} hideBillerSelector onValidated={handleDetailsSubmit} formResetKey={formResetKey} /></div>}

        {step === 'review' && payment && <div className="px-6 py-8 sm:px-8"><div className="rounded-2xl bg-[#EAF7FC] p-5"><p className="text-sm text-slate-500">Sending {selectedService.name.toLowerCase()} to</p><div className="mt-1 flex items-end justify-between gap-4"><p className="text-2xl font-semibold">{payment.recipientNumber}</p><p className="text-xl font-bold text-[#10202A]">- {formatNaira(payment.quote.totalMinor)}</p></div><p className="mt-2 text-sm font-medium text-[#10202A]">{payment.providerName}</p></div><h3 className="mt-8 text-xl font-semibold text-[#3D414A]">Transaction details</h3><dl className="mt-4 divide-y divide-slate-100 text-sm"><div className="flex justify-between gap-5 py-4"><dt className="text-slate-500">Transfer to</dt><dd className="font-semibold">{payment.recipientNumber}</dd></div><div className="flex justify-between gap-5 py-4"><dt className="text-slate-500">Transaction type</dt><dd className="font-semibold">{selectedService.name}</dd></div><div className="flex justify-between gap-5 py-4"><dt className="text-slate-500">Amount to send</dt><dd className="font-semibold">{formatNaira(payment.quote.amountMinor)}</dd></div><div className="flex justify-between gap-5 py-4"><dt className="text-slate-500">Charges fee</dt><dd className="font-semibold">{formatNaira(payment.quote.feeMinor)}</dd></div></dl></div>}

        {step === 'success' && payment && <div className="px-6 py-12 text-center sm:px-8"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F6EB] text-[#008A46]"><CheckCircle2 className="h-9 w-9" /></div><h2 className="mt-5 text-2xl font-semibold">Payment successful</h2><p className="mt-2 text-sm text-slate-500">Your {selectedService.name.toLowerCase()} payment of {formatNaira(payment.quote.totalMinor)} is being delivered.</p><button type="button" onClick={resetFlow} className="mt-8 w-full rounded-xl bg-[#EE6E2D] py-3.5 text-sm font-semibold text-white transition hover:bg-[#EE6E2D] active:scale-[0.98]">Make another payment</button></div>}

        {step !== 'success' && <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-5 sm:px-8">{step === 'service' ? <button type="button" disabled={!selectedBiller || billersLoading} onClick={() => setStep('details')} className="w-full rounded-xl bg-[#EE6E2D] py-3.5 text-sm font-semibold text-white transition hover:bg-[#F49A66] disabled:cursor-not-allowed disabled:opacity-50">Continue</button> : step === 'review' ? <div className="flex gap-3"><button type="button" onClick={() => setStep('details')} disabled={isProcessing} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 disabled:opacity-50">Back</button><button type="button" onClick={handlePay} disabled={isProcessing} aria-busy={isProcessing} className="flex flex-1 items-center justify-center rounded-xl bg-[#EE6E2D] py-3 text-sm font-semibold text-white transition hover:bg-[#EE6E2D] disabled:cursor-not-allowed disabled:opacity-50">{isProcessing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Continue to payment'}</button></div> : null}</div>}
      </ModalShell>}

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
