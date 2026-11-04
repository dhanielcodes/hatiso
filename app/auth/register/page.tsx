'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { registerUser, resendVerification, verifyUser } from '@/lib/api/auth';
import { TextField, PasswordField, CheckboxField, SubmitButton } from '@/components/forms';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import StepIndicator from '@/components/auth/StepIndicator';
import OtpInput from '@/components/auth/OtpInput';
import PasswordStrength from '@/components/auth/PasswordStrength';

/* ─── Sign-up method ───────────────────────────────────────────── */
type SignupMethod = 'email' | 'phone';

/* ─── Step schemas ─────────────────────────────────────────────── */
// Only the field for the selected method is validated as required.
const buildStep1Schema = (method: SignupMethod) =>
  Yup.object({
    fullName: Yup.string()
      .trim()
      .min(2, 'Name is too short')
      .test('has-last-name', 'Please enter your first and last name', (val) => {
        if (!val) return false;
        const parts = val.trim().split(/\s+/);
        return parts.length >= 2 && parts[1].length > 0;
      })
      .required('Full name is required'),
    email:
      method === 'email'
        ? Yup.string()
          .trim()
          .email('Enter a valid email address')
          .required('Email is required')
        : Yup.string(),
    phone:
      method === 'phone'
        ? Yup.string()
          .trim()
          .matches(/^(\+?234|0)?[789][01]\d{8}$/, 'Enter a valid Nigerian phone number')
          .required('Phone number is required')
        : Yup.string(),
    agreeTerms: Yup.boolean().oneOf([true], 'You must agree to the Terms of Service').required(),
  });

