'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Form, Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { AlertCircle, ArrowRight, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import {
  DateField,
  MinorAmountField,
  NumberField,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from '@/components/forms';
import type {
  DigitalServiceBiller,
  DigitalServiceFormField,
  DigitalServiceProduct,
} from '@/lib/api/digitalServices';
import { SERVICE_LABEL_BY_SLUG } from '@/lib/digitalServices/categoryServices';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import ProviderSelector, {
  providerLogoSrc,
  type ProviderItem,
  type ProviderSelectorType,
} from './ProviderSelector';

export type DynamicServiceFormValues = Record<string, unknown> & {
  billerCode: string;
  productCode: string;
};

export type PendingPayment = {
  slug: string;
  providerId: string;
  providerName: string;
  providerImage?: string;
  recipientNumber: string;
  amount: number;
  amountMinor: number;
  email: string;
  productCode: string;
  values: DynamicServiceFormValues;
};

interface ServicePaymentFormProps {
  activeSlug: string;
  activeTitle?: string;
  billers: DigitalServiceBiller[];
  isLoading?: boolean;
  isError?: boolean;
  submissionError?: string;
  isFading?: boolean;
  onValidated: (payment: PendingPayment) => void | Promise<void>;
  formResetKey?: number;
  initialBillerCode?: string;
  hideBillerSelector?: boolean;
  /** Hide "Select product" and use the biller's first product (e.g. airtime: one VTU product per network). */
  hideProductSelector?: boolean;
  variant?: 'marketplace' | 'dashboard';
  initialEmail?: string;
  /** Called as the form changes, so the page hero can mirror the receipt. */
  onDraftChange?: (draft: ServiceDraft) => void;
}

export type ServiceDraft = {
  billerCode: string;
  billerName: string;
  amountMinor: number;
  recipient: string;
};

/** Quick amounts from the Service board, in naira. Only the ones inside the product's limits are shown. */
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];


const providerSelectorType: ProviderSelectorType = 'image';

function ServiceFormSkeleton() {
  return (
    <SkeletonGroup className="space-y-6 py-1" label="Loading available services">
      <div className="space-y-2">
        <Skeleton strong className="h-6 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ))}
      <Skeleton strong className="h-12 rounded-xl" />
    </SkeletonGroup>
  );
}

function valueAtPath(values: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, values);
}

function setAtPath(target: Record<string, unknown>, path: string, value: unknown) {
  const segments = path.split('.');
  let current = target;
  for (const segment of segments.slice(0, -1)) {
    const existing = current[segment];
    if (!existing || typeof existing !== 'object' || Array.isArray(existing)) current[segment] = {};
    current = current[segment] as Record<string, unknown>;
  }
  current[segments[segments.length - 1]] = value;
}

function availableProducts(biller: DigitalServiceBiller | undefined) {
  return biller?.products.filter((product) => product.active && product.profile.purchasable) ?? [];
}

function buildInitialValues(biller: DigitalServiceBiller, product: DigitalServiceProduct, initialEmail = ''): DynamicServiceFormValues {
  const values: Record<string, unknown> = { billerCode: biller.billerCode, productCode: product.code, email: initialEmail };
  for (const field of product.formFields) setAtPath(values, field.path, field.value ?? '');
  if (initialEmail && product.formFields.some((field) => field.path === 'email')) setAtPath(values, 'email', initialEmail);
  setAtPath(values, 'productCode', product.code);
  return values as DynamicServiceFormValues;
}

