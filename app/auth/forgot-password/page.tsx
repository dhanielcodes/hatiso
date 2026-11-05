'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { Check, ArrowLeft } from 'lucide-react';
import { PasswordField, SubmitButton } from '@/components/forms';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import XnettLogo from '@/components/auth/XnettLogo';
import OtpInput from '@/components/auth/OtpInput';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { forgotPassword, recoverPassword } from '@/lib/api/passwordRecovery';

/* ─── Constants ─────────────────────────────────────────────────── */
const OTP_LENGTH = 6;
const RESEND_SECONDS = 52;

/* ─── Validation Schemas ────────────────────────────────────────── */
const step1Schema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email is required'),
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

/* ─── Helpers ───────────────────────────────────────────────────── */
const getErrorMessage = (err: unknown) =>
  (err as any)?.response?.data?.message ??
  (err as any)?.message ??
  'Something went wrong. Please try again.';

// The recover endpoint checks the code and sets the password in one call, so a bad or
// expired code only shows up at the last step. These messages send the user back to step 2.
const looksLikeCodeError = (message: string) => /code|otp|expired|invalid/i.test(message);

/* ─── Button Style ──────────────────────────────────────────────── */
const ORANGE_BTN =
  'w-full rounded-xl bg-[#FF6500] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,101,0,0.3)] transition-colors hover:bg-[#FF8A4C] active:scale-[0.99] disabled:opacity-50';

/* ─── Email input component ─────────────────────────────────────── */
function EmailInputField({ name }: { name: string }) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[13px] font-medium text-[#1C1C1C]">
        Email <span className="text-[#E95312]">*</span>
      </label>
      <div
        className={`flex items-center rounded-xl border bg-white px-4 py-3.5 transition focus-within:ring-1 ${hasError
          ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500'
          : 'border-[#E8E4DE] focus-within:border-[#E95312] focus-within:ring-[#E95312]'
          }`}
      >
        <input
          {...field}
          id={name}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
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
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCount, setResendCount] = useState(RESEND_SECONDS);
  const [isSending, setIsSending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* Countdown timer (single interval, cleaned up on unmount) */
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    stopCountdown();
    setResendCount(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setResendCount((n) => Math.max(n - 1, 0));
    }, 1000);
  }, [stopCountdown]);

  useEffect(() => {
    if (resendCount === 0) stopCountdown();
  }, [resendCount, stopCountdown]);

  useEffect(() => stopCountdown, [stopCountdown]);

  /* Step 2: the code is verified together with the new password in step 3 */
  const handleContinue = () => {
    if (otp.length < OTP_LENGTH) {
      setOtpError(`Please enter the ${OTP_LENGTH}-digit code sent to your email.`);
      return;
    }
    setOtpError('');
    setStep(3);
  };

  const handleResend = async () => {
    if (resendCount > 0 || isResending) return;
    setIsResending(true);
    try {
      await forgotPassword(email);
      setOtp('');
      setOtpError('');
      startCountdown();
      toast.success('A new code has been sent to your email.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsResending(false);
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
            {/* ══ STEP 1: ENTER EMAIL ════════════════════════════ */}
            {step === 1 && (
              <>
                <div className="mb-7 text-center">
                  <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111111] sm:text-[2rem]">
                    Reset your password
                  </h1>
                  <p className="mx-auto mt-2 max-w-[340px] text-[13px] leading-relaxed text-slate-500">
                    Enter your account email and we&apos;ll send you a 6-digit code to reset your
                    password.
                  </p>
                </div>

                <Formik
                  initialValues={{ email }}
                  validationSchema={step1Schema}
                  onSubmit={async (values) => {
                    const value = values.email.trim();
                    setIsSending(true);
                    try {
                      await forgotPassword(value);
                      setEmail(value);
                      setOtp('');
                      setOtpError('');
                      setStep(2);
                      startCountdown();
                      toast.success('We sent a code to your email.');
                    } catch (err) {
                      toast.error(getErrorMessage(err));
                    } finally {
                      setIsSending(false);
                    }
                  }}
                >
                  <Form className="space-y-5" noValidate>
                    <EmailInputField name="email" />

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
                      Send Code
                    </SubmitButton>
                  </Form>
                </Formik>

                <p className="mt-6 text-center text-[13px] text-slate-500">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[#E95312] transition-colors hover:text-[#E84D15]"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            )}

            {/* ══ STEP 2: ENTER CODE ═════════════════════════════ */}
            {step === 2 && (
              <>
                <div className="mb-8 text-center">
                  <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111111] sm:text-[2rem]">
                    Check your email
                  </h1>
                  <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-slate-500">
                    We sent a 6-digit code to <span className="font-medium text-slate-700">{email}</span>.
                    <br />
                    Enter it below to continue.
                  </p>
                </div>

                {otpError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-center text-xs text-rose-600"
                  >
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
                  disabled={otp.length < OTP_LENGTH}
                  onClick={handleContinue}
                  className={`${ORANGE_BTN} mt-8`}
                >
                  Continue
                </button>

                <p className="mt-5 text-center text-[13px] text-slate-500">
                  {resendCount > 0 ? `Resend code in ${resendCount}s ? ` : "Didn't get it? "}
                  <button
                    type="button"
                    disabled={resendCount > 0 || isResending}
                    onClick={handleResend}
                    className="font-semibold text-[#E95312] hover:text-[#E84D15] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isResending ? 'Sending...' : 'Click to resend code'}
                  </button>
                </p>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      stopCountdown();
                      setOtp('');
                      setOtpError('');
                      setStep(1);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Change email
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
                    Choose a password that you will use to log in to your Hatiso account
                  </p>
                </div>

                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={step3Schema}
                  onSubmit={async (values) => {
                    setIsSending(true);
                    try {
                      await recoverPassword({
                        email,
                        code: otp,
                        newPassword: values.password,
                      });
                      stopCountdown();
                      setShowSuccess(true);
                    } catch (err) {
                      const message = getErrorMessage(err);
                      if (looksLikeCodeError(message)) {
                        // Bad or expired code: send the user back to re-enter it
                        setOtp('');
                        setOtpError(message);
                        setStep(2);
                      } else {
                        toast.error(message);
                      }
                    } finally {
                      setIsSending(false);
                    }
                  }}
                >
                  {({ values }) => (
                    <Form className="space-y-4" noValidate>
                      <PasswordField
                        name="password"
                        label="New Password"
                        required
                        variant="auth"
                        placeholder="••••••••••"
                        autoComplete="new-password"
                      />

                      <PasswordField
                        name="confirmPassword"
                        label="Confirm Password"
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