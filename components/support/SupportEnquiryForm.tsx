'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Check } from 'lucide-react';
import { DateField, SelectField, SubmitButton, TextAreaField, TextField, useFormField } from '@/components/forms';
import { newIdempotencyKey, type SupportReceipt } from '@/lib/api/support';
import { useCreateSupportEnquiry } from '@/lib/queries/useSupport';
import { humanizeEnum, ticketHref, todayIso } from './supportDisplay';

type RequestType = 'ENQUIRY' | 'COMPLAINT';
type EnquiryValues = { enquiryType: string; date: string; remark: string; requestType: RequestType; reference: string };

const REMARK_MAX = 10_000;

const enquirySchema = Yup.object({
  enquiryType: Yup.string().required('Choose a topic.'),
  date: Yup.string().required('Pick the date it happened.'),
  reference: Yup.string().trim().max(80, 'That reference looks too long.'),
  remark: Yup.string().trim().required('Tell us what happened.').max(REMARK_MAX, 'Keep it under 10,000 characters.'),
  requestType: Yup.mixed<RequestType>().oneOf(['ENQUIRY', 'COMPLAINT']).required(),
});

const REQUEST_TYPES: { value: RequestType; label: string }[] = [
  { value: 'ENQUIRY', label: 'Question' },
  { value: 'COMPLAINT', label: 'Complaint' },
];

function RequestTypeField({ name }: { name: string }) {
  const { field, setValue } = useFormField<RequestType>(name);
  return (
    <div role="radiogroup" aria-label="Request type" className="inline-flex self-start rounded-[10px] bg-tone-44 p-1">
        {REQUEST_TYPES.map((option) => {
          const active = field.value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setValue(option.value)}
              className={`min-h-9 rounded-lg px-4 text-sm font-medium transition ${active ? 'bg-surface text-tone-744 shadow-[0_1px_3px_rgba(18,21,26,0.15)]' : 'text-tone-414 hover:text-tone-744'}`}
            >
              {option.label}
            </button>
          );
        })}
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
  /** Shows a Cancel button beside submit (used in the TxnHelp modal). */
  onCancel?: () => void;
  /** The parent shows its own success view, so skip the inline "Sent." line. */
  hideReceipt?: boolean;
}

/** Sends POST /api/individual/support/enquiries and shows the tracking reference. */
export default function SupportEnquiryForm({
  enquiryTypes,
  loadingTypes,
  defaultEnquiryType = '',
  defaultRequestType = 'ENQUIRY',
  defaultDate = '',
  transactionReference,
  submitLabel = 'Send request',
  compact,
  onSent,
  onCancel,
  hideReceipt,
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
      reference: '',
    }),
    [typesKey, defaultEnquiryType, defaultDate, defaultRequestType]
  );

  const handleSubmit = async (values: EnquiryValues, { resetForm }: FormikHelpers<EnquiryValues>) => {
    const text = values.remark.trim();
    const ref = transactionReference || values.reference.trim();
    const remark = ref ? `Transaction reference: ${ref}\n\n${text}` : text;
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
      {receipt && !hideReceipt && (
        <div role="status" className="hz-pop mb-5 flex flex-wrap items-center gap-3 rounded-[10px] bg-tone-44 px-4 py-3 text-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-305 text-on-brand">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="font-semibold">Sent.</span> <span className="break-all font-medium">{receipt.reference}</span> is open. We&apos;ll reply by email.
          </span>
          <Link href={ticketHref(receipt.ticketId)} className="shrink-0 text-sm font-medium underline underline-offset-4">
            View request
          </Link>
        </div>
      )}

      <Formik<EnquiryValues> initialValues={initialValues} validationSchema={enquirySchema} onSubmit={handleSubmit} enableReinitialize>
        <Form noValidate className="flex flex-col gap-4">
          <RequestTypeField name="requestType" />

          <div className={`grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
            <SelectField
              name="enquiryType"
              id="enquiry-type"
              label={transactionReference ? 'What went wrong?' : 'Topic'}
              required
              variant="dashboard"
              disabled={loadingTypes}
              placeholder={loadingTypes ? 'Loading…' : 'Choose a topic'}
              options={enquiryTypes.map((type) => ({ value: type, label: humanizeEnum(type) }))}
            />
            <DateField name="date" id="enquiry-date" label="Date it happened" required variant="dashboard" maxDate={todayIso()} />
          </div>

          {transactionReference ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-tone-744">
              Payment reference
              <input readOnly value={transactionReference} className="min-h-12 rounded-lg border border-tone-100 bg-tone-44 px-3.5 text-[15px] font-normal text-tone-414 outline-none" />
            </label>
          ) : (
            <TextField name="reference" id="enquiry-reference" label="Payment reference (optional)" variant="dashboard" placeholder="e.g. HTS-24112573" />
          )}

          <TextAreaField
            name="remark"
            id="enquiry-remark"
            label="Tell us more"
            required
            variant="dashboard"
            placeholder={transactionReference ? 'Tell us what went wrong with this payment.' : 'What happened? Add the amount and the number or meter you paid for.'}
            rows={4}
            maxLength={REMARK_MAX}
          />

          <div className="flex items-center justify-end gap-2.5">
            {onCancel && (
              <button type="button" onClick={onCancel} className="hz-press inline-flex min-h-11 items-center rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium text-tone-744 hover:border-tone-414">
                Cancel
              </button>
            )}
            <SubmitButton variant="primary" loadingLabel="Sending…">
              {submitLabel}
            </SubmitButton>
          </div>
        </Form>
      </Formik>
    </div>
  );
}
