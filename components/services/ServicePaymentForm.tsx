'use client';

import React, { useMemo, useState } from 'react';
import { Form, Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { AlertCircle, Mail, Phone } from 'lucide-react';
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
import ProviderSelector, {
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
  billers: DigitalServiceBiller[];
  isLoading?: boolean;
  isError?: boolean;
  submissionError?: string;
  isFading?: boolean;
  onValidated: (payment: PendingPayment) => void | Promise<void>;
  formResetKey?: number;
  initialBillerCode?: string;
  hideBillerSelector?: boolean;
  variant?: 'marketplace' | 'dashboard';
  initialEmail?: string;
}

const providerImages: Record<string, string> = {
  mtn: '/images/network_mtn.png',
  airtel: '/images/network_airtel.png',
  glo: '/images/network_glo.png',
  '9mobile': '/images/network_9mobile.png',
  dstv: '/images/tv_dstv.png',
  gotv: '/images/tv_gotv.png',
  ikeja: '/images/elec_ikeja.png',
  ibedc: '/images/elec_ibedc.png',
  ekedc: '/images/elec_ekedc.png',
  jos: '/images/elec_jos.png',
  kaduna: '/images/elec_kaduna.png',
};

const providerSelectorType: ProviderSelectorType = 'name';

function ServiceFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-1" aria-label="Loading available services" role="status">
      <div className="space-y-2">
        <div className="h-6 w-36 rounded-md bg-slate-200" />
        <div className="h-4 w-56 rounded-md bg-slate-100" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-20 rounded-xl bg-slate-100" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="h-12 rounded-xl bg-slate-100" />
        </div>
      ))}
      <div className="h-12 rounded-xl bg-slate-200" />
    </div>
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
      type === 'image' ? providerImages[biller.billerCode.toLowerCase()] : undefined,
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

function DynamicFields({
  activeSlug,
  billers,
  onBillerChange,
  onProductChange,
  hideBillerSelector = false,
  variant = 'marketplace',
}: {
  activeSlug: string;
  billers: DigitalServiceBiller[];
  onBillerChange: (billerCode: string) => void;
  onProductChange: (productCode: string) => void;
  hideBillerSelector?: boolean;
  variant?: 'marketplace' | 'dashboard';
}) {
  const { values, errors, submitCount } = useFormikContext<DynamicServiceFormValues>();
  const selectedBiller = billers.find((biller) => biller.billerCode === values.billerCode) ?? billers[0];
  const products = availableProducts(selectedBiller);
  const selectedProduct = products.find((product) => product.code === values.productCode) ?? products[0];

  if (!selectedBiller || !selectedProduct) return null;

  const topLevelError = submitCount > 0 ? Object.values(errors).find((error) => typeof error === 'string') : undefined;
  return (
    <Form className={variant === 'dashboard' ? 'space-y-5' : 'mt-6 space-y-5'} noValidate>
      {variant === 'marketplace' && <div className="text-center">
        <h2 className="text-xl font-bold capitalize text-slate-900 sm:text-2xl">{activeSlug}</h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Choose a provider and product to continue.</p>
      </div>}
      {typeof topLevelError === 'string' ? <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600"><AlertCircle className="h-4 w-4 shrink-0" /><span>{topLevelError}</span></div> : null}
      {!hideBillerSelector && <ProviderSelector label="Select biller" providers={toProviderItems(billers, providerSelectorType)} selectedId={selectedBiller.billerCode} onSelect={onBillerChange} type={providerSelectorType} />}
      <SelectField name="productCode" label="Select product" required placeholder="Select a product" options={products.map((product) => ({ value: product.code, label: product.name }))} onValueChange={onProductChange} />
      {selectedProduct.formFields.filter((field) => field.type !== 'hidden' && field.path !== 'productCode').map((field) => <DynamicFormField key={field.path} field={field} />)}
      {!selectedProduct.formFields.some((field) => field.path === 'email') && <TextField name="email" type="email" label="Email for receipt (optional)" placeholder="Enter your email address" startIcon={<Mail className="h-4 w-4" />} />}
      <SubmitButton className="w-full rounded-xl bg-[#E95312] py-3.5 text-center text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#E95312] hover:shadow-lg active:scale-[0.99]">Continue</SubmitButton>
    </Form>
  );
}

export default function ServicePaymentForm({ activeSlug, billers, isLoading = false, isError = false, submissionError, isFading, onValidated, formResetKey = 0, initialBillerCode, hideBillerSelector = false, variant = 'marketplace', initialEmail = '' }: ServicePaymentFormProps) {
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
    <div className={variant === 'dashboard' ? 'w-full py-6' : `w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl transition-all duration-300 ease-out sm:p-8 ${isFading ? 'scale-[0.99] opacity-30 blur-[0.4px]' : 'scale-100 opacity-100 blur-0'}`}>
      {isLoading ? <ServiceFormSkeleton /> : null}
      {isError ? <p className="py-14 text-center text-sm text-red-600">We could not load services right now. Please try again.</p> : null}
      {!isLoading && !isError && !initialValues ? <p className="py-14 text-center text-sm text-slate-500">No purchasable products are available for this service.</p> : null}
      {/* {submissionError && !isLoading && !isError ? <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{submissionError}</div> : null} */}
      {initialValues && selectedBiller && selectedProduct && validationSchema ? (
        <Formik<DynamicServiceFormValues>
          key={`${selectedBiller.billerCode}-${selectedProduct.code}-${formResetKey}`}
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnBlur
          validateOnChange={false}
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
            return onValidated({ slug: activeSlug, providerId: biller.billerCode, providerName: biller.billerName, providerImage: providerSelectorType === 'image' ? providerImages[biller.billerCode.toLowerCase()] : undefined, recipientNumber, amount: Number.isFinite(amountMinor) ? amountMinor / 100 : 0, amountMinor: Number.isFinite(amountMinor) ? amountMinor : 0, email: String(valueAtPath(values, 'email') ?? ''), productCode: product.code, values: apiValues });
          }}
        >
          <DynamicFields
            activeSlug={activeSlug}
            billers={billers}
            hideBillerSelector={hideBillerSelector}
            variant={variant}
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
