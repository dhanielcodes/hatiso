'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { TextField, SubmitButton } from '@/components/forms';
import AuthLayout, { AUTH_ERROR, AUTH_LINK, AUTH_PRIMARY, AuthHeading } from '@/components/auth/AuthLayout';
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

const BTN = AUTH_PRIMARY;

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
      <AuthHeading title="Verify your account.">
        Started signing up but didn&apos;t verify? Enter the email or phone number you used and we&apos;ll send you a new code.
      </AuthHeading>

      <div className="flex flex-col gap-5">
      {notice && (
        <div aria-live="polite" className={AUTH_ERROR}>
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
        <Form className="flex flex-col gap-5" noValidate>
          <TextField
            name="identifier"
            label="Email or phone number"
            required
            variant="auth"
            placeholder="Enter your email or phone number"
            autoComplete="username"
          />
          <SubmitButton
            className={BTN}
            loadingLabel={
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-cloud border-t-transparent" />
                Checking...
              </span>
            }
          >
            Send verification code
          </SubmitButton>
        </Form>
      </Formik>
      </div>

      <p className="text-center text-sm text-grey-600">
        Already verified?{' '}
        <Link href="/auth/login" className={AUTH_LINK}>
          Sign in
        </Link>
        {' · '}
        <Link href="/auth/register" className={AUTH_LINK}>
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
    <AuthLayout width={460}>
            <StepIndicator currentStep={3} />

            {raw === undefined ? (
              <div className="flex flex-col gap-4" aria-busy="true">
                <div className="h-9 w-2/3 animate-pulse rounded-lg bg-grey-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-grey-100" />
                <div className="mt-4 h-14 animate-pulse rounded-xl bg-grey-100" />
              </div>
            ) : context ? (
              <VerifyContactPanel

                context={context}
                onVerified={() => {
                  clearVerificationContext();
                  toast.success('Your account is verified. Sign in to continue.');
                  router.replace('/auth/login');
                }}
                footer={
                  <button type="button" onClick={clearVerificationContext} className="text-sm font-medium text-grey-600 underline underline-offset-4 hover:text-carbon">
                    {context.purpose === 'VERIFY_EMAIL' ? 'Change email' : 'Change phone number'}
                  </button>
                }
              />
            ) : (
              <ResumeLookup />
            )}
    </AuthLayout>
  );
}