function nairaLabel(amountMinor: number) {
  return `₦${(amountMinor / 100).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
}

function normalizeNigerianPhone(value: unknown) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (/^0\d{10}$/.test(digits)) return `+234${digits.slice(1)}`;
  if (/^234\d{10}$/.test(digits)) return `+${digits}`;
  return String(value ?? '').trim();
}

function fieldSchema(field: DigitalServiceFormField): Yup.AnySchema {
  let schema: Yup.AnySchema;
  if (field.path === 'amountMinor') {
    schema = Yup.number()
      .transform((value, originalValue) => (originalValue === '' || originalValue == null ? undefined : value))
      .typeError('Enter a valid amount in naira');
    if (field.minimum !== null) {
      schema = (schema as Yup.NumberSchema).min(field.minimum, `Amount must be ${nairaLabel(field.minimum)} or above`);
    }
    if (field.maximum !== null) {
      schema = (schema as Yup.NumberSchema).max(field.maximum, `Amount cannot be more than ${nairaLabel(field.maximum)}`);
    }
  } else if (field.type === 'tel') {
    schema = Yup.string()
      .trim()
      .transform((value, originalValue) => normalizeNigerianPhone(originalValue))
      .matches(/^\+234\d{10}$/, 'Enter a valid 11-digit Nigerian phone number');
  } else if (field.type === 'integer' || field.type === 'number') {
    schema = Yup.number()
      .transform((value, originalValue) => (originalValue === '' || originalValue == null ? undefined : value))
      .typeError(`${field.label} must be a number`);
    if (field.type === 'integer') schema = (schema as Yup.NumberSchema).integer(`${field.label} must be a whole number`);
    if (field.minimum !== null) schema = (schema as Yup.NumberSchema).min(field.minimum, `${field.label} must be at least ${field.minimum.toLocaleString()}`);
    if (field.maximum !== null) schema = (schema as Yup.NumberSchema).max(field.maximum, `${field.label} must be at most ${field.maximum.toLocaleString()}`);
  } else {
    schema = Yup.string().trim();
    if (field.type === 'email') schema = (schema as Yup.StringSchema).email(`Enter a valid ${field.label.toLowerCase()}`);
    if (field.pattern) {
      try {
        schema = (schema as Yup.StringSchema).matches(new RegExp(field.pattern), `Enter a valid ${field.label.toLowerCase()}`);
      } catch {
        // The remaining backend constraints still apply if a malformed pattern is returned.
      }
    }
  }
  return field.required ? schema.required(`${field.label.replace(/\s*\(kobo\)/i, '')} is required`) : schema.optional();
}

function setSchemaAtPath(target: Record<string, unknown>, path: string, schema: Yup.AnySchema) {
  const segments = path.split('.');
  let current = target;
  for (const segment of segments.slice(0, -1)) {
    const existing = current[segment];
    if (!existing || typeof existing !== 'object') current[segment] = {};
    current = current[segment] as Record<string, unknown>;
  }
  current[segments[segments.length - 1]] = schema;
}

function objectSchema(shape: Record<string, unknown>): Yup.ObjectSchema<Record<string, unknown>> {
  const nestedShape = Object.fromEntries(
    Object.entries(shape).map(([key, value]) => [
      key,
      Yup.isSchema(value) ? value : objectSchema(value as Record<string, unknown>),
    ])
  );
  return Yup.object(nestedShape);
}

function buildValidationSchema(product: DigitalServiceProduct) {
  const shape: Record<string, unknown> = {
    billerCode: Yup.string().required('Select a biller'),
    productCode: Yup.string().required('Select a product'),
  };
  for (const field of product.formFields) setSchemaAtPath(shape, field.path, fieldSchema(field));
  return objectSchema(shape);
}

function toProviderItems(
  billers: DigitalServiceBiller[],
  type: ProviderSelectorType
): ProviderItem[] {
  return billers.map((biller) => ({
    id: biller.billerCode,
    name: biller.billerName,
    imageSrc:
      type === 'image' ? providerLogoSrc(biller) : undefined,
  }));
}

function DynamicFormField({ field }: { field: DigitalServiceFormField }) {
  const common = {
    name: field.path,
    label: field.label,
    required: field.required,
    readOnly: field.readOnly,
    disabled: field.readOnly,
    placeholder: field.readOnly ? undefined : `Enter ${field.label.toLowerCase()}`,
  };

  if (field.path === 'amountMinor') {
    return (
      <MinorAmountField
        {...common}
        label={field.label.replace(/\s*\(kobo\)/i, '')}
        minimumMinor={field.minimum ?? undefined}
        maximumMinor={field.maximum ?? undefined}
      />
    );
  }
  if (field.type === 'integer' || field.type === 'number') {
    return <NumberField {...common} min={field.minimum ?? undefined} max={field.maximum ?? undefined} step={field.type === 'integer' ? 1 : 'any'} />;
  }
  if (field.type === 'date') return <DateField {...common} />;
  if (field.type === 'textarea') return <TextAreaField {...common} />;

  return (
    <TextField
      {...common}
      type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
      pattern={field.pattern ?? undefined}
      startIcon={field.type === 'email' ? <Mail className="h-4 w-4" /> : field.type === 'tel' ? <Phone className="h-4 w-4" /> : undefined}
    />
  );
}

function QuickAmounts({ field }: { field: DigitalServiceFormField }) {
  const { values, setFieldValue } = useFormikContext<DynamicServiceFormValues>();
  const current = Number(valueAtPath(values, field.path) ?? 0);
  const options = QUICK_AMOUNTS.map((n) => n * 100).filter(
    (minor) => (field.minimum === null || minor >= field.minimum) && (field.maximum === null || minor <= field.maximum)
  );
  if (field.readOnly || !options.length) return null;
  return (
    <div className="-mt-2 flex flex-wrap gap-2" aria-label="Quick amounts">
      {options.map((minor) => {
        const on = current === minor;
        return (
          <button
            key={minor}
            type="button"
            aria-pressed={on}
            onClick={() => setFieldValue(field.path, minor)}
            className={`hz-press min-h-10 rounded-[10px] border px-4 text-sm font-medium transition-colors ${
              on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface text-tone-744 hover:border-tone-414'
            }`}
          >
            {nairaLabel(minor)}
          </button>
        );
      })}
    </div>
  );
}

function displayRecipient(value: unknown) {
  const phone = normalizeNigerianPhone(value);
  const m = phone.match(/^\+234(\d{3})(\d{3})(\d{4})$/);
  return m ? `+234 ${m[1]} ${m[2]} ${m[3]}` : String(value ?? '').trim();
}

/** Service board Carbon summary card, with the form's submit button. */
function ServiceSummary({
  rows,
  amountMinor,
}: {
  rows: { label: string; value: string }[];
  amountMinor: number;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const total = amountMinor > 0 ? `₦${(amountMinor / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '₦0.00';
  return (
    <aside className="hz-rise flex min-w-0 flex-[1_1_320px] flex-col gap-4 lg:sticky lg:top-6" style={{ '--d': 4 } as React.CSSProperties}>
      <div className="flex flex-col gap-5 rounded-[14px] bg-carbon p-7 text-cloud">
        <p className="hz-eyebrow text-grey-400">Summary</p>
        <dl className="flex flex-col gap-3.5 text-[15px]">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-grey-400">{row.label}</dt>
              <dd className="truncate text-right font-medium">{row.value || '–'}</dd>
            </div>
          ))}
        </dl>
        <div className="h-px bg-grey-800" />
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[15px] text-silver">You pay</span>
          <span className="text-[30px] font-semibold tracking-[-0.02em] tabular-nums">{total}</span>
        </div>
        <SubmitButton className="hz-press flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-cloud text-[15px] font-medium text-carbon hover:bg-white">
          Continue to payment
          <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
        </SubmitButton>
        <p className="text-center text-xs text-grey-500">Any service fee is shown before you pay.</p>
      </div>
      {!isAuthenticated && (
        <p className="px-2 text-sm leading-[1.6] text-grey-600">
          Paying as a guest.{' '}
          <Link href="/auth/login" className="border-b border-carbon font-medium text-carbon">
            Sign in
          </Link>{' '}
          to save numbers and see your history.
        </p>
      )}
    </aside>
  );
}

