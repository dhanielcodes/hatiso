'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Mail, MapPin, Phone } from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';
import { TextField, PhoneField, TextAreaField, SelectField, SubmitButton } from '@/components/forms';
import { contactSchema, ContactFormValues } from '@/lib/validation/schemas';
import { TENANT_TYPES, buildExpressionOfInterest } from '@/lib/api/expressionsOfInterest';
import { useSubmitExpressionOfInterest } from '@/lib/queries/useExpressionsOfInterest';

const rise = (d: number) => ({ '--d': d }) as React.CSSProperties;

const TOPICS = [
  { id: 'support', label: 'Help with a payment', placeholder: 'Tell us what you paid for, the amount, and roughly when.' },
  { id: 'account', label: 'My account', placeholder: 'Tell us what you need help with on your account.' },
  { id: 'business', label: 'Sell on Hatiso', placeholder: 'Tell us about your business and what you sell.' },
  { id: 'bank', label: 'Bank partnership', placeholder: 'Tell us about your bank and who we should talk to.' },
];

const CHANNELS = [
  {
    Icon: Mail,
    title: 'Email support',
    line: 'For payments, receipts and your account.',
    value: 'Support@untitledUI.com',
    href: 'mailto:Support@untitledUI.com',
  },
  {
    Icon: Phone,
    title: 'Call us',
    line: 'Speak to the support team.',
    value: '09 1358 4893 39',
    href: 'tel:091358489339',
  },
  {
    Icon: MapPin,
    title: 'Visit us',
    line: 'Our office, by appointment.',
    value: 'Lagos, Nigeria',
    href: 'https://maps.google.com/?q=Lagos,+Nigeria',
    external: true,
  },
];

const TIPS = [
  { title: "Payment didn't land?", body: 'Add the amount, time and phone or meter number so we can find it fast.' },
  { title: 'Bank login trouble?', body: 'Contact your bank directly. Hatiso never sees your bank login.' },
  { title: 'Never share your PIN', body: 'We will never ask for your password, PIN or one-time code.' },
];

const initialValues: ContactFormValues = {
  topic: 'support',
  contactName: '',
  contactRole: '',
  email: '',
  phone: '',
  organisation: '',
  tenantType: '',
  country: 'Nigeria',
  website: '',
  message: '',
};

const optional = (label: string) => (
  <>
    {label} <span className="font-normal text-grey-600">(optional)</span>
  </>
);

/** Contact board. The form is sent to POST /api/public/expressions-of-interest; the confirmation shows once it's accepted. */
export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = useSubmitExpressionOfInterest();

  return (
    <div className="flex min-h-screen flex-col bg-cloud text-carbon selection:bg-silver selection:text-carbon">
      <Navbar />

      {/* Hero */}
      <section className="bg-carbon text-cloud">
        <div className="mx-auto flex max-w-7xl justify-center px-[clamp(16px,4vw,56px)] pt-[clamp(64px,9vw,128px)] pb-[clamp(64px,8vw,112px)]">
          <div className="flex w-full max-w-[820px] flex-col items-center gap-6 text-center">
            <p className="hz-rise hz-eyebrow text-grey-400">Contact</p>
            <h1
              className="hz-rise max-w-[760px] text-[clamp(40px,6vw,76px)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance"
              style={rise(1)}
            >
              Talk to a person, <span className="text-highlight">not a bot.</span>
            </h1>
            <p className="hz-rise max-w-[580px] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-pretty text-silver" style={rise(2)}>
              A payment that didn&apos;t land, a question about your account, or a business that wants to sell on
              Hatiso. Tell us what&apos;s going on and our team will get back to you.
            </p>
            <a
              href="#message"
              className="hz-rise hz-press inline-flex min-h-[52px] items-center gap-2.5 rounded-[10px] bg-cloud px-[26px] text-[15px] font-medium text-carbon hover:bg-white"
              style={rise(3)}
            >
              Send a message
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Ways to reach us */}
      <section>
        <div className="mx-auto max-w-7xl px-[clamp(16px,4vw,56px)] pt-[clamp(48px,6vw,80px)]">
          <div className="hz-stagger grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
            {CHANNELS.map(({ Icon, title, line, value, href, external }) => (
              <a
                key={title}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="hz-lift flex min-h-[196px] flex-col gap-6 rounded-xl border border-grey-100 bg-white p-6"
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-carbon text-cloud">
                    <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <ArrowUpRight className="hz-arrow h-5 w-5 text-grey-500" aria-hidden="true" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-[19px] font-semibold tracking-[-0.01em]">{title}</span>
                  <span className="text-sm leading-normal text-grey-600">{line}</span>
                  <span className="pt-1.5 text-[15px] font-medium">{value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="message" className="flex-1 scroll-mt-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-6 px-[clamp(16px,4vw,56px)] pt-6 pb-[clamp(64px,8vw,112px)]">
          <div className="hz-reveal min-w-0 flex-[999_1_560px] rounded-[14px] border border-grey-100 bg-white p-[clamp(20px,3vw,36px)]">
            {sent ? (
              <div role="status" className="hz-stagger flex min-h-[420px] flex-col items-start justify-center gap-4">
                <span aria-hidden="true" className="inline-flex h-14 w-14 items-center justify-center rounded-[10px] bg-status-success text-white">
                  <Check className="h-6 w-6" strokeWidth={2.6} />
                </span>
                <span className="text-[13px] font-medium text-status-success">Message sent</span>
                <h2 className="text-[32px] font-semibold tracking-[-0.02em]">Thanks, we&apos;ve got it.</h2>
                <p className="max-w-[440px] text-base leading-[1.6] text-grey-600">
                  Our team will reply to the email you gave us. If it&apos;s about a payment, keep your receipt handy.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="hz-press mt-2 min-h-12 rounded-[10px] border border-grey-150 bg-white px-[22px] text-[15px] font-medium hover:border-grey-400"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <Formik
                initialValues={initialValues}
                validationSchema={contactSchema}
                onSubmit={async (values, helpers) => {
                  try {
                    await submit.mutateAsync(buildExpressionOfInterest(values));
                    setSent(true);
                    helpers.resetForm();
                  } catch {
                    // The error toast comes from the API client; the form keeps what they typed.
                  }
                }}
              >
                {({ values, setFieldValue }) => {
                  const topic = TOPICS.find((t) => t.id === values.topic) ?? TOPICS[0];
                  return (
                    <Form className="flex flex-col gap-6" noValidate>
                      <div className="flex flex-col gap-2">
                        <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Send us a message</h2>
                        <p className="text-[15px] text-grey-600">Fields marked optional can be left blank.</p>
                      </div>

                      <fieldset className="flex flex-col gap-3">
                        <legend className="mb-3 text-sm font-medium">What&apos;s it about?</legend>
                        <div className="flex flex-wrap gap-2">
                          {TOPICS.map((t) => {
                            const on = values.topic === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                aria-pressed={on}
                                onClick={() => setFieldValue('topic', t.id)}
                                className={`hz-press min-h-10 rounded-[10px] border px-4 text-sm font-medium transition-colors ${
                                  on ? 'border-carbon bg-carbon text-cloud' : 'border-grey-150 bg-white text-carbon hover:border-grey-400'
                                }`}
                              >
                                {t.label}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>

                      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
                        <TextField name="contactName" label="Your name" placeholder="e.g. Ada Okafor" autoComplete="name" />
                        <TextField
                          name="contactRole"
                          label={optional('Your role')}
                          placeholder="e.g. Head of Payments"
                          autoComplete="organization-title"
                        />
                      </div>

                      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
                        <TextField name="email" type="email" label="Email address" placeholder="e.g. ada@example.com" autoComplete="email" />
                        <PhoneField name="phone" label={optional('Phone number')} dialCode="+234" placeholder="803 123 4567" />
                      </div>

                      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
                        <TextField name="organisation" label="Organisation" placeholder="e.g. Okafor Stores" autoComplete="organization" />
                        <SelectField
                          name="tenantType"
                          label="Organisation type"
                          placeholder="Choose a type"
                          options={TENANT_TYPES.map((t) => ({ value: t, label: t }))}
                        />
                      </div>

                      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-5">
                        <TextField name="country" label="Country" placeholder="e.g. Nigeria" autoComplete="country-name" />
                        <TextField
                          name="website"
                          type="url"
                          inputMode="url"
                          label={optional('Website')}
                          placeholder="e.g. example.com"
                          autoComplete="url"
                        />
                      </div>

                      <TextAreaField name="message" label="Message" placeholder={topic.placeholder} rows={5} />

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className="text-[13px] text-grey-600">We&apos;ll only use your details to reply to this message.</span>
                        <SubmitButton
                          className="hz-press inline-flex min-h-[52px] items-center gap-2.5 rounded-[10px] bg-carbon px-7 text-[15px] font-medium text-cloud hover:bg-graphite"
                          loadingLabel="Sending…"
                        >
                          Send message
                          <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
                        </SubmitButton>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            )}
          </div>

          <aside className="hz-reveal flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            <div className="flex flex-col gap-[18px] rounded-[14px] bg-carbon p-7 text-cloud">
              <p className="hz-eyebrow text-grey-400">Before you write</p>
              <ul className="flex flex-col border-t border-grey-800">
                {TIPS.map((tip) => (
                  <li key={tip.title} className="flex flex-col gap-1 border-b border-grey-800 py-3.5 last:border-b-0">
                    <span className="text-[15px] font-medium">{tip.title}</span>
                    <span className="text-sm leading-normal text-grey-400">{tip.body}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/auth/login"
              className="hz-lift flex items-center justify-between gap-3 rounded-xl border border-grey-100 bg-white px-6 py-5 text-[15px] font-medium"
            >
              Sign in to see your receipts
              <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
