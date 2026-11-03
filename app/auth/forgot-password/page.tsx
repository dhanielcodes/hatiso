'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { Check, ArrowLeft } from 'lucide-react';
import { PasswordField, SubmitButton } from '@/components/forms';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import XnettLogo from '@/components/auth/XnettLogo';
import OtpInput from '@/components/auth/OtpInput';
import PasswordStrength from '@/components/auth/PasswordStrength';

/* ─── Validation Schemas ────────────────────────────────────────── */
const step1Schema = Yup.object({
  phone: Yup.string()
    .trim()
    .min(7, 'Please enter a valid phone number')
    .required('Phone number is required'),
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

/* ─── Button Style ──────────────────────────────────────────────── */
const ORANGE_BTN =
  'w-full rounded-xl bg-[#FF6500] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,101,0,0.3)] transition-colors hover:bg-[#E84D15] active:scale-[0.99] disabled:opacity-50';

/* ─── Phone input component ─────────────────────────────────────── */
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
          placeholder="904 637 3748"
          aria-invalid={hasError}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>
      {hasError && <p className="mt-1.5 text-xs text-rose-600">{meta.error}</p>}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCount, setResendCount] = useState(52);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* Countdown timer */
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

  /* Step 2 verification */
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setOtpError('Please enter the 6-digit code sent to your phone number.');
      return;
    }
    setIsVerifying(true);
    setOtpError('');
    try {
      // Simulate verification step
      await new Promise((r) => setTimeout(r, 600));
      setStep(3);
    } catch {
      setOtpError('Invalid verification code. Please check and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#F7F4EF] lg:grid-cols-2">
      {/* ── Left Brand Panel ── */}
      <AuthBrandPanel />

      {/* ── Right Content Panel ── */}
      <main className="flex min-h-screen flex-col bg-[#F7F4EF] px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <div className="mb-8 lg:hidden">
          <XnettLogo />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-6">
          <div className="w-full max-w-[420px]">
            {/* ══ STEP 1: RESET YOUR PASSWORD ════════════════════ */}
            {step === 1 && (
              <>
                <div className="mb-7 text-center">
                  <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111111] sm:text-[2rem]">
                    Reset your password
                  </h1>
                  <p className="mx-auto mt-2 max-w-[340px] text-[13px] leading-relaxed text-slate-500">
                    Enter your account email and we&apos;ll send a reset link, along with an OTP to
                    your registered number to keep your account safe.
                  </p>
                </div>

                <Formik
                  initialValues={{ phone: phone || '' }}
                  validationSchema={step1Schema}
                  onSubmit={async (values) => {
                    setIsSending(true);
                    try {
                      setPhone(values.phone.trim());
                      await new Promise((r) => setTimeout(r, 600));
                      setStep(2);
                      startCountdown();
                    } finally {
                      setIsSending(false);
                    }
                  }}
                >
                  <Form className="space-y-5" noValidate>
                    <PhoneInputField name="phone" />

                    <SubmitButton
                      disabled={isSending}
                      className={ORANGE_BTN}
                      loadingLabel={
                        <span className="inline-flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending...
                        </span>
                      }
                    >
                      Send Link
                    </SubmitButton>
                  </Form>
                </Formik>

                <p className="mt-6 text-center text-[13px] text-slate-500">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[#FF6500] transition-colors hover:text-[#E84D15]"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            )}

            {/* ══ STEP 2: PHONE NUMBER VERIFICATION ══════════════ */}
            {step === 2 && (
              <>
                <div className="mb-8 text-center">
                  <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111111] sm:text-[2rem]">
                    Phone Number Verification
                  </h1>
                  <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-slate-500">
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
                  disabled={isVerifying || otp.length < 6}
                  onClick={handleVerifyOtp}
                  className={`${ORANGE_BTN} mt-8`}
                >
                  {isVerifying ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>

                <p className="mt-5 text-center text-[13px] text-slate-500">
                  Resend code in {resendCount}s ?{' '}
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

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOtp('');
                      setOtpError('');
                      setStep(1);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Change phone number
                  </button>
                </div>
              </>
            )}

            {/* ══ STEP 3: CREATE NEW PASSWORD ════════════════════ */}
            {step === 3 && (
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111111] sm:text-[2rem]">
                    Create New Password
                  </h1>
                  <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-slate-500">
                    Choose a password that you will use to log in to your Hasito account
                  </p>
                </div>

                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={step3Schema}
                  onSubmit={async () => {
                    setIsSending(true);
                    try {
                      await new Promise((r) => setTimeout(r, 700));
                      setShowSuccess(true);
                    } finally {
                      setIsSending(false);
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

                      {/* Password strength */}
                      {values.password && <PasswordStrength password={values.password} />}

                      <SubmitButton
                        disabled={isSending}
                        className={`${ORANGE_BTN} mt-4`}
                        loadingLabel={
                          <span className="inline-flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Updating password...
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl">
            <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-[#111111]">
              Password Reset Successful
              <Check className="h-5 w-5 text-emerald-500 stroke-[3]" />
            </h2>
            <p className="mx-auto mt-2 max-w-[280px] text-[13px] leading-relaxed text-slate-500">
              Your password has been updated. You can now log in with your new password.
            </p>

            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className={`${ORANGE_BTN} mt-7`}
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