function DynamicFields({
  activeSlug,
  activeTitle,
  billers,
  onBillerChange,
  onProductChange,
  hideBillerSelector = false,
  hideProductSelector = false,
  variant = 'marketplace',
  onDraftChange,
}: {
  activeSlug: string;
  activeTitle?: string;
  billers: DigitalServiceBiller[];
  onBillerChange: (billerCode: string) => void;
  onProductChange: (productCode: string) => void;
  hideBillerSelector?: boolean;
  hideProductSelector?: boolean;
  variant?: 'marketplace' | 'dashboard';
  onDraftChange?: (draft: ServiceDraft) => void;
}) {
  const { values, errors, submitCount } = useFormikContext<DynamicServiceFormValues>();
  const selectedBiller = billers.find((biller) => biller.billerCode === values.billerCode) ?? billers[0];
  const products = availableProducts(selectedBiller);
  const selectedProduct = products.find((product) => product.code === values.productCode) ?? products[0];


  const amountMinor = Number(valueAtPath(values, 'amountMinor') ?? selectedProduct?.fixedAmountMinor ?? 0) || 0;
  const recipient = String(valueAtPath(values, 'recipient') ?? '');
  const billerCode = selectedBiller?.billerCode ?? '';
  const billerName = selectedBiller?.billerName ?? '';
  useEffect(() => {
    onDraftChange?.({ billerCode, billerName, amountMinor, recipient });
  }, [onDraftChange, billerCode, billerName, amountMinor, recipient]);

  if (!selectedBiller || !selectedProduct) return null;

  const topLevelError = submitCount > 0 ? Object.values(errors).find((error) => typeof error === 'string') : undefined;
  const label = SERVICE_LABEL_BY_SLUG[activeSlug] ?? activeTitle ?? '';
  const verb = ['airtime', 'data', 'electricity'].includes(activeSlug) ? 'Buy' : 'Pay for';
  const visibleFields = selectedProduct.formFields.filter((field) => field.type !== 'hidden' && field.path !== 'productCode');

  const fields = (
    <>
      {typeof topLevelError === 'string' ? <div className="flex items-center gap-2 rounded-lg border border-status-error/30 bg-status-error/8 px-3.5 py-3 text-sm text-status-error"><AlertCircle className="h-4 w-4 shrink-0" /><span>{topLevelError}</span></div> : null}
      {!hideBillerSelector && <ProviderSelector label={['airtime', 'data'].includes(activeSlug) ? 'Network' : 'Provider'} providers={toProviderItems(billers, providerSelectorType)} selectedId={selectedBiller.billerCode} onSelect={onBillerChange} type={providerSelectorType} />}
      {!hideProductSelector && <SelectField name="productCode" label="Plan" required placeholder="Select a plan" options={products.map((product) => ({ value: product.code, label: product.name }))} onValueChange={onProductChange} />}
      {visibleFields.map((field) => (
        <React.Fragment key={field.path}>
          <DynamicFormField field={field} />
          {field.path === 'amountMinor' && <QuickAmounts field={field} />}
        </React.Fragment>
      ))}
      {!selectedProduct.formFields.some((field) => field.path === 'email') && (
        <TextField
          name="email"
          type="email"
          label={<>Email for your receipt <span className="font-normal text-tone-414">(optional)</span></>}
          placeholder="you@example.com"
          startIcon={<Mail className="h-4 w-4" />}
        />
      )}
    </>
  );

  if (variant === 'dashboard') {
    return (
      <Form className="space-y-5" noValidate>
        {fields}
        <SubmitButton className="hz-press flex min-h-13 w-full items-center justify-center rounded-xl bg-brand-305 text-[15px] font-medium text-on-brand hover:bg-brand-361">Continue</SubmitButton>
      </Form>
    );
  }

  const productName = !hideProductSelector ? selectedProduct.name : '';
  return (
    <Form className="flex w-full flex-wrap items-start gap-6" noValidate>
      <div className="hz-rise flex min-w-0 flex-[999_1_560px] flex-col gap-7 rounded-[14px] border border-grey-100 bg-white p-[clamp(20px,3vw,36px)] text-carbon" style={{ '--d': 3 } as React.CSSProperties}>
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">
          {verb} {label.toLowerCase()}
        </h2>
        {fields}
      </div>
      <ServiceSummary
        amountMinor={amountMinor}
        rows={[
          { label: ['airtime', 'data'].includes(activeSlug) ? 'Network' : 'Provider', value: selectedBiller.billerName },
          ...(productName ? [{ label: 'Plan', value: productName }] : []),
          ...(visibleFields.some((f) => f.path === 'recipient')
            ? [{ label: visibleFields.find((f) => f.path === 'recipient')?.label ?? 'Recipient', value: displayRecipient(recipient) }]
            : []),
          { label: 'Amount', value: amountMinor > 0 ? nairaLabel(amountMinor) : '' },
        ]}
      />
    </Form>
  );
}

