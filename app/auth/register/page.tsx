'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { TextField, PasswordField, CheckboxField, SubmitButton } from '@/components/forms';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import StepIndicator from '@/components/auth/StepIndicator';
import OtpInput from '@/components/auth/OtpInput';
import PasswordStrength from '@/components/auth/PasswordStrength';

/* ─── Step schemas ─────────────────────────────────────────────── */
const step1Schema = Yup.object({
  fullName: Yup.string().trim().min(2, 'Name is too short').required('Full name is required'),
  email: Yup.string().trim().email('Enter a valid email address').required('Email is required'),
  phone: Yup.string()
    .trim()
    .min(7, 'Phone number is too short')
    .required('Phone number is required'),
  agreeTerms: Yup.boolean().oneOf([true], 'You must agree to the Terms of Service').required(),
});

const step3Schema = Yup.object({
  password: Yup.string()
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'At least 1 uppercase letter')
    .matches(/[0-9]/, 'At least 1 number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

/* ─── Shared button style ───────────────────────────────────────── */
const BTN =
  'w-full rounded-xl bg-[#F5A56B] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,165,107,0.3)] transition-colors hover:bg-[#FF8A4C] active:scale-[0.99] disabled:opacity-50';

/* ─── Phone input ───────────────────────────────────────────────── */
function PhoneInputField({ name, ...rest }: { name: string; [k: string]: unknown }) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#1C1C1C]">
        Phone Number <span className="text-[#FF6500]">*</span>
      </label>
      <div
        className={`flex items-center rounded-xl border bg-white px-4 py-3.5 transition focus-within:ring-1 ${
          hasError
            ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500'
            : 'border-[#E8E4DE] focus-within:border-[#FF6500] focus-within:ring-[#FF6500]'
        }`}
      >
        <span className="mr-2 select-none text-sm font-medium text-slate-600">+234</span>
        <input
          {...field}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          type="tel"
          inputMode="numeric"
          placeholder="_ _ _ _ _ _ _ _ _"
          aria-invalid={hasError}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>
      {hasError && <p className="mt-1.5 text-xs text-rose-600">{meta.error}</p>}
    </div>
  );
}

/* ─── Saved step-1 data ─────────────────────────────────────────── */
interface Step1Data {
  fullName: string;
  email: string;
  phone: string;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({ fullName: '', email: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCount, setResendCount] = useState(52);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdName, setCreatedName] = useState('');

