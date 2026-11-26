'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { Check, KeyRound, Mail } from 'lucide-react';
import { PasswordField, SubmitButton, TextField } from '@/components/forms';
import AuthLayout, { AUTH_ERROR, AUTH_LINK, AUTH_PRIMARY, AUTH_SECONDARY, AuthHeading } from '@/components/auth/AuthLayout';
import OtpInput from '@/components/auth/OtpInput';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { useForgotPassword, useRecoverPassword } from '@/lib/queries/useAuth';

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
// The axios interceptor rejects every failed request with `{ message, statusCode }`.
const getErrorMessage = (err: unknown) =>
  (err as { message?: string } | null)?.message || 'Something went wrong. Please try again.';

// The recover endpoint checks the code and sets the password in one call, so a bad or
// expired code only shows up at the last step. These messages send the user back to step 2.
const looksLikeCodeError = (message: string) => /code|otp|expired|invalid/i.test(message);

/* ─── Button Style ──────────────────────────────────────────────── */
const ORANGE_BTN = AUTH_PRIMARY;

export default function ForgotPasswordPage() {

  // 1 email · 2 code sent · 3 code + new password · 4 done (Forgot and ResetPassword boards)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCount, setResendCount] = useState(RESEND_SECONDS);
  const sendCode = useForgotPassword();
  const resendCode = useForgotPassword();
  const recover = useRecoverPassword();
  const isSending = sendCode.isPending || recover.isPending;
  const isResending = resendCode.isPending;

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

  const handleResend = async () => {
    if (resendCount > 0 || isResending) return;
    try {
      await resendCode.mutateAsync(email);
      setOtp('');
      setOtpError('');
      startCountdown();
      toast.success('A new code has been sent to your email.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
      <AuthLayout back={{ label: 'Back to sign in', href: '/auth/login' }}>
            {/* ══ STEP 1: ENTER EMAIL ════════════════════════════ */}
            {step === 1 && (
              <>
                <div className="flex flex-col gap-2.5">
                  <span aria-hidden="true" className="mb-1.5 inline-flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-carbon text-cloud"><KeyRound className="h-6 w-6" /></span>
                  <AuthHeading title="Reset your password.">
                    Enter the email on your account and we&apos;ll send you a code to set a new one.
                  </AuthHeading>
                </div>

                <Formik
                  initialValues={{ email }}
                  validationSchema={step1Schema}
                  onSubmit={async (values) => {
                    const value = values.email.trim();
                    try {
                      await sendCode.mutateAsync(value);
                      setEmail(value);
                      setOtp('');
                      setOtpError('');
                      setStep(2);
                      startCountdown();
                    } catch (err) {
                      toast.error(getErrorMessage(err));
                    }
                  }}
                >
                  <Form className="flex flex-col gap-5" noValidate>
                    <TextField
                      name="email"
                      type="email"
                      label="Email"
                      required
                      variant="auth"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="e.g. ada@example.com"
                    />

                    <SubmitButton
                      disabled={isSending}
                      className={ORANGE_BTN}
                      loadingLabel={
                        <span className="inline-flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-cloud border-t-transparent" />
                          Sending...
                        </span>
                      }
                    >
                      Send code
                    </SubmitButton>
                  </Form>
                </Formik>
              </>
            )}

            {/* ══ STEP 2: CODE SENT ══════════════════════════════ */}
            {step === 2 && (
              <>
                <div className="flex flex-col gap-2.5">
                  <span aria-hidden="true" className="mb-1.5 inline-flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-carbon text-cloud"><Mail className="h-6 w-6" /></span>
                  <span className="text-[13px] font-medium text-status-success">Code sent</span>
                  <AuthHeading title="Check your inbox.">
                    If there&apos;s an account for that email, a 6-digit code is on its way. Enter it on the next screen to
                    choose a new password.
                  </AuthHeading>
                </div>
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={() => setStep(3)} className={ORANGE_BTN}>
                    Enter code
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCountdown();
                      setOtp('');
                      setOtpError('');
                      setStep(1);
                    }}
                    className={AUTH_SECONDARY}
                  >
                    Use a different email
                  </button>
                </div>
              </>
            )}

            {/* ══ STEP 3: CODE + NEW PASSWORD ════════════════════ */}
            {step === 3 && (
              <>
                <AuthHeading title="Choose a new password.">
                  Enter the 6-digit code we sent to <span className="font-medium text-carbon">{email}</span>, then set a new
                  password.
                </AuthHeading>

                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={step3Schema}
                  onSubmit={async (values) => {
                    if (otp.length < OTP_LENGTH) {
                      setOtpError(`Enter all ${OTP_LENGTH} digits of the code.`);
                      return;
                    }
                    try {
                      await recover.mutateAsync({
                        email,
                        code: otp,
                        newPassword: values.password,
                      });
                      stopCountdown();
                      setStep(4);
                    } catch (err) {
                      const message = getErrorMessage(err);
                      if (looksLikeCodeError(message)) {
                        setOtp('');
                        setOtpError(message);
                      } else {
                        toast.error(message);
                      }
                    }
                  }}
                >
                  {({ values }) => (
                    <Form className="flex flex-col gap-5" noValidate>
                      <fieldset className="flex flex-col gap-2">
                        <legend className="mb-2 text-sm font-medium text-carbon">Code</legend>
                        <OtpInput
                          value={otp}
                          onChange={(val) => {
                            setOtp(val);
                            setOtpError('');
                          }}
                          hasError={Boolean(otpError)}
                        />
                        {otpError && (
                          <div role="alert" className={AUTH_ERROR}>
                            {otpError}
                          </div>
                        )}
                        <p className="text-sm text-grey-600">
                          {resendCount > 0 ? `Didn't get it? Resend in 0:${String(resendCount).padStart(2, '0')}` : "Didn't get it? "}
                          {resendCount === 0 && (
                            <button
                              type="button"
                              disabled={isResending}
                              onClick={handleResend}
                              className="font-medium text-carbon underline underline-offset-4 disabled:cursor-not-allowed disabled:text-grey-400 disabled:no-underline"
                            >
                              {isResending ? 'Sending...' : 'Resend code'}
                            </button>
                          )}
                        </p>
                      </fieldset>

                      <PasswordField
                        name="password"
                        label="New password"
                        required
                        variant="auth"
                        autoComplete="new-password"
                      />

                      <PasswordStrength password={values.password} />

                      <PasswordField
                        name="confirmPassword"
                        label="Confirm new password"
                        required
                        variant="auth"
                        placeholder="Type it again"
                        autoComplete="new-password"
                      />

                      <SubmitButton
                        disabled={isSending}
                        className={`${ORANGE_BTN} mt-1`}
                        loadingLabel={
                          <span className="inline-flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cloud border-t-transparent" />
                            Updating password...
                          </span>
                        }
                      >
                        Reset password
                      </SubmitButton>
                    </Form>
                  )}
                </Formik>
              </>
            )}

            {/* ══ STEP 4: DONE ═══════════════════════════════════ */}
            {step === 4 && (
              <div className="hz-pop flex flex-col gap-2.5">
                <span aria-hidden="true" className="mb-1.5 inline-flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-carbon text-cloud"><Check className="h-6 w-6" strokeWidth={2.5} /></span>
                <span className="text-[13px] font-medium text-status-success">Password updated</span>
                <AuthHeading title="You're all set.">
                  Sign in with your new password. We&apos;ve signed you out on your other devices to keep your account safe.
                </AuthHeading>
                <Link href="/auth/login" className={`${ORANGE_BTN} mt-4`}>
                  Sign in
                </Link>
              </div>
            )}

            {step !== 4 && (
              <p className="text-center text-sm text-grey-600">
                Remembered it?{' '}
                <Link href="/auth/login" className={AUTH_LINK}>
                  Sign in
                </Link>
              </p>
            )}
      </AuthLayout>
  );
}
