'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';
import CtaBanner from '@/components/marketplace/CtaBanner';
import { TextField, PhoneField, TextAreaField, SelectField, SubmitButton } from '@/components/forms';
import { contactSchema, ContactFormValues } from '@/lib/validation/schemas';
import { TENANT_TYPES, buildExpressionOfInterest } from '@/lib/api/expressionsOfInterest';
import { useSubmitExpressionOfInterest } from '@/lib/queries/useExpressionsOfInterest';

const initialValues: ContactFormValues = {
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

/** Contact page. The form is sent to POST /api/public/expressions-of-interest; the confirmation shows once it's accepted. */
export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const submit = useSubmitExpressionOfInterest();

  return (
    <div className="min-h-screen bg-ink-662 text-white selection:bg-brand-361 selection:text-white flex flex-col justify-between">
      <div className="relative overflow-hidden bg-ink-662">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
          <svg
            className="absolute -top-32 -left-32 h-[800px] w-[1100px]"
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M -100 150 C 150 120, 250 320, 500 240 C 750 180, 850 380, 1100 320"
              stroke="#1E4757"
              strokeWidth="1.6"
            />
            <path
              d="M -100 280 C 180 230, 320 420, 600 360 C 880 300, 920 480, 1150 440"
              stroke="#1E4757"
              strokeWidth="1.6"
              strokeDasharray="6 8"
            />
          </svg>
        </div>

        <Navbar />

        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-8 pb-16 text-center sm:px-6 sm:pt-12 sm:pb-20">
          <p className="text-3xl font-bold text-brand-361 lg:text-6xl">Reach out</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Let&apos;s build with you
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Questions, support, or partnership enquiries, our team replies within one business day.
          </p>
        </div>
      </div>

      <section className="relative z-10 w-full bg-surface py-16 text-slate-900 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-14">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6 xl:col-span-6">
              <div className="w-full max-w-[500px] rounded-3xl border border-slate-200/60 bg-tone-56 px-6 pt-10 pb-20 shadow-xs sm:px-10 sm:pt-12 sm:pb-28">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mb-8">
                  Contact our team
                </h2>

                {isSubmitted ? (
                  <div className="my-8 rounded-2xl bg-surface p-8 text-center shadow-xs">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      Message Sent Successfully!
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 sm:text-sm">
                      Thank you for reaching out, {submittedName || 'there'}. Our team will review
                      your enquiry and get back to you within one business day.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-brand-318 px-5 py-2.5 text-xs font-bold text-on-brand shadow transition hover:bg-brand-385"
                    >
                      <span>Send Another Message</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={contactSchema}
                    onSubmit={async (values, helpers) => {
                      try {
                        await submit.mutateAsync(buildExpressionOfInterest(values));
                        setSubmittedName(values.contactName.trim());
                        setIsSubmitted(true);
                        helpers.resetForm();
                      } catch {
                        // The error toast comes from the API client; the form keeps what they typed.
                      }
                    }}
                  >
                    <Form className="space-y-6" noValidate>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <TextField name="contactName" label="Your name" placeholder="Enter your full name" autoComplete="name" />
                        <TextField
                          name="contactRole"
                          label={<>Your role <span className="font-normal text-slate-500">(optional)</span></>}
                          placeholder="e.g. Head of Payments"
                          autoComplete="organization-title"
                        />
                      </div>

                      <TextField
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="Enter your email address"
                        autoComplete="email"
                      />

                      <PhoneField
                        name="phone"
                        label="Phone number"
                        placeholder="80-000-0000"
                      />

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <TextField name="organisation" label="Organisation" placeholder="Enter your organisation" autoComplete="organization" />
                        <SelectField
                          name="tenantType"
                          label="Organisation type"
                          placeholder="Choose a type"
                          options={TENANT_TYPES.map((t) => ({ value: t, label: t }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <TextField name="country" label="Country" placeholder="Enter your country" autoComplete="country-name" />
                        <TextField
                          name="website"
                          type="url"
                          inputMode="url"
                          label={<>Website <span className="font-normal text-slate-500">(optional)</span></>}
                          placeholder="e.g. example.com"
                          autoComplete="url"
                        />
                      </div>

                      <TextAreaField
                        name="message"
                        label="Message"
                        placeholder="Leave us a message..."
                        rows={5}
                      />

                      <div className="pt-2">
                        <SubmitButton
                          className="w-full rounded-xl bg-brand-318 py-3.5 text-center text-sm font-bold text-on-brand shadow-md transition-all duration-200 hover:bg-brand-385 hover:shadow-lg active:scale-[0.99] disabled:opacity-50"
                          loadingLabel="Sending Message..."
                        >
                          Send Message
                        </SubmitButton>
                      </div>
                    </Form>
                  </Formik>
                )}
              </div>
            </div>

            <div className="space-y-12 pt-4 lg:col-span-6 xl:col-span-6 lg:pt-8 lg:pl-6">
              <div>
                <p className="text-sm font-normal text-slate-600">
                  Interested in switching? Speak to our friendly team
                </p>
                <a
                  href="mailto:Xnett@untitledUI.com"
                  className="mt-1.5 block text-base font-bold text-slate-900 underline underline-offset-4 decoration-slate-400 transition-colors hover:text-brand-318 hover:decoration-brand-318"
                >
                  Xnett@untitledUI.com
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Email support</h3>
                <p className="mt-1 text-sm font-normal text-slate-600">
                  Email us and we&apos;ll get back to you within 24 hours.
                </p>
                <a
                  href="mailto:Support@untitledUI.com"
                  className="mt-1.5 block text-base font-bold text-slate-900 underline underline-offset-4 decoration-slate-400 transition-colors hover:text-brand-318 hover:decoration-brand-318"
                >
                  Support@untitledUI.com
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Call us</h3>
                <p className="mt-1 text-sm font-normal text-slate-600">
                  Mon- Fri, 9:00 AM - 5:00 PM (UTC/GMT +10:00)
                </p>
                <a
                  href="tel:091358489339"
                  className="mt-1.5 block text-base font-bold text-slate-900 underline underline-offset-4 decoration-slate-400 transition-colors hover:text-brand-318 hover:decoration-brand-318"
                >
                  09 1358 4893 39
                </a>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Location</h3>
                <p className="mt-1 text-sm font-normal text-slate-600">
                  View our office Mon - Fri, 9:00 AM - 5:00 PM
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-900" />
                  <a
                    href="https://maps.google.com/?q=Lagos,+Nigeria"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-slate-900 underline underline-offset-4 decoration-slate-400 transition-colors hover:text-brand-318 hover:decoration-brand-318"
                  >
                    Lagos, Nigeria
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-ink-662">
        <CtaBanner secondaryButtonText="Sign in" secondaryButtonHref="/auth/login" />
        <Footer />
      </div>
    </div>
  );
}