export default function ServicePaymentForm({ activeSlug, activeTitle, billers, isLoading = false, isError = false, submissionError, isFading, onValidated, formResetKey = 0, initialBillerCode, hideBillerSelector = false, hideProductSelector = false, variant = 'marketplace', initialEmail = '', onDraftChange }: ServicePaymentFormProps) {
  const [selectedBillerCode, setSelectedBillerCode] = useState<string | undefined>(initialBillerCode);
  const [selectedProductCode, setSelectedProductCode] = useState<string>();
  const selectedBiller = billers.find((biller) => biller.billerCode === selectedBillerCode) ?? billers[0];
  const availableBillerProducts = availableProducts(selectedBiller);
  const selectedProduct = availableBillerProducts.find((product) => product.code === selectedProductCode) ?? availableBillerProducts[0];
  const initialValues = useMemo(() => (selectedBiller && selectedProduct ? buildInitialValues(selectedBiller, selectedProduct, initialEmail) : null), [initialEmail, selectedBiller, selectedProduct]);
  const validationSchema = useMemo(
    () => (selectedProduct ? buildValidationSchema(selectedProduct) : undefined),
    [selectedProduct]
  );

  return (
    <div className={variant === 'dashboard' ? 'w-full py-6' : `w-full transition-all duration-300 ease-out ${isFading ? 'opacity-30 blur-[0.4px]' : 'opacity-100 blur-0'}`}>
      {(isLoading || isError || !initialValues) && (
        <div className={variant === 'dashboard' ? '' : 'rounded-[14px] border border-grey-100 bg-white p-[clamp(20px,3vw,36px)] text-carbon'}>
          {isLoading ? <ServiceFormSkeleton /> : null}
          {isError ? <p className="py-14 text-center text-sm text-status-error">We could not load services right now. Please try again.</p> : null}
          {!isLoading && !isError && !initialValues ? <p className="py-14 text-center text-sm text-grey-600">No purchasable products are available for this service.</p> : null}
        </div>
      )}
      {/* {submissionError && !isLoading && !isError ? <div className="mb-5 flex items-center gap-2 rounded-xl bg-status-error/8 p-3 text-xs font-medium text-status-error"><AlertCircle className="h-4 w-4 shrink-0" />{submissionError}</div> : null} */}
      {initialValues && selectedBiller && selectedProduct && validationSchema ? (
        <Formik<DynamicServiceFormValues>
          key={`${selectedBiller.billerCode}-${selectedProduct.code}-${formResetKey}`}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const biller = billers.find((item) => item.billerCode === values.billerCode) ?? selectedBiller;
            const product = availableProducts(biller).find((item) => item.code === values.productCode) ?? selectedProduct;
            const amountMinor = Number(valueAtPath(values, 'amountMinor') ?? product.fixedAmountMinor ?? 0);
            const recipientNumber = normalizeNigerianPhone(valueAtPath(values, 'recipient'));
            const contactPhone = normalizeNigerianPhone(valueAtPath(values, 'contactPhone'));
            const apiValues = {
              ...values,
              recipient: recipientNumber,
              ...(contactPhone ? { contactPhone } : {}),
            };
            return onValidated({ slug: activeSlug, providerId: biller.billerCode, providerName: biller.billerName, providerImage: providerSelectorType === 'image' ? providerLogoSrc(biller) : undefined, recipientNumber, amount: Number.isFinite(amountMinor) ? amountMinor / 100 : 0, amountMinor: Number.isFinite(amountMinor) ? amountMinor : 0, email: String(valueAtPath(values, 'email') ?? ''), productCode: product.code, values: apiValues });
          }}
        >
          <DynamicFields
            activeSlug={activeSlug}
            activeTitle={activeTitle}
            billers={billers}
            hideBillerSelector={hideBillerSelector}
            hideProductSelector={hideProductSelector}
            variant={variant}
            onDraftChange={onDraftChange}
            onBillerChange={(billerCode) => {
              setSelectedBillerCode(billerCode);
              setSelectedProductCode(undefined);
            }}
            onProductChange={setSelectedProductCode}
          />
        </Formik>
      ) : null}
    </div>
  );
}