  /* Countdown timer (starts when step 2 mounts) */
  const startCountdown = useCallback(() => {
    setResendCount(52);
    const id = setInterval(() => {
      setResendCount((n) => {
        if (n <= 1) {
          clearInterval(id);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid min-h-screen bg-[#F7F4EF] lg:grid-cols-2">
      <AuthBrandPanel />

      {/* ── Right panel ── */}
      <main className="flex min-h-screen flex-col bg-[#F7F4EF] px-5 py-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="w-full max-w-[460px]">
            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            {/* ══ STEP 1 ══════════════════════════════════════════ */}
            {step === 1 && (
              <>
                <div className="mb-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF6500]">
                    STEP 1
                  </p>
                  <h1 className="mt-1 text-[1.6rem] font-bold tracking-tight text-[#111111]">
                    Create your account
                  </h1>
                  <p className="mt-1.5 text-[13px] text-slate-500">
                    Join Hasito today. It takes few minutes to set up your profile
                  </p>
                </div>

                <Formik
                  initialValues={{
                    fullName: step1Data.fullName,
                    email: step1Data.email,
                    phone: step1Data.phone,
                    agreeTerms: false as boolean,
                  }}
                  validationSchema={step1Schema}
                  onSubmit={(values) => {
                    setStep1Data({
                      fullName: values.fullName,
                      email: values.email,
                      phone: values.phone,
                    });
                    setStep(2);
                    // start countdown after brief delay (let step 2 mount)
                    setTimeout(startCountdown, 100);
                  }}
                >
                  <Form className="space-y-4" noValidate>
                    <TextField
                      name="fullName"
                      label="Full Name"
                      required
                      variant="auth"
                      placeholder="e.g. Mayowa Babs"
                    />
                    <TextField
                      name="email"
                      type="email"
                      label="Email Address"
                      required
                      variant="auth"
                      placeholder="e.g. alexandra@example.com"
                      autoComplete="email"
                    />
                    <PhoneInputField name="phone" />

                    <CheckboxField
                      name="agreeTerms"
                      variant="auth"
                      label={
                        <>
                          I agree to the{' '}
                          <Link href="/terms" className="font-semibold text-slate-900 underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href="/privacy" className="font-semibold text-slate-900 underline">
                            Privacy Policy
                          </Link>
                          .
                        </>
                      }
                    />

                    <SubmitButton className={BTN}>Continue</SubmitButton>
                  </Form>
                </Formik>

                <p className="mt-5 text-center text-[13px] text-slate-500">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[#FF6500] hover:text-[#E84D15]"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            )}

            {/* ══ STEP 2 ══════════════════════════════════════════ */}
            {step === 2 && (
              <>
                <div className="mb-8 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF6500]">
                    STEP 2
                  </p>
                  <h1 className="mt-1 text-[1.6rem] font-bold tracking-tight text-[#111111]">
                    Phone Number Verification
                  </h1>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                    An OTP (One-Time Password) has been sent to your phone number.
                    <br />
                    Enter OTP below to verify your phone number.
                  </p>
                </div>

                {otpError && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-center text-xs text-rose-600">
                    {otpError}
                  </div>
                )}

                <OtpInput
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    setOtpError('');
                  }}
                  hasError={Boolean(otpError)}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (otp.length < 6) {
                      setOtpError('Please enter the 6-digit code sent to your phone.');
                      return;
                    }
                    // Mock verify — accept any 6-digit code
                    setOtpVerified(true);
                    setStep(3);
                  }}
                  className={`${BTN} mt-8`}
                >
                  Verify
                </button>

                <p className="mt-5 text-center text-[13px] text-slate-500">
                  Resend code in {resendCount}s?{' '}
                  <button
                    type="button"
                    disabled={resendCount > 0}
                    onClick={() => {
                      setOtp('');
                      startCountdown();
                    }}
                    className="font-semibold text-[#FF6500] hover:text-[#E84D15] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Click to resend code
                  </button>
                </p>
              </>
            )}

            {/* ══ STEP 3 ══════════════════════════════════════════ */}
            {step === 3 && (
              <>
                <div className="mb-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF6500]">
                    STEP 3
                  </p>
                  <h1 className="mt-1 text-[1.6rem] font-bold tracking-tight text-[#111111]">
                    Create Password
                  </h1>
                  <p className="mt-1.5 text-[13px] text-slate-500">
                    Choose a password that you will use to log in to your Hatiso account
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600">
                    {error}
                  </div>
                )}

                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={step3Schema}
                  onSubmit={async (values) => {
                    clearError();
                    try {
                      await register({
                        fullName: step1Data.fullName,
                        email: step1Data.email,
                        phone: step1Data.phone,
                        accountType: 'personal',
                        password: values.password,
                      });
                      setCreatedName(step1Data.fullName.split(' ')[0]);
                      setShowSuccess(true);
                    } catch {
                      // Handled in store
                    }
                  }}
                >
                  {({ values }) => (
                    <Form className="space-y-4" noValidate>
                      <PasswordField
                        name="password"
                        label="Password"
                        required
                        variant="auth"
                        placeholder="••••••••••"
                        autoComplete="new-password"
                      />

                      <PasswordField
                        name="confirmPassword"
                        label="Password"
                        required
                        variant="auth"
                        placeholder="••••••••••"
                        autoComplete="new-password"
                      />

                      {/* Strength indicator */}
                      {values.password && <PasswordStrength password={values.password} />}

                      <SubmitButton
                        disabled={isLoading}
                        className={`${BTN} mt-2`}
                        loadingLabel={
                          <span className="inline-flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creating account...
                          </span>
                        }
                      >
                        Create Password
                      </SubmitButton>
                    </Form>
                  )}
                </Formik>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ══ SUCCESS MODAL ═══════════════════════════════════════════ */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl">
            {/* Green check */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" strokeWidth={2.2} />
            </div>

            <h2 className="text-xl font-bold text-[#111111]">
              Welcome aboard, {createdName}.
            </h2>
            <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-relaxed text-slate-500">
              Your Hatiso account is all set. Step into your dashboard and discover what&apos;s
              waiting for you.
            </p>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="mt-7 w-full rounded-xl bg-[#FF6500] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#E84D15] active:scale-[0.99]"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
