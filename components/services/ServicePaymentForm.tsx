'use client';

import React, { useEffect, useMemo } from 'react';
import { Formik, Form, useFormikContext } from 'formik';
import { Phone, Mail, AlertCircle } from 'lucide-react';
import { AmountField, TextField, SubmitButton } from '@/components/forms';
import { servicePaymentSchema } from '@/lib/validation/schemas';
import ProviderSelector, { ProviderItem } from './ProviderSelector';

export type ServiceFormValues = {
  providerId: string;
  recipientNumber: string;
  meterType: 'prepaid' | 'postpaid';
  amount: number | '';
  dataFrequency: 'daily' | 'weekly' | 'monthly';
  selectedDataPlan: string;
  tvFrequency: 'weekly' | '2-weeks' | 'monthly' | 'yearly';
  selectedTvPlan: string;
  email: string;
};

export type PendingPayment = {
  slug: string;
  providerId: string;
  providerName: string;
  providerImage: string;
  recipientNumber: string;
  amount: number;
  email: string;
  meterType?: 'prepaid' | 'postpaid';
};

const PRESET_AMOUNTS = [
  { value: 100, label: 'Pay ₦100.00' },
  { value: 500, label: 'Pay ₦500.00' },
  { value: 1000, label: 'Pay ₦1,000.00' },
  { value: 2000, label: 'Pay ₦2,000.00' },
  { value: 5000, label: 'Pay ₦5,000.00' },
  { value: 10000, label: 'Pay ₦10,000.00' },
];

const DATA_PLANS: Record<
  string,
  Array<{ id: string; name: string; validity: string; price: number }>
> = {
  daily: [
    { id: 'd-1', name: '1GB', validity: '1 Days', price: 350 },
    { id: 'd-2', name: '2 GB', validity: '1 Days', price: 600 },
    { id: 'd-3', name: '3.2 GB', validity: '1 Days', price: 1000 },
  ],
  weekly: [
    { id: 'w-1', name: '3.5 GB', validity: '7 Days', price: 1500 },
    { id: 'w-2', name: '7 GB', validity: '7 Days', price: 2500 },
    { id: 'w-3', name: '10 GB', validity: '7 Days', price: 3500 },
  ],
  monthly: [
    { id: 'm-1', name: '12 GB', validity: '30 Days', price: 4000 },
    { id: 'm-2', name: '25 GB', validity: '30 Days', price: 7500 },
    { id: 'm-3', name: '50 GB', validity: '30 Days', price: 13000 },
  ],
};

const TV_PLANS: Record<
  string,
  Array<{ id: string; name: string; validity: string; price: number }>
> = {
  weekly: [
    { id: 'tv-w1', name: 'Dstv Padi', validity: '7 Days', price: 2000 },
    { id: 'tv-w2', name: 'Dstv Yanga', validity: '7 Days', price: 3000 },
    { id: 'tv-w3', name: 'Dstv Confam', validity: '7 Days', price: 5000 },
  ],
  '2-weeks': [
    { id: 'tv-2w1', name: 'Dstv Padi', validity: '14 Days', price: 3800 },
    { id: 'tv-2w2', name: 'Dstv Yanga', validity: '14 Days', price: 5700 },
    { id: 'tv-2w3', name: 'Dstv Confam', validity: '14 Days', price: 9500 },
  ],
  monthly: [
    { id: 'tv-m1', name: 'Dstv Compact', validity: '30 Days', price: 15700 },
    { id: 'tv-m2', name: 'Dstv Compact Plus', validity: '30 Days', price: 25000 },
    { id: 'tv-m3', name: 'Dstv Premium', validity: '30 Days', price: 37000 },
  ],
  yearly: [
    { id: 'tv-y1', name: 'Dstv Compact Annual', validity: '365 Days', price: 172000 },
    { id: 'tv-y2', name: 'Dstv Premium Annual', validity: '365 Days', price: 407000 },
  ],
};

function defaultProviderId(slug: string) {
  if (slug === 'airtime' || slug === 'data') return 'mtn';
  if (slug === 'electricity') return 'ikeja';
  if (slug === 'tv') return 'dstv';
  if (slug === 'betting') return 'sportybet';
  return 'waec';
}

export function buildInitialValues(slug: string): ServiceFormValues {
  return {
    providerId: defaultProviderId(slug),
    recipientNumber: '',
    meterType: 'prepaid',
    amount: '',
    dataFrequency: 'daily',
    selectedDataPlan: 'd-1',
    tvFrequency: 'weekly',
    selectedTvPlan: 'tv-w1',
    email: '',
  };
}

function resolvePrice(slug: string, values: ServiceFormValues): number {
  if (slug === 'data') {
    const plans = DATA_PLANS[values.dataFrequency] || DATA_PLANS.daily;
    return (plans.find((p) => p.id === values.selectedDataPlan) || plans[0]).price;
  }
  if (slug === 'tv') {
    const plans = TV_PLANS[values.tvFrequency] || TV_PLANS.weekly;
    return (plans.find((p) => p.id === values.selectedTvPlan) || plans[0]).price;
  }
  return typeof values.amount === 'number' ? values.amount : 0;
}

function CarrierDetector({ activeSlug }: { activeSlug: string }) {
  const { values, setFieldValue } = useFormikContext<ServiceFormValues>();

  useEffect(() => {
    if (activeSlug !== 'airtime' && activeSlug !== 'data') return;

    const cleanNumber = values.recipientNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 4) return;

    const prefix = cleanNumber.startsWith('234')
      ? '0' + cleanNumber.slice(3, 6)
      : cleanNumber.slice(0, 4);

    if (/^(0803|0806|0703|0706|0813|0816|0810|0814|0903|0906|0913|0916)/.test(prefix)) {
      setFieldValue('providerId', 'mtn');
    } else if (/^(0802|0808|0708|0812|0701|0902|0901|0904|0907|0912)/.test(prefix)) {
      setFieldValue('providerId', 'airtel');
    } else if (/^(0805|0807|0705|0815|0811|0905|0915)/.test(prefix)) {
      setFieldValue('providerId', 'glo');
    } else if (/^(0809|0817|0818|0909|0908)/.test(prefix)) {
      setFieldValue('providerId', '9mobile');
    }
  }, [values.recipientNumber, activeSlug, setFieldValue]);

  return null;
}

function detectCarrierLabel(recipientNumber: string, activeSlug: string): string | null {
  if (activeSlug !== 'airtime' && activeSlug !== 'data') return null;
  const cleanNumber = recipientNumber.replace(/\s+/g, '');
  if (cleanNumber.length < 4) return null;
  const prefix = cleanNumber.startsWith('234')
    ? '0' + cleanNumber.slice(3, 6)
    : cleanNumber.slice(0, 4);

  if (/^(0803|0806|0703|0706|0813|0816|0810|0814|0903|0906|0913|0916)/.test(prefix)) return 'MTN';
  if (/^(0802|0808|0708|0812|0701|0902|0901|0904|0907|0912)/.test(prefix)) return 'Airtel';
  if (/^(0805|0807|0705|0815|0811|0905|0915)/.test(prefix)) return 'Glo';
  if (/^(0809|0817|0818|0909|0908)/.test(prefix)) return '9mobile';
  return null;
}

interface ServicePaymentFormProps {
  activeSlug: string;
  providers: ProviderItem[];
  isFading?: boolean;
  onValidated: (payment: PendingPayment) => void;
  formResetKey?: number;
}

