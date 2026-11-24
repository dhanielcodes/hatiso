'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRegister, useResumeVerification } from '@/lib/queries/useAuth';
import { TextField, PasswordField, PhoneField, CheckboxField, SubmitButton } from '@/components/forms';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import StepIndicator from '@/components/auth/StepIndicator';
import PasswordStrength from '@/components/auth/PasswordStrength';
import VerifyContactPanel from '@/components/auth/VerifyContactPanel';
import {
  clearVerificationContext,
  formatNigerianPhone,
  purposeFor,
  saveVerificationContext,
  type VerificationContext,
} from '@/lib/auth/verification';
import type { ApiError } from '@/types';

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

/* ─── Did registration fail because the email/phone is taken? ──── */
function isAlreadyRegistered(error: unknown) {
  if (typeof error !== 'object' || error === null) return false;
  const { statusCode, message } = error as ApiError;
  return statusCode === 409 || /already|exist|taken|in use|registered/i.test(message ?? '');
}

function errorMessage(error: unknown, fallback: string) {
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : fallback;
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
  /** The sign-up waiting for its code (fresh, or resumed after a repeated sign-up). */
  const [verification, setVerification] = useState<VerificationContext | null>(null);

  const [registerError, setRegisterError] = useState('');
  const register = useRegister();
  const resume = useResumeVerification();
  const isRegistering = register.isPending || resume.isPending;

  const [showSuccess, setShowSuccess] = useState(false);
  const [createdName, setCreatedName] = useState('');

  const isEmailMethod = step1Data.method === 'email';

  /** Park the sign-up (so /auth/verify can pick it up after a reload) and show the code screen. */
  const goToVerification = (context: VerificationContext) => {
    saveVerificationContext(context);
    setVerification(context);
    setStep(3);
  };

  /* ── Code accepted: the account is active ── */
  const handleVerified = async (context: VerificationContext) => {
    clearVerificationContext();
    try {
      // Sign straight in with the password from step 2. If it doesn't match (e.g. a repeated
      // sign-up with a different password), the user signs in on the login page instead.
      await login({ emailOrPhone: context.contact ?? '', password: savedPassword });
    } catch {
      toast.success('Your account is verified. Sign in to continue.');
      router.replace('/auth/login');
      return;
    }
    setCreatedName(step1Data.fullName.split(' ')[0] || 'there');
    setShowSuccess(true);
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
                        <PhoneField
                          name="phone"
                          label="Phone Number"
                          required
                          variant="auth"
                          dialCode="+234"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="_ _ _ _ _ _ _ _ _"
                        />
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
                    const parts = step1Data.fullName.trim().split(/\s+/);
                    const firstName = parts[0] || 'User';
                    const lastName = parts.slice(1).join(' ') || parts[0] || 'User';

                    // Send only the contact the user signed up with
                    const email = step1Data.method === 'email' ? step1Data.email.trim().toLowerCase() : '';
                    const phone = step1Data.method === 'phone' ? formatNigerianPhone(step1Data.phone) : null;
                    const contact = email ? { email } : { phone };
                    const identifier = email || phone || step1Data.phone.trim();

                    try {
                      const res = await register.mutateAsync({
                        type: 'INDIVIDUAL',
                        ...contact,
                        password: values.password,
                        firstName,
                        lastName,
                      });

                      setSavedPassword(values.password);
                      goToVerification(
                        { userId: res.userId, purpose: res.purpose ?? purposeFor(identifier), contact: identifier, codeSentAt: Date.now() }
                      );
                    } catch (err: unknown) {
                      // Signing up again with an email/phone whose sign-up was never verified:
                      // pick that sign-up back up instead of creating another account.
                      if (isAlreadyRegistered(err)) {
                        try {
                          const pending = await resume.mutateAsync(identifier);
                          if (pending.verificationRequired && pending.userId) {
                            setSavedPassword(values.password);
                            goToVerification(
                              { userId: pending.userId, purpose: pending.purpose ?? purposeFor(identifier), contact: identifier, codeSentAt: Date.now() }
                            );
                            return;
                          }
                        } catch {
                          // Fall back to the registration error below.
                        }
                      }
                      setRegisterError(errorMessage(err, 'Registration failed. Please verify your details.'));
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

            {/* ══ STEP 3: VERIFY CONTACT ══════════════════════════ */}
            {step === 3 && verification && (
              <>
                <VerifyContactPanel
                  eyebrow="STEP 3"
                  context={verification}
                  onVerified={() => handleVerified(verification)}
                  footer={
                    <button
                      type="button"
                      onClick={() => {
                        clearVerificationContext();
                        setVerification(null);
                        setStep(1);
                      }}
                      className="text-xs text-slate-500 underline hover:text-slate-800"
                    >
                      {isEmailMethod ? 'Change email or details' : 'Change phone number or details'}
                    </button>
                  }
                />
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