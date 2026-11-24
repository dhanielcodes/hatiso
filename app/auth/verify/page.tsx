'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { TextField, SubmitButton } from '@/components/forms';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';
import StepIndicator from '@/components/auth/StepIndicator';
import VerifyContactPanel from '@/components/auth/VerifyContactPanel';
import { useResumeVerification } from '@/lib/queries/useAuth';
import {
  clearVerificationContext,
  normalizeIdentifier,
  parseVerificationContext,
  purposeFor,
  readVerificationContextOnServer,
  readVerificationContextRaw,
  saveVerificationContext,
  subscribeToVerificationContext,
} from '@/lib/auth/verification';

const BTN =
  'w-full rounded-xl bg-brand-305 py-3.5 text-sm font-semibold text-on-brand shadow-[0_8px_20px_rgba(245,165,107,0.3)] transition-colors hover:bg-brand-249 active:scale-[0.99] disabled:opacity-50';

const lookupSchema = Yup.object({
  identifier: Yup.string()
    .trim()
    .required('Enter your email or phone number')
    .test('email-or-phone', 'Enter a valid email address or Nigerian phone number', (value) => {
      if (!value) return false;
      const v = value.trim();
      return v.includes('@') ? Yup.string().email().isValidSync(v) : /^(\+?234|0)?[789][01]\d{8}$/.test(v.replace(/\s+/g, ''));
    }),
});

/** No saved sign-up in this tab: ask for the email or phone and resume it. */
function ResumeLookup() {
  const resume = useResumeVerification();
  const [notice, setNotice] = useState('');

  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-361">STEP 3</p>
        <h1 className="mt-1 text-[1.6rem] font-bold tracking-tight text-tone-822">Account Verification</h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          Started signing up but didn&apos;t verify? Enter the email or phone number you used and we&apos;ll send you a new code.
        </p>
      </div>

      {notice && (
        <div aria-live="polite" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-600">
          {notice}
        </div>
      )}

      <Formik
        initialValues={{ identifier: '' }}
        validationSchema={lookupSchema}
        onSubmit={async ({ identifier }) => {
          setNotice('');
          const contact = normalizeIdentifier(identifier);
          try {
            const result = await resume.mutateAsync(contact);
            if (result.verificationRequired && result.userId) {
              saveVerificationContext({
                userId: result.userId,
                purpose: result.purpose ?? purposeFor(contact),
                contact,
                codeSentAt: Date.now(),
              });
              return;
            }
          } catch {
            // Fall through to the same neutral notice: don't reveal whether the account exists.
          }
          setNotice('There is nothing to verify for that email or phone number. If you have already verified, sign in. Otherwise, create an account.');
        }}
      >
        <Form className="space-y-4" noValidate>
          <TextField
            name="identifier"
            label="Email or Phone Number"
            required
            variant="auth"
            placeholder="Enter your email or phone number"
            autoComplete="username"
          />
          <SubmitButton
            className={BTN}
            loadingLabel={
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Checking...
              </span>
            }
          >
            Send verification code
          </SubmitButton>
        </Form>
      </Formik>

      <p className="mt-6 text-center text-[13px] text-slate-500">
        Already verified?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-361 hover:text-brand-370">
          Sign In
        </Link>
        {' · '}
        <Link href="/auth/register" className="font-semibold text-brand-361 hover:text-brand-370">
          Create an account
        </Link>
      </p>
    </>
  );
}

/**
 * Verify Contact: where unfinished sign-ups land.
 * Reached from sign-up (fresh or repeated), and from login when it answers `verification_required`.
 * After a successful code the account is active, and the user signs in as normal.
 */
export default function VerifyPage() {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeToVerificationContext, readVerificationContextRaw, readVerificationContextOnServer);
  const context = useMemo(() => parseVerificationContext(raw), [raw]);

  return (
    <div className="grid min-h-screen bg-tone-35 lg:grid-cols-2">
      <AuthBrandPanel />

      <main className="flex min-h-screen flex-col bg-tone-35 px-5 py-6 sm:px-10 lg:px-16 xl:px-20">
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          <div className="w-full max-w-[460px]">
            <StepIndicator currentStep={3} />

            {raw === undefined ? (
              <div className="space-y-4" aria-busy="true">
                <div className="mx-auto h-7 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mx-auto h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                <div className="mt-6 h-14 animate-pulse rounded-xl bg-slate-200" />
              </div>
            ) : context ? (
              <VerifyContactPanel
                eyebrow="STEP 3"
                context={context}
                onVerified={() => {
                  clearVerificationContext();
                  toast.success('Your account is verified. Sign in to continue.');
                  router.replace('/auth/login');
                }}
                footer={
                  <button type="button" onClick={clearVerificationContext} className="text-xs text-slate-500 underline hover:text-slate-800">
                    {context.purpose === 'VERIFY_EMAIL' ? 'Change email' : 'Change phone number'}
                  </button>
                }
              />
            ) : (
              <ResumeLookup />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