const step2Schema = Yup.object({
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
  'w-full rounded-xl bg-[#FF6500] py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(245,165,107,0.3)] transition-colors hover:bg-[#FF8A4C] active:scale-[0.99] disabled:opacity-50';

/* ─── Email / Phone tab switch ──────────────────────────────────── */
function MethodTabs({
  value,
  onChange,
}: {
  value: SignupMethod;
  onChange: (next: SignupMethod) => void;
}) {
  const tabs: { id: SignupMethod; label: string }[] = [
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
  ];

  return (
    <div
      role="tablist"
      aria-label="Sign up method"
      className="grid grid-cols-2 gap-1 rounded-xl bg-[#ECE7E0] p-1"
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`rounded-lg py-2.5 text-[13px] font-semibold transition ${active
              ? 'bg-white text-[#E95312] shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Phone input ───────────────────────────────────────────────── */
function PhoneInputField({ name, ...rest }: { name: string;[k: string]: unknown }) {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#1C1C1C]">
        Phone Number <span className="text-[#E95312]">*</span>
      </label>
      <div
        className={`flex items-center rounded-xl border bg-white px-4 py-3.5 transition focus-within:ring-1 ${hasError
          ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500'
          : 'border-[#E8E4DE] focus-within:border-[#E95312] focus-within:ring-[#E95312]'
          }`}
      >
        <span className="mr-2 select-none text-sm font-medium text-slate-600">+234</span>
        <input
          {...field}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="_ _ _ _ _ _ _ _ _"
          aria-invalid={hasError}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />
      </div>
      {hasError && <p className="mt-1.5 text-xs text-rose-600">{meta.error}</p>}
    </div>
  );
}

/* ─── Format phone to E.164 (+234...) ───────────────────────────── */
function formatNigerianPhone(phone: string): string | null {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;

  const national = digits.startsWith('234')
    ? digits.slice(3)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits;

  return national ? `+234${national}` : null;
}

/* ─── Saved step-1 data ─────────────────────────────────────────── */
interface Step1Data {
  fullName: string;
  method: SignupMethod;
  email: string;
  phone: string;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    fullName: '',
    method: 'email',
    email: '',
    phone: '',
  });
  const [savedPassword, setSavedPassword] = useState('');
  const [userId, setUserId] = useState('');

  const [registerError, setRegisterError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCount, setResendCount] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState('');

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdName, setCreatedName] = useState('');

  /* The contact the user signed up with, used for OTP copy and auto-login */
  const isEmailMethod = step1Data.method === 'email';
  const formattedPhone = formatNigerianPhone(step1Data.phone);
  const contactDisplay = isEmailMethod ? step1Data.email : formattedPhone || step1Data.phone;

  /* Countdown timer for resend OTP */
  const startCountdown = useCallback(() => {
    setResendCount(60);
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

  /* Cleanup on unmount */
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (resendFeedback) {
      timer = setTimeout(() => setResendFeedback(''), 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendFeedback]);

  /* ── Handle Resend Verification Code ── */
  const handleResendOtp = async () => {
    if (!userId || resendCount > 0 || isResending) return;
    setIsResending(true);
    setOtpError('');
    setResendFeedback('');
    try {
      const res = await resendVerification({ userId });
      setResendFeedback(
        res.message ||
        `A new verification code has been sent to your ${isEmailMethod ? 'email' : 'phone'}.`
      );
      startCountdown();
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Unable to resend verification code. Please try again later.';
      setOtpError(msg);
    } finally {
      setIsResending(false);
    }
  };

  /* ── Handle Verify Code ── */
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setOtpError(
        `Please enter the 6-digit code sent to your ${isEmailMethod ? 'email' : 'phone'}.`
      );
      return;
    }
    setIsVerifying(true);
    setOtpError('');
    try {
      await verifyUser({
        // NOTE: confirm the exact purpose value your backend expects for phone sign-ups
        purpose: isEmailMethod ? 'VERIFY_EMAIL' : 'VERIFY_PHONE',
        userId,
        code: otp.trim(),
      } as Parameters<typeof verifyUser>[0]);

      // Verification succeeded! Auto-login the user into dashboard session
      try {
        await login({
          emailOrPhone: isEmailMethod ? step1Data.email : formattedPhone || step1Data.phone,
          password: savedPassword,
        });
      } catch (loginErr) {
        console.warn('Auto-login note:', loginErr);
      }

      setCreatedName(step1Data.fullName.split(' ')[0] || 'there');
      setShowSuccess(true);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string'
          ? err.message
          : 'Invalid verification code. Please check and try again.';
      setOtpError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#F7F4EF] lg:grid-cols-2">
      <AuthBrandPanel />

      {/* ── Right panel ── */}
      <main className="flex min-h-screen flex-col bg-[#F7F4EF] px-5 py-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="w-full max-w-[460px]">
            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            {/* ══ STEP 1: CREATE ACCOUNT ══════════════════════════ */}
            {step === 1 && (
              <>
                <div className="mb-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#E95312]">
                    STEP 1
                  </p>
                  <h1 className="mt-1 text-[1.6rem] font-bold tracking-tight text-[#111111]">
                    Create your account
                  </h1>
                  <p className="mt-1.5 text-[13px] text-slate-500">
                    Join Hatiso today. It takes few minutes to set up your profile
                  </p>
                </div>

                <Formik
                  initialValues={{
                    fullName: step1Data.fullName,
                    email: step1Data.email,
                    phone: step1Data.phone,
                    agreeTerms: false as boolean,
                  }}
                  validationSchema={buildStep1Schema(step1Data.method)}
                  onSubmit={(values) => {
                    setStep1Data((prev) => ({
                      fullName: values.fullName.trim(),
                      method: prev.method,
                      // Only keep the contact for the chosen method
                      email: prev.method === 'email' ? values.email.trim() : '',
                      phone: prev.method === 'phone' ? values.phone.trim() : '',
                    }));
                    setRegisterError('');
                    setStep(2);
                  }}
                >
                  {({ setErrors, setTouched }) => (
                    <Form className="space-y-4" noValidate>
                      <MethodTabs
                        value={step1Data.method}
                        onChange={(next) => {
                          if (next === step1Data.method) return;
                          setStep1Data((prev) => ({ ...prev, method: next }));
                          // Clear stale errors from the previous tab
                          setErrors({});
                          setTouched({}, false);
                        }}
                      />

                      <TextField
                        name="fullName"
                        label="Full Name"
                        required
                        variant="auth"
                        placeholder="e.g. Mayowa Babs"
                      />

                      {step1Data.method === 'email' ? (
                        <TextField
                          name="email"
                          type="email"
                          label="Email Address"
                          required
                          variant="auth"
                          placeholder="e.g. alexandra@example.com"
                          autoComplete="email"
                        />
                      ) : (
                        <PhoneInputField name="phone" />
                      )}

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
                  )}
                </Formik>

                <p className="mt-5 text-center text-[13px] text-slate-500">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[#E95312] hover:text-[#E84D15]"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            )}

            {/* ══ STEP 2: CREATE PASSWORD & REGISTER ══════════════ */}
            {step === 2 && (
              <>
                <div className="mb-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#E95312]">
                    STEP 2
                  </p>
                  <h1 className="mt-1 text-[1.6rem] font-bold tracking-tight text-[#111111]">
                    Create Password
                  </h1>
                  <p className="mt-1.5 text-[13px] text-slate-500">
                    Choose a password that you will use to log in to your Hatiso account
                  </p>
                </div>

                {registerError && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600">
                    {registerError}
                  </div>
                )}

                <Formik
                  initialValues={{ password: savedPassword, confirmPassword: savedPassword }}
                  validationSchema={step2Schema}
                  onSubmit={async (values) => {
                    setRegisterError('');
                    setIsRegistering(true);
                    try {
                      const parts = step1Data.fullName.trim().split(/\s+/);
                      const firstName = parts[0] || 'User';
                      const lastName = parts.slice(1).join(' ') || parts[0] || 'User';

                      // Send only the contact the user signed up with
                      const contact =
                        step1Data.method === 'email'
                          ? { email: step1Data.email.trim().toLowerCase() }
                          : { phone: formatNigerianPhone(step1Data.phone) };

                      const res = await registerUser({
                        type: 'INDIVIDUAL',
                        ...contact,
                        password: values.password,
                        firstName,
                        lastName,
                      } as unknown as Parameters<typeof registerUser>[0]);

                      setUserId(res.userId);
                      setSavedPassword(values.password);
                      setStep(3);
                      startCountdown();
                    } catch (err: unknown) {
                      const msg =
                        typeof err === 'object' &&
                          err !== null &&
                          'message' in err &&
                          typeof err.message === 'string'
                          ? err.message
                          : 'Registration failed. Please verify your details.';
                      setRegisterError(msg);
                    } finally {
                      setIsRegistering(false);
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
                        label="Confirm Password"
                        required
                        variant="auth"
                        placeholder="••••••••••"
                        autoComplete="new-password"
                      />

                      {/* Strength indicator */}
                      {values.password && <PasswordStrength password={values.password} />}

                      <SubmitButton
                        disabled={isRegistering}
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

                      <div className="pt-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setRegisterError('');
                            setStep(1);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> Back to account details
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </>
            )}

            {/* ══ STEP 3: OTP VERIFICATION ════════════════════════ */}
            {step === 3 && (
              <>
                <div className="mb-8 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#E95312]">
                    STEP 3
                  </p>
                  <h1 className="mt-1 text-[1.6rem] font-bold tracking-tight text-[#111111]">
                    Account Verification
                  </h1>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                    An OTP (One-Time Password) has been sent{' '}
                    {isEmailMethod ? 'to' : 'by SMS to'}{' '}
                    <span className="font-semibold text-slate-800">{contactDisplay}</span>.
                    <br />
                    Enter OTP below to verify your account.
                  </p>
                </div>

                {otpError && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-center text-xs text-rose-600">
                    {otpError}
                  </div>
                )}

                {resendFeedback && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-center text-xs text-emerald-700">
                    {resendFeedback}
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
                  className={`${BTN} mt-8`}
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
                  {resendCount > 0 ? (
                    <>
                      Resend code in {resendCount}s?{' '}
                      <button
                        type="button"
                        disabled
                        className="font-semibold text-slate-400 cursor-not-allowed opacity-60"
                      >
                        Click to resend code
                      </button>
                    </>
                  ) : (
                    <>
                      Didn&apos;t receive code?{' '}
                      <button
                        type="button"
                        disabled={isResending}
                        onClick={handleResendOtp}
                        className="font-semibold text-[#E95312] hover:text-[#E84D15] disabled:opacity-50"
                      >
                        {isResending ? 'Sending...' : 'Click to resend code'}
                      </button>
                    </>
                  )}
                </p>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOtp('');
                      setOtpError('');
                      setStep(1);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    {isEmailMethod ? 'Change email or details' : 'Change phone number or details'}
                  </button>
                </div>
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
              className="mt-7 w-full rounded-xl bg-[#E95312] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#E84D15] active:scale-[0.99]"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}