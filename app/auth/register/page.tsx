'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRegister, useResumeVerification } from '@/lib/queries/useAuth';
import { TextField, PasswordField, PhoneField, CheckboxField, SubmitButton } from '@/components/forms';
import AuthLayout, { AUTH_ERROR, AUTH_LINK, AUTH_PRIMARY, AuthHeading } from '@/components/auth/AuthLayout';
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
const BTN = AUTH_PRIMARY;

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
      className="grid grid-cols-2 gap-1 rounded-xl border border-grey-100 bg-white p-1"
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
            className={`min-h-10 rounded-lg text-sm font-medium transition-colors ${active
              ? 'bg-carbon text-cloud'
              : 'text-grey-600 hover:text-carbon'
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
    <>
      <AuthLayout
        width={460}
        back={
          step === 2
            ? { onClick: () => { setRegisterError(''); setStep(1); } }
            : step === 3
              ? { onClick: () => { clearVerificationContext(); setVerification(null); setStep(1); } }
              : undefined
        }
        aside={
          <>
            Have an account?{' '}
            <Link href="/auth/login" className={AUTH_LINK}>
              Sign in
            </Link>
          </>
        }
      >
            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            {/* ══ STEP 1: CREATE ACCOUNT ══════════════════════════ */}
            {step === 1 && (
              <>
                <AuthHeading title="Create your account.">
                  It takes about two minutes. You&apos;ll keep your receipts and saved numbers in one place.
                </AuthHeading>

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
                    <Form className="flex flex-col gap-5" noValidate>
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
                        label="Full name"
                        required
                        variant="auth"
                        placeholder="e.g. Ada Okafor"
                      />

                      {step1Data.method === 'email' ? (
                        <TextField
                          name="email"
                          type="email"
                          label="Email address"
                          required
                          variant="auth"
                          placeholder="e.g. ada@example.com"
                          hint="We'll send a code to this email to verify it."
                          autoComplete="email"
                        />
                      ) : (
                        <PhoneField
                          name="phone"
                          label="Phone number"
                          required
                          variant="auth"
                          dialCode="+234"
                          inputMode="numeric"
                          autoComplete="tel-national"
                          placeholder="e.g. 0803 123 4567"
                          hint="We'll text a code to this number to verify it."
                        />
                      )}

                      <CheckboxField
                        name="agreeTerms"
                        variant="auth"
                        label={
                          <>
                            I agree to the{' '}
                            <Link href="/terms" className={AUTH_LINK}>
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className={AUTH_LINK}>
                              Privacy Policy
                            </Link>
                            .
                          </>
                        }
                      />

                      <SubmitButton className={BTN}>Continue<ArrowRight className="h-4 w-4" aria-hidden="true" /></SubmitButton>
                    </Form>
                  )}
                </Formik>

              </>
            )}

            {/* ══ STEP 2: CREATE PASSWORD & REGISTER ══════════════ */}
            {step === 2 && (
              <>
                <AuthHeading title="Create a password.">
                  You&apos;ll use it with {isEmailMethod ? step1Data.email : step1Data.phone} to sign in.
                </AuthHeading>

                {registerError && (
                  <div role="alert" className={AUTH_ERROR}>
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
                    <Form className="flex flex-col gap-5" noValidate>
                      <PasswordField
                        name="password"
                        label="Password"
                        required
                        variant="auth"
                        autoComplete="new-password"
                      />

                      <PasswordStrength password={values.password} />

                      <PasswordField
                        name="confirmPassword"
                        label="Confirm password"
                        required
                        variant="auth"
                        placeholder="Type it again"
                        autoComplete="new-password"
                      />

                      <SubmitButton
                        disabled={isRegistering}
                        className={`${BTN} mt-1`}
                        loadingLabel={
                          <span className="inline-flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cloud border-t-transparent" />
                            Creating account...
                          </span>
                        }
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </SubmitButton>
                    </Form>
                  )}
                </Formik>
              </>
            )}

            {/* ══ STEP 3: VERIFY CONTACT ══════════════════════════ */}
            {step === 3 && verification && (
              <>
                <VerifyContactPanel
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
                      className="text-sm font-medium text-grey-600 underline underline-offset-4 hover:text-carbon"
                    >
                      {isEmailMethod ? 'Change email or details' : 'Change phone number or details'}
                    </button>
                  }
                />
              </>
            )}
      </AuthLayout>

      {/* ══ SUCCESS MODAL ═══════════════════════════════════════════ */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" className="hz-pop w-full max-w-sm overflow-hidden rounded-2xl bg-white p-8 text-center text-carbon shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-carbon text-cloud">
              <CheckCircle2 className="h-8 w-8" strokeWidth={2} />
            </div>

            <h2 className="text-2xl font-semibold tracking-[-0.02em]">
              Welcome aboard, {createdName}.
            </h2>
            <p className="mx-auto mt-2 max-w-[280px] text-[15px] leading-relaxed text-grey-600">
              Your Hatiso account is all set. Step into your dashboard and discover what&apos;s
              waiting for you.
            </p>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className={`${AUTH_PRIMARY} mt-7`}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}