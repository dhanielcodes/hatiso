'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { CheckCircle2, Link2 } from 'lucide-react';
import { DateField, SelectField, SubmitButton, TextAreaField, useFormField } from '@/components/forms';
import { newIdempotencyKey, type SupportReceipt } from '@/lib/api/support';
import { useCreateSupportEnquiry } from '@/lib/queries/useSupport';
import { humanizeEnum, ticketHref, todayIso } from './supportDisplay';

type RequestType = 'ENQUIRY' | 'COMPLAINT';
type EnquiryValues = { enquiryType: string; date: string; remark: string; requestType: RequestType };

const REMARK_MAX = 10_000;

const enquirySchema = Yup.object({
  enquiryType: Yup.string().required('Select an enquiry type.'),
  date: Yup.string().required('Pick a date.'),
  remark: Yup.string().trim().required('Enter a remark.').max(REMARK_MAX, 'Keep it under 10,000 characters.'),
  requestType: Yup.mixed<RequestType>().oneOf(['ENQUIRY', 'COMPLAINT']).required(),
});

const REQUEST_TYPES: { value: RequestType; label: string; hint: string }[] = [
  { value: 'ENQUIRY', label: 'Enquiry', hint: 'Ask a question' },
  { value: 'COMPLAINT', label: 'Complaint', hint: 'Report a problem' },
];

function RequestTypeField({ name }: { name: string }) {
  const { field, setValue } = useFormField<RequestType>(name);
  return (
    <div>
      <p id={`${name}-label`} className="mb-2 text-sm font-medium text-tone-744">
        Request type
      </p>
      <div role="radiogroup" aria-labelledby={`${name}-label`} className="grid grid-cols-2 gap-3">
        {REQUEST_TYPES.map((option) => {
          const active = field.value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setValue(option.value)}
              className={`rounded-lg border px-3.5 py-2.5 text-left transition ${active ? 'border-ink-660 bg-ink-660 text-white' : 'border-tone-98 bg-surface text-tone-744 hover:bg-slate-50'}`}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              <span className={`block text-xs ${active ? 'text-white/70' : 'text-tone-405'}`}>{option.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface SupportEnquiryFormProps {
  enquiryTypes: string[];
  /** True while the enquiry types are still loading. */
  loadingTypes?: boolean;
  defaultEnquiryType?: string;
  defaultRequestType?: RequestType;
  /** Incident date, YYYY-MM-DD. Defaults to empty so the user picks one. */
  defaultDate?: string;
  /** When set, the ticket is linked to this transaction (the reference is added to the remark). */
  transactionReference?: string;
  submitLabel?: string;
  /** Lay the fields out in one column (for narrow places like a modal). */
  compact?: boolean;
  onSent?: (receipt: SupportReceipt) => void;
}

/** Sends POST /api/individual/support/enquiries and shows the tracking reference. */
export default function SupportEnquiryForm({
  enquiryTypes,
  loadingTypes,
  defaultEnquiryType = '',
  defaultRequestType = 'ENQUIRY',
  defaultDate = '',
  transactionReference,
  submitLabel = 'Send Enquiry',
  compact,
  onSent,
}: SupportEnquiryFormProps) {
  const createEnquiry = useCreateSupportEnquiry();
  const [receipt, setReceipt] = useState<SupportReceipt | null>(null);
  // One key per enquiry: a retry after a failed attempt reuses it, a new enquiry gets a fresh one.
  const keyRef = useRef(newIdempotencyKey());

  // Memoised so `enableReinitialize` only resets the form when the enquiry types arrive, not on every render.
  const typesKey = enquiryTypes.join('|');
  const initialValues = useMemo<EnquiryValues>(
    () => ({
      enquiryType: typesKey.split('|').includes(defaultEnquiryType) ? defaultEnquiryType : '',
      date: defaultDate,
      remark: '',
      requestType: defaultRequestType,
    }),
    [typesKey, defaultEnquiryType, defaultDate, defaultRequestType]
  );

  const handleSubmit = async (values: EnquiryValues, { resetForm }: FormikHelpers<EnquiryValues>) => {
    const text = values.remark.trim();
    const remark = transactionReference ? `Transaction reference: ${transactionReference}\n\n${text}` : text;
    try {
      const result = await createEnquiry.mutateAsync({
        enquiryType: values.enquiryType,
        date: values.date,
        remark,
        requestType: values.requestType,
        idempotencyKey: keyRef.current,
      });
      keyRef.current = newIdempotencyKey();
      resetForm({ values: initialValues });
      setReceipt(result);
      onSent?.(result);
    } catch {
      // The axios interceptor already shows the error toast; keep the values so the user can retry.
    }
  };

  return (
    <div>
      {receipt && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-tone-90 bg-tone-21 px-4 py-4" aria-live="polite">
          <div className="flex min-w-0 items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-392" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-tone-744">We&apos;ve received your request</p>
              <p className="mt-1 text-xs text-ink-510">
                Your tracking reference is <span className="break-all font-mono font-medium text-tone-744">{receipt.reference}</span>
              </p>
            </div>
          </div>
          <Link href={ticketHref(receipt.ticketId)} className="shrink-0 rounded-md border border-tone-98 bg-surface px-3.5 py-2 text-xs font-medium text-tone-744 transition hover:bg-slate-50">
            View ticket
          </Link>
        </div>
      )}

      <Formik<EnquiryValues> initialValues={initialValues} validationSchema={enquirySchema} onSubmit={handleSubmit} enableReinitialize>
        <Form noValidate>
          {transactionReference && (
            <div className="mb-5 flex items-center gap-2 rounded-lg bg-tone-48 px-3.5 py-2.5 text-xs text-ink-660">
              <Link2 className="h-4 w-4 shrink-0 text-info-450" />
              <span className="min-w-0">
                Linked to transaction <span className="break-all font-mono font-medium">{transactionReference}</span>
              </span>
            </div>
          )}

          <RequestTypeField name="requestType" />

          <div className={`mt-5 grid gap-5 ${compact ? '' : 'md:grid-cols-2'}`}>
            <SelectField
              name="enquiryType"
              id="enquiry-type"
              label="Enquiry Type"
              required
              variant="dashboard"
              disabled={loadingTypes}
              placeholder={loadingTypes ? 'Loading…' : 'Select enquiry type'}
              options={enquiryTypes.map((type) => ({ value: type, label: humanizeEnum(type) }))}
            />
            <DateField name="date" id="enquiry-date" label="Date of incident" required variant="dashboard" maxDate={todayIso()} />
          </div>

          <TextAreaField
            name="remark"
            id="enquiry-remark"
            label="Remark"
            required
            variant="dashboard"
            placeholder={transactionReference ? 'Tell us what went wrong with this transaction' : 'Enter Remark'}
            rows={4}
            maxLength={REMARK_MAX}
            className="mt-5"
          />

          <div className="mt-6 flex items-center justify-end gap-4">
            <SubmitButton variant="primary" loadingLabel="Sending…">
              {submitLabel}
            </SubmitButton>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
