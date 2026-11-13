'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/marketplace/Navbar';
import Footer from '@/components/marketplace/Footer';
import CtaBanner from '@/components/marketplace/CtaBanner';
import { TextField, PhoneField, TextAreaField, SubmitButton } from '@/components/forms';
import {
  BentoTiles,
  DarkHero,
  FeatureRow,
  HeroHeadline,
  HeroLead,
  HeroPillInput,
  LandingPage,
  LpIcon,
  type LpIconName,
  ProviderRow,
} from '@/components/landing/LandingKit';
import { contactSchema, ContactFormValues } from '@/lib/validation/schemas';

const SUPPORT_EMAIL = 'Support@untitledUI.com';
const SALES_EMAIL = 'Xnett@untitledUI.com';
const PHONE_DISPLAY = '09 1358 4893 39';
const PHONE_HREF = 'tel:091358489339';
const MAP_HREF = 'https://maps.google.com/?q=Lagos,+Nigeria';

const CHANNELS: { icon: LpIconName; title: string; body: string; label: string; href: string; external?: boolean }[] = [
  { icon: 'chat', title: 'Sales', body: 'Interested in switching? Speak to our friendly team', label: SALES_EMAIL, href: `mailto:${SALES_EMAIL}` },
  { icon: 'mail', title: 'Email support', body: "Email us and we'll get back to you within 24 hours.", label: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
  { icon: 'call', title: 'Call us', body: 'Mon- Fri, 9:00 AM - 5:00 PM (UTC/GMT +10:00)', label: PHONE_DISPLAY, href: PHONE_HREF },
  { icon: 'location', title: 'Location', body: 'View our office Mon - Fri, 9:00 AM - 5:00 PM', label: 'Lagos, Nigeria', href: MAP_HREF, external: true },
];

/** Tilted contact cards on the right of the hero. */
const HERO_CARDS = [
  { tag: 'Email support', value: SUPPORT_EMAIL, body: "Email us and we'll get back to you within 24 hours.", href: `mailto:${SUPPORT_EMAIL}`, r: '-1deg', d: '0.4s', f: '7.4s', indent: false, orange: false },
  { tag: 'Call us', value: PHONE_DISPLAY, body: 'Mon- Fri, 9:00 AM - 5:00 PM (UTC/GMT +10:00)', href: PHONE_HREF, r: '1deg', d: '0.55s', f: '7.55s', indent: true, orange: false },
  { tag: 'Location', value: 'Lagos, Nigeria', body: 'View our office Mon - Fri, 9:00 AM - 5:00 PM', href: MAP_HREF, r: '-0.8deg', d: '0.7s', f: '7.7s', indent: false, orange: true },
];

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [heroEmail, setHeroEmail] = useState('');
  // Bumped when the hero's "Get in touch" carries an email into the form
  const [formVersion, setFormVersion] = useState(0);

  const goToForm = () => {
    if (heroEmail.trim()) {
      setIsSubmitted(false);
      setFormVersion((v) => v + 1);
    }
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('businessName')?.focus({ preventScroll: true }), 450);
  };

  const initialValues: ContactFormValues = { businessName: '', email: heroEmail.trim(), phone: '', message: '' };

  return (
    <LandingPage>
      <main className="flex-1">
        <DarkHero>
          <Navbar />
          <section className="relative mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-14 px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
            <div className="min-w-0 flex-[1_1_560px]">
              <HeroHeadline lines={[{ text: "Let's build" }, { text: 'with you', accent: true }]} />
              <HeroLead>Questions, support, or partnership enquiries. Our team replies within one business day.</HeroLead>
              <HeroPillInput
                icon="mail"
                label="Your email"
                action="Get in touch"
                onAction={goToForm}
                inputProps={{
                  id: 'qm',
                  type: 'email',
                  autoComplete: 'email',
                  placeholder: 'Enter your email address',
                  value: heroEmail,
                  onChange: (e) => setHeroEmail(e.target.value),
                }}
              />
              <ProviderRow label="Talk to" items={['Sales', 'Support', 'Partners']} />
            </div>

            <div className="relative flex min-w-0 flex-[1_1_400px] flex-col gap-4">
              {HERO_CARDS.map((card) => (
                <a
                  key={card.tag}
                  href={card.href}
                  {...(card.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`lp-card relative z-[1] block rounded-[28px] border border-[#2A3740] p-6 transition-[filter] hover:brightness-110 ${
                    card.orange ? 'bg-[#EE6E2D] text-[#14252E]' : 'bg-[#10202A] text-white'
                  } ${card.indent ? 'sm:ml-10' : ''}`}
                  style={{ '--r': card.r, '--d': card.d, '--f': card.f } as React.CSSProperties}
                >
                  <div className={`text-sm font-bold ${card.orange ? 'text-[#14252E]' : 'text-[#FFB27A]'}`}>{card.tag}</div>
                  <div className="mt-2 break-words text-xl font-extrabold leading-[1.25] sm:text-[22px]">{card.value}</div>
                  <div className={`mt-1.5 text-sm ${card.orange ? 'text-[#3A2414]' : 'text-[#9AA8B0]'}`}>{card.body}</div>
                </a>
              ))}
            </div>
          </section>
          <FeatureRow
            items={[
              { icon: 'mail', title: 'Sales', body: 'Interested in switching? Speak to our friendly team' },
              { icon: 'shield', title: 'Email support', body: "We'll get back to you within 24 hours." },
              { icon: 'phone', title: 'Call us', body: 'Mon- Fri, 9:00 AM - 5:00 PM' },
              { icon: 'pin', title: 'Location', body: 'Lagos, Nigeria' },
            ]}
          />
        </DarkHero>

        <section className="bg-white text-[#233C49]">
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-12 px-4 pb-24 pt-20 sm:px-6 lg:gap-[72px]">
            <div id="contact-form" className="lp-reveal min-w-0 flex-[1_1_460px] scroll-mt-6 rounded-3xl bg-[#F4F6F7] p-6 sm:p-9">
              <h2 className="m-0 mb-6 text-[26px] font-extrabold tracking-[-0.5px] sm:text-[30px]">Contact our team</h2>

              {isSubmitted ? (
                <div className="rounded-2xl bg-white p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F4EC] text-[#2B8A57]">
                    <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#10202A]">Message sent</h3>
                  <p className="mt-1.5 text-sm text-[#4A5B64]">
                    Thank you for reaching out, {submittedName || 'there'}. Our team will review your enquiry and get back
                    to you within one business day.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#EE6E2D] px-5 py-3 text-sm font-bold text-[#14252E] transition hover:bg-[#F48245]"
                  >
                    Send another message
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Formik
                  key={formVersion}
                  initialValues={initialValues}
                  validationSchema={contactSchema}
                  onSubmit={async (values, helpers) => {
                    await new Promise((r) => setTimeout(r, 900));
                    setSubmittedName(values.businessName);
                    setIsSubmitted(true);
                    setHeroEmail('');
                    helpers.resetForm();
                  }}
                >
                  <Form className="flex flex-col gap-[22px]" noValidate>
                    <TextField name="businessName" label="Business Name" placeholder="Enter your business name" />
                    <TextField name="email" type="email" label="Email" placeholder="Enter your email address" autoComplete="email" />
                    <PhoneField name="phone" label="Phone number" placeholder="80-000-0000" />
                    <TextAreaField name="message" label="Message" placeholder="Leave us a message..." rows={5} />
                    <SubmitButton
                      className="rounded-full bg-[#EE6E2D] px-6 py-[17px] text-base font-bold text-[#14252E] transition hover:bg-[#F48245] active:scale-[0.99] disabled:opacity-70"
                      loadingLabel="Sending message..."
                    >
                      Send Message
                    </SubmitButton>
                  </Form>
                </Formik>
              )}
            </div>

            <div className="min-w-0 flex-[1_1_380px] border-t-2 border-[#233C49]">
              {CHANNELS.map((c, i) => (
                <div key={c.title} className={`flex gap-4 py-6 ${i < CHANNELS.length - 1 ? 'border-b border-[#E3E8EB]' : ''}`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EE6E2D] text-[#14252E]">
                    <LpIcon name={c.icon} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="m-0 text-[19px] font-bold">{c.title}</h3>
                    <p className="mb-2.5 mt-1.5 text-[15px] leading-[1.55] text-[#4A5B64]">{c.body}</p>
                    <a
                      href={c.href}
                      {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="break-words text-base font-semibold text-[#C2531C] underline decoration-[#F49A66] underline-offset-4 transition-colors hover:text-[#10202A]"
                    >
                      {c.label}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BentoTiles
          label="Put your services in front of every Hatiso user"
          content={{
            hero: {
              title: 'Put your services in front of every Hatiso user',
              body: 'Onboard your business onto Hatiso and reach people already looking for services like yours.',
              action: { label: 'Contact Us', onClick: goToForm },
              cards: ['Sales', 'Support', 'Partners'],
            },
            orbit: {
              title: 'Email support',
              body: "Email us and we'll get back to you within 24 hours.",
              labels: ['Email', 'Call', 'Lagos', 'Mon - Fri'],
            },
            stats: [
              { tag: 'Replies', value: '24h', caption: 'for email support' },
              { tag: 'Office', value: 'Lagos', caption: 'Mon - Fri, 9:00 AM - 5:00 PM' },
            ],
          }}
        />

        <CtaBanner />
      </main>
      <Footer />
    </LandingPage>
  );
}