function ServicePaymentFields({
  activeSlug,
  providers,
}: {
  activeSlug: string;
  providers: ProviderItem[];
}) {
  const { values, setFieldValue, errors, touched, submitCount } =
    useFormikContext<ServiceFormValues>();
  const detectedCarrier = detectCarrierLabel(values.recipientNumber, activeSlug);
  const activeProvider =
    providers.find((p) => p.id.toLowerCase() === values.providerId.toLowerCase()) ||
    providers[0];
  const requireAmount = activeSlug !== 'data' && activeSlug !== 'tv';
  const selectedPreset =
    typeof values.amount === 'number'
      ? PRESET_AMOUNTS.find((p) => p.value === values.amount)?.value ?? null
      : null;

  const formError =
    submitCount > 0
      ? (typeof errors.recipientNumber === 'string' && touched.recipientNumber
          ? errors.recipientNumber
          : typeof errors.amount === 'string'
            ? errors.amount
            : typeof errors.providerId === 'string'
              ? errors.providerId
              : '')
      : '';

  return (
    <>
      <CarrierDetector activeSlug={activeSlug} />

      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">
            {activeSlug === 'airtime'
              ? '📱'
              : activeSlug === 'data'
                ? '📶'
                : activeSlug === 'electricity'
                  ? '⚡'
                  : activeSlug === 'tv'
                    ? '📺'
                    : activeSlug === 'betting'
                      ? '🎲'
                      : '🎓'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl capitalize">
            {activeSlug}
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          {activeSlug === 'airtime' || activeSlug === 'data'
            ? 'Enter the number to top up.'
            : 'Enter the details below.'}
        </p>
      </div>

      {formError ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      <Form className="mt-6 space-y-5" noValidate>
        <ProviderSelector
          label={
            activeSlug === 'airtime' || activeSlug === 'data'
              ? 'Select biller'
              : 'Select provider'
          }
          providers={providers}
          selectedId={values.providerId}
          onSelect={(id) => setFieldValue('providerId', id)}
        />

        {activeSlug === 'electricity' && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Select package
            </label>
            <div className="rounded-2xl bg-[#EEF7FB] p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={activeProvider.imageSrc}
                  alt="provider"
                  className="h-6 w-6 rounded-full object-contain"
                />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {activeProvider.name} DISCO
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white/70 p-1 rounded-xl">
                {(['prepaid', 'postpaid'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFieldValue('meterType', type)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                      values.meterType === type
                        ? 'bg-[#FDF2EC] text-[#FF6500] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <TextField
          name="recipientNumber"
          label={
            activeSlug === 'electricity'
              ? 'Meter Number'
              : activeSlug === 'tv'
                ? 'Smartcard Number'
                : activeSlug === 'betting'
                  ? 'User ID'
                  : 'Phone Number'
          }
          required
          placeholder={
            activeSlug === 'electricity'
              ? 'Enter your meter number'
              : activeSlug === 'tv'
                ? 'Enter your smartcard number'
                : activeSlug === 'betting'
                  ? 'Enter your user id'
                  : 'Enter your phone number'
          }
          startIcon={<Phone className="h-4 w-4" />}
          labelAction={
            detectedCarrier ? (
              <span className="text-[11px] font-semibold text-[#FF6500]">
                {detectedCarrier} detected
              </span>
            ) : undefined
          }
          showError={false}
        />

        {activeSlug === 'data' && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Choose a plan
            </label>
            <div className="space-y-3 rounded-2xl bg-[#EEF7FB] p-4 sm:p-5">
              <span className="text-xs font-medium text-slate-600">Top up</span>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200/60 p-1 text-center">
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => {
                      setFieldValue('dataFrequency', freq);
                      setFieldValue('selectedDataPlan', DATA_PLANS[freq][0].id);
                    }}
                    className={`rounded-lg py-1.5 text-xs font-bold capitalize transition-all ${
                      values.dataFrequency === freq
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
              <div className="space-y-2 pt-1">
                {DATA_PLANS[values.dataFrequency].map((plan) => {
                  const isSelected = values.selectedDataPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setFieldValue('selectedDataPlan', plan.id)}
                      className={`flex w-full items-center justify-between rounded-xl p-3.5 transition-all ${
                        isSelected
                          ? 'border-2 border-[#FF6500] bg-white shadow-sm ring-2 ring-[#FF6500]/20'
                          : 'border border-slate-200/80 bg-white hover:border-[#FF6500]/40'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block text-sm font-extrabold text-slate-900">
                          {plan.name}
                        </span>
                        <span className="text-xs text-slate-500">{plan.validity}</span>
                      </div>
                      <span className="text-sm font-extrabold text-[#FF6500]">
                        ₦ {plan.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSlug === 'tv' && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Choose a plan
            </label>
            <div className="space-y-3 rounded-2xl bg-[#EEF7FB] p-4 sm:p-5">
              <span className="text-xs font-medium text-slate-600">Top up</span>
              <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-200/60 p-1 text-center">
                {(['weekly', '2-weeks', 'monthly', 'yearly'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => {
                      setFieldValue('tvFrequency', freq);
                      setFieldValue('selectedTvPlan', TV_PLANS[freq][0].id);
                    }}
                    className={`rounded-lg py-1.5 text-[11px] font-bold capitalize transition-all ${
                      values.tvFrequency === freq
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {freq === '2-weeks' ? '2-Weeks' : freq}
                  </button>
                ))}
              </div>
              <div className="space-y-2 pt-1">
                {TV_PLANS[values.tvFrequency].map((plan) => {
                  const isSelected = values.selectedTvPlan === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setFieldValue('selectedTvPlan', plan.id)}
                      className={`flex w-full items-center justify-between rounded-xl p-3.5 transition-all ${
                        isSelected
                          ? 'border-2 border-[#FF6500] bg-white shadow-sm ring-2 ring-[#FF6500]/20'
                          : 'border border-slate-200/80 bg-white hover:border-[#FF6500]/40'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block text-sm font-extrabold text-slate-900">
                          {plan.name}
                        </span>
                        <span className="text-xs text-slate-500">{plan.validity}</span>
                      </div>
                      <span className="text-sm font-extrabold text-[#FF6500]">
                        ₦ {plan.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {requireAmount && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Amount</label>
            <div className="space-y-4 rounded-2xl bg-[#EEF7FB] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Top up</span>
                <span className="text-[11px] font-semibold text-[#FF6500]">
                  Instant Fulfillment
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {PRESET_AMOUNTS.map((preset) => {
                  const isSelected = selectedPreset === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFieldValue('amount', preset.value)}
                      className={`rounded-xl px-2 py-2.5 text-center text-xs font-bold transition-all duration-150 active:scale-95 ${
                        isSelected
                          ? 'border-2 border-[#FF6500] bg-white text-[#FF6500] shadow-sm ring-2 ring-[#FF6500]/20'
                          : 'border border-slate-200/80 bg-white text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[#FF6500]/50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <AmountField
                name="amount"
                label={
                  <>
                    Enter Amount<span className="text-[#FF6500]">*</span>
                  </>
                }
                min={100}
                max={100000}
                placeholder="0.00 (Min. ₦100)"
                showError
              />
            </div>
          </div>
        )}

        <TextField
          name="email"
          type="email"
          label="Email for receipt (optional)"
          placeholder="Enter your email address"
          startIcon={<Mail className="h-4 w-4" />}
        />

        <SubmitButton className="w-full rounded-xl bg-[#FF9A62] py-3.5 text-center text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#FF6500] hover:shadow-lg active:scale-[0.99]">
          Continue
        </SubmitButton>
      </Form>
    </>
  );
}

export default function ServicePaymentForm({
  activeSlug,
  providers,
  isFading,
  onValidated,
  formResetKey = 0,
}: ServicePaymentFormProps) {
  const initialValues = useMemo(() => buildInitialValues(activeSlug), [activeSlug]);
  const validationSchema = useMemo(
    () =>
      servicePaymentSchema({
        slug: activeSlug,
        requireAmount: activeSlug !== 'data' && activeSlug !== 'tv',
        minAmount: 100,
        maxAmount: 100000,
      }),
    [activeSlug]
  );

  return (
    <div
      className={`w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl transition-all duration-300 ease-out sm:p-8 ${
        isFading ? 'opacity-30 scale-[0.99] blur-[0.4px]' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      <Formik
        key={`${activeSlug}-${formResetKey}`}
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={(values) => {
          const provider =
            providers.find((p) => p.id.toLowerCase() === values.providerId.toLowerCase()) ||
            providers[0];
          onValidated({
            slug: activeSlug,
            providerId: values.providerId,
            providerName: provider.name,
            providerImage: provider.imageSrc,
            recipientNumber: values.recipientNumber,
            amount: resolvePrice(activeSlug, values),
            email: values.email,
            meterType: values.meterType,
          });
        }}
      >
        <ServicePaymentFields activeSlug={activeSlug} providers={providers} />
      </Formik>
    </div>
  );
}
