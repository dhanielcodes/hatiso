'use client';

import { useEffect, useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { useResendVerification, useVerifyUser } from '@/lib/queries/useAuth';
import { RESEND_WAIT_SECONDS, saveVerificationContext, type VerificationContext } from '@/lib/auth/verification';
import OtpInput from './OtpInput';
import { AUTH_ERROR, AUTH_PRIMARY, AuthHeading } from './AuthLayout';

const BTN = AUTH_PRIMARY;

function errorMessage(error: unknown, fallback: string) {
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' ? error.message : fallback;
}

function secondsLeft(codeSentAt: number | undefined, now: number) {
  if (!codeSentAt) return 0;
  return Math.max(0, Math.ceil(RESEND_WAIT_SECONDS - (now - codeSentAt) / 1000));
}

export interface VerifyContactPanelProps {
  context: VerificationContext;
  /** Runs after the code is accepted; the account is active from here. */
  onVerified: () => void | Promise<void>;
  /** Shown under the heading, e.g. a "Change details" link. */
  footer?: React.ReactNode;
  /** Small label above the heading, e.g. "STEP 3". */
  eyebrow?: string;
}

/**
 * The Verify Contact screen: a six-digit code for VERIFY_EMAIL or VERIFY_PHONE, plus resend with a 60-second wait.
 * Shared by the sign-up page (step 3) and /auth/verify (resumed sign-ups).
 */
export default function VerifyContactPanel({ context, onVerified, footer, eyebrow }: VerifyContactPanelProps) {
  const isEmail = context.purpose === 'VERIFY_EMAIL';
  const channel = isEmail ? 'email' : 'phone';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  // When the last code went out; starts from the saved context and moves on each resend.
  const [sentAt, setSentAt] = useState(context.codeSentAt);
  const [now, setNow] = useState(() => Date.now());
  const countdown = secondsLeft(sentAt, now);

  const verify = useVerifyUser();
  const resend = useResendVerification();

  // Tick once a second while the resend wait is running.
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(id);
  }, [countdown, now]);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(''), 5000);
    return () => clearTimeout(id);
  }, [feedback]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError(`Please enter the 6-digit code sent to your ${channel}.`);
      return;
    }
    setError('');
    try {
      await verify.mutateAsync({ purpose: context.purpose, userId: context.userId, code: otp.trim() });
    } catch (err: unknown) {
      setOtp('');
      setError(errorMessage(err, 'Invalid verification code. Please check and try again.'));
      return;
    }
    await onVerified();
  };

  const handleResend = async () => {
    if (countdown > 0 || resend.isPending) return;
    setError('');
    setFeedback('');
    try {
      const res = await resend.mutateAsync({ userId: context.userId });
      const sent = Date.now();
      setSentAt(sent);
      setNow(sent);
      saveVerificationContext({ ...context, codeSentAt: sent });
      setFeedback(res.message || `A new verification code has been sent to your ${channel}.`);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Unable to resend verification code. Please try again later.'));
    }
  };

  return (
    <>
      <span aria-hidden="true" className="-mb-2 inline-flex h-[52px] w-[52px] items-center justify-center rounded-lg bg-carbon text-cloud">
        {isEmail ? <Mail className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </span>
      <AuthHeading eyebrow={eyebrow} title={isEmail ? 'Check your email.' : 'Check your messages.'}>
        We sent a 6-digit code {isEmail ? 'to' : 'by SMS to'}{' '}
        <span className="font-medium text-carbon">{context.contact || `your ${channel}`}</span>
        verify your account.
      </AuthHeading>

      <div className="flex flex-col gap-5">
      {error && (
        <div role="alert" className={AUTH_ERROR}>
          {error}
        </div>
      )}

      {feedback && (
        <div aria-live="polite" className="rounded-lg border border-status-success/30 bg-status-success/8 px-3.5 py-3 text-sm text-status-success">
          {feedback}
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-carbon">Verification code</legend>
      <OtpInput
        value={otp}
        onChange={(value) => {
          setOtp(value);
          setError('');
        }}
        hasError={Boolean(error)}
      />
      </fieldset>

      <button type="button" disabled={verify.isPending || otp.length < 6} onClick={handleVerify} className={`${BTN} mt-3`}>
        {verify.isPending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cloud border-t-transparent" />
            Verifying...
          </span>
        ) : (
          'Verify account'
        )}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-grey-600">
        <span>
          Didn&apos;t get it?{' '}
          {countdown > 0 ? (
            <span className="tabular-nums">Resend in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
          ) : (
            <button
              type="button"
              disabled={resend.isPending}
              onClick={handleResend}
              className="font-medium text-carbon underline underline-offset-4 hover:decoration-grey-400 disabled:opacity-50"
            >
              {resend.isPending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </span>
        {footer}
      </div>
      </div>

      <p className="text-sm leading-relaxed text-grey-600">
        {isEmail
          ? "Can't find it? Check your spam folder, or go back and sign up with your phone number instead."
          : "Can't find it? Give it a minute, or go back and sign up with your email instead."}
      </p>
    </>
  );
}
