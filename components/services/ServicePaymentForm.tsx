'use client';

import React, { useMemo, useState } from 'react';
import { Form, Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { AlertCircle, Mail, Phone } from 'lucide-react';
import {
  DateField,
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
import ProviderSelector, { type ProviderItem } from './ProviderSelector';

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
  email: string;
  productCode: string;
  values: DynamicServiceFormValues;
};

interface ServicePaymentFormProps {
  activeSlug: string;
  billers: DigitalServiceBiller[];
  isLoading?: boolean;
  isError?: boolean;
  isFading?: boolean;
  onValidated: (payment: PendingPayment) => void;
  formResetKey?: number;
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

function buildInitialValues(biller: DigitalServiceBiller, product: DigitalServiceProduct): DynamicServiceFormValues {
  const values: Record<string, unknown> = { billerCode: biller.billerCode, productCode: product.code };
  for (const field of product.formFields) setAtPath(values, field.path, field.value ?? '');
  setAtPath(values, 'productCode', product.code);
  return values as DynamicServiceFormValues;
}

function fieldSchema(field: DigitalServiceFormField): Yup.AnySchema {
  let schema: Yup.AnySchema;
  if (field.type === 'integer' || field.type === 'number') {
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
  return field.required ? schema.required(`${field.label} is required`) : schema.optional();
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

function toProviderItems(billers: DigitalServiceBiller[]): ProviderItem[] {
  return billers.map((biller) => ({
    id: biller.billerCode,
    name: biller.billerName,
    imageSrc: providerImages[biller.billerCode.toLowerCase()],
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
}: {
  activeSlug: string;
  billers: DigitalServiceBiller[];
  onBillerChange: (billerCode: string) => void;
  onProductChange: (productCode: string) => void;
}) {
  const { values, errors, submitCount } = useFormikContext<DynamicServiceFormValues>();
  const selectedBiller = billers.find((biller) => biller.billerCode === values.billerCode) ?? billers[0];
  const products = availableProducts(selectedBiller);
  const selectedProduct = products.find((product) => product.code === values.productCode) ?? products[0];

  if (!selectedBiller || !selectedProduct) return null;

  const topLevelError = submitCount > 0 ? Object.values(errors).find((error) => typeof error === 'string') : undefined;
  return (
    <Form className="mt-6 space-y-5" noValidate>
      <div className="text-center">
        <h2 className="text-xl font-bold capitalize text-slate-900 sm:text-2xl">{activeSlug}</h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">Choose a provider and product to continue.</p>
      </div>
      {typeof topLevelError === 'string' ? <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600"><AlertCircle className="h-4 w-4 shrink-0" /><span>{topLevelError}</span></div> : null}
      <ProviderSelector label="Select biller" providers={toProviderItems(billers)} selectedId={selectedBiller.billerCode} onSelect={onBillerChange} />
      <SelectField name="productCode" label="Select product" required placeholder="Select a product" options={products.map((product) => ({ value: product.code, label: product.name }))} onValueChange={onProductChange} />
      {selectedProduct.formFields.filter((field) => field.type !== 'hidden' && field.path !== 'productCode').map((field) => <DynamicFormField key={field.path} field={field} />)}
      <SubmitButton className="w-full rounded-xl bg-[#FF9A62] py-3.5 text-center text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#FF6500] hover:shadow-lg active:scale-[0.99]">Continue</SubmitButton>
    </Form>
  );
}

export default function ServicePaymentForm({ activeSlug, billers, isLoading = false, isError = false, isFading, onValidated, formResetKey = 0 }: ServicePaymentFormProps) {
  const [selectedBillerCode, setSelectedBillerCode] = useState<string>();
  const [selectedProductCode, setSelectedProductCode] = useState<string>();
  const selectedBiller = billers.find((biller) => biller.billerCode === selectedBillerCode) ?? billers[0];
  const availableBillerProducts = availableProducts(selectedBiller);
  const selectedProduct = availableBillerProducts.find((product) => product.code === selectedProductCode) ?? availableBillerProducts[0];
  const initialValues = useMemo(() => (selectedBiller && selectedProduct ? buildInitialValues(selectedBiller, selectedProduct) : null), [selectedBiller, selectedProduct]);
  const validationSchema = useMemo(
    () => (selectedProduct ? buildValidationSchema(selectedProduct) : undefined),
    [selectedProduct]
  );

  return (
    <div className={`w-full max-w-xl rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl transition-all duration-300 ease-out sm:p-8 ${isFading ? 'scale-[0.99] opacity-30 blur-[0.4px]' : 'scale-100 opacity-100 blur-0'}`}>
      {isLoading ? <p className="py-14 text-center text-sm text-slate-500">Loading available services…</p> : null}
      {isError ? <p className="py-14 text-center text-sm text-red-600">We could not load services right now. Please try again.</p> : null}
      {!isLoading && !isError && !initialValues ? <p className="py-14 text-center text-sm text-slate-500">No purchasable products are available for this service.</p> : null}
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
            onValidated({ slug: activeSlug, providerId: biller.billerCode, providerName: biller.billerName, providerImage: providerImages[biller.billerCode.toLowerCase()], recipientNumber: String(valueAtPath(values, 'recipient') ?? ''), amount: Number.isFinite(amountMinor) ? amountMinor / 100 : 0, email: String(valueAtPath(values, 'email') ?? ''), productCode: product.code, values });
          }}
        >
          <DynamicFields
            activeSlug={activeSlug}
            billers={billers}
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
