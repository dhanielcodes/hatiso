'use client';

import { useEffect, useState } from 'react';
import { useResendVerification, useVerifyUser } from '@/lib/queries/useAuth';
import { RESEND_WAIT_SECONDS, saveVerificationContext, type VerificationContext } from '@/lib/auth/verification';
import OtpInput from './OtpInput';

const BTN =
  'w-full rounded-xl bg-brand-305 py-3.5 text-sm font-semibold text-on-brand shadow-[0_8px_20px_rgba(245,165,107,0.3)] transition-colors hover:bg-brand-249 active:scale-[0.99] disabled:opacity-50';

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
      <div className="mb-8 text-center">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-brand-361">{eyebrow}</p>}
        <h1 className="mt-1 text-[1.6rem] font-bold tracking-tight text-tone-822">Account Verification</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
          An OTP (One-Time Password) has been sent {isEmail ? 'to' : 'by SMS to'}{' '}
          <span className="font-semibold text-slate-800">{context.contact || `your ${channel}`}</span>.
          <br />
          Enter OTP below to verify your account.
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-center text-xs text-rose-600">
          {error}
        </div>
      )}

      {feedback && (
        <div aria-live="polite" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-center text-xs text-emerald-700">
          {feedback}
        </div>
      )}

      <OtpInput
        value={otp}
        onChange={(value) => {
          setOtp(value);
          setError('');
        }}
        hasError={Boolean(error)}
      />

      <button type="button" disabled={verify.isPending || otp.length < 6} onClick={handleVerify} className={`${BTN} mt-8`}>
        {verify.isPending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Verifying...
          </span>
        ) : (
          'Verify'
        )}
      </button>

      <p className="mt-5 text-center text-[13px] text-slate-500">
        {countdown > 0 ? (
          <>
            Resend code in {countdown}s?{' '}
            <button type="button" disabled className="cursor-not-allowed font-semibold text-slate-400 opacity-60">
              Click to resend code
            </button>
          </>
        ) : (
          <>
            Didn&apos;t receive code?{' '}
            <button
              type="button"
              disabled={resend.isPending}
              onClick={handleResend}
              className="font-semibold text-brand-361 hover:text-brand-370 disabled:opacity-50"
            >
              {resend.isPending ? 'Sending...' : 'Click to resend code'}
            </button>
          </>
        )}
      </p>

      {footer && <div className="mt-6 text-center">{footer}</div>}
    </>
  );
}
