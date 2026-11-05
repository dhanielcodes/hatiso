'use client';

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ClipboardEvent,
    type ComponentType,
    type FormEvent,
    type KeyboardEvent,
} from 'react';
import { Bell, Check, ChevronRight, Eye, EyeOff, Lock, Pencil, UserPlus, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/lib/queries/useNotifications';
import { useAuthStore } from '@/lib/store/authStore';
import { getCurrentUser } from '@/lib/api/auth';

/* ─── Types ────────────────────────────────────────────────────── */
type TabId = 'personal' | 'notifications' | 'privacy';
type Channel = 'EMAIL' | 'SMS' | 'OFF';
type SecurityStep = 'phone' | 'otp' | 'password';

type MenuItem = {
    id: TabId;
    label: string;
    icon: ComponentType<{ className?: string }>;
};

type ProfileFields = {
    firstName: string;
    lastName: string;
    displayName: string;
    bio: string;
};

/* ─── Constants ────────────────────────────────────────────────── */
const OTP_LENGTH = 6;

const MENU: MenuItem[] = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'privacy', label: 'Reset Password', icon: Lock },
];

const CHANNEL_OPTIONS: { value: Channel; label: string; description: string }[] = [
    { value: 'EMAIL', label: 'Email', description: 'Receive purchase alerts via email.' },
    { value: 'SMS', label: 'SMS', description: 'Receive purchase alerts via SMS.' },
    {
        value: 'OFF',
        label: 'Off',
        description: 'Turn off external alerts. Purchase updates still appear in your in-app feed.',
    },
];

const PASSWORD_RULES = [
    { id: 'upper', label: 'At least 1 uppercase', test: (v: string) => /[A-Z]/.test(v) },
    { id: 'number', label: 'At least 1 number', test: (v: string) => /\d/.test(v) },
    { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
];

/* Dummy only: no endpoint exists yet for these */
const PROFILE = {
    memberSince: 'Jan 15, 2026',
    pointsBalance: '1,250 pts',
    verified: true,
    tier: 'Silver',
    phone: '+234 904 637 3748',
};

/* ─── Response helpers ─────────────────────────────────────────── */
// The payload may live on an axios error (`err.response.data`), on a wrapped response
// (`{ code, status, data: {...} }`) or be the response itself.
const readPayload = (x: unknown): any => {
    const a = x as any;
    return a?.response?.data ?? a?.data ?? a;
};

const getErrorMessage = (err: unknown) =>
    readPayload(err)?.message ?? (err as any)?.message ?? 'Something went wrong. Please try again.';

const FAILURE = /(error|fail|invalid|denied|unauthori[sz]ed)/;
const SUCCESS = /(success|^ok$|^true$|updated|changed)/;
const is2xx = (n: number) => !Number.isNaN(n) && n >= 200 && n < 300;

// True when a resolved value OR a thrown value is really a success response.
const isSuccessPayload = (x: unknown): boolean => {
    if (x == null) return false;
    const a = x as any;
    const payload = readPayload(x);

    // A real HTTP status decides everything
    const http = Number(a?.response?.status ?? (typeof a?.status === 'number' ? a.status : NaN));
    if (!Number.isNaN(http)) return is2xx(http);

    // Network failure / timeout
    if (a?.isAxiosError && !a?.response) return false;

    // Explicit failure markers win over success markers
    const status = String(payload?.status ?? '').toLowerCase();
    const code = String(payload?.code ?? '').toLowerCase();
    const numCode = Number(payload?.code);
    if (payload?.success === false) return false;
    if (FAILURE.test(status) || FAILURE.test(code)) return false;
    if (!Number.isNaN(numCode) && !is2xx(numCode)) return false;

    return payload?.success === true || SUCCESS.test(status) || SUCCESS.test(code) || is2xx(numCode);
};

const getSuccessMessage = (x: unknown, fallback: string) => {
    const payload = readPayload(x);
    return payload?.message ?? payload?.data?.message ?? fallback;
};

/* ─── Small presentational pieces ──────────────────────────────── */
function PasswordField({
    id,
    label,
    value,
    onChange,
    autoComplete,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete: string;
}) {
    const [visible, setVisible] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="text-sm font-medium text-[#52617A]">
                {label} <span className="text-[#E22E41]">*</span>
            </label>
            <div className="relative mt-2">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    autoComplete={autoComplete}
                    className="h-12 w-full rounded-lg border border-[#E6E3E0] bg-white pl-4 pr-12 text-sm tracking-wide text-[#20232A] outline-none transition focus:border-[#E95312]"
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? `Hide ${label}` : `Show ${label}`}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52617A] transition hover:text-[#20232A]"
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}

// Six single-digit boxes with auto-advance, backspace and paste support
function OtpInput({
    digits,
    onChange,
    disabled,
}: {
    digits: string[];
    onChange: (next: string[]) => void;
    disabled?: boolean;
}) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const fill = (start: number, raw: string) => {
        const chars = raw.replace(/\D/g, '').slice(0, OTP_LENGTH - start).split('');
        if (chars.length === 0) return;
        const next = digits.slice();
        chars.forEach((c, k) => {
            next[start + k] = c;
        });
        onChange(next);
        refs.current[Math.min(start + chars.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace') {
            event.preventDefault();
            const next = digits.slice();
            if (next[index]) {
                next[index] = '';
            } else if (index > 0) {
                next[index - 1] = '';
                refs.current[index - 1]?.focus();
            }
            onChange(next);
        } else if (event.key === 'ArrowLeft' && index > 0) {
            refs.current[index - 1]?.focus();
        } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            refs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        fill(index, event.clipboardData.getData('text'));
    };

    return (
        <div className="flex gap-3 sm:gap-5" role="group" aria-label="One-time passcode">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        refs.current[index] = el;
                    }}
                    value={digit}
                    onChange={(event) => fill(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={(event) => handlePaste(index, event)}
                    onFocus={(event) => event.target.select()}
                    disabled={disabled}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    aria-label={`Digit ${index + 1}`}
                    className="h-[72px] w-[52px] rounded-xl border border-[#E6E3E0] bg-white text-center text-xl font-medium text-[#20232A] outline-none transition focus:border-[#E95312] disabled:opacity-60 sm:h-[90px] sm:w-[68px]"
                />
            ))}
        </div>
    );
}

/* ─── Tab: Personal Details ────────────────────────────────────── */
const fromUser = (u?: any): ProfileFields => ({
    firstName: u?.firstName ?? '',
    lastName: u?.lastName ?? '',
    displayName: u?.displayName ?? '',
    bio: u?.bio ?? '',
});

function PersonalDetails({
    user,
    loading,
    loadError,
    onRetry,
    updateProfile,
}: {
    user?: any;
    loading: boolean;
    loadError: string | null;
    onRetry: () => void;
    updateProfile: (payload: ProfileFields) => Promise<unknown>;
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState<ProfileFields>(() => fromUser(user));
    const [draft, setDraft] = useState<ProfileFields>(details);

    // Keep in sync when the user loads or refetches
    useEffect(() => {
        const next = fromUser(user);
        setDetails(next);
        setDraft(next);
    }, [user]);

    const startEdit = () => {
        setDraft(details);
        setIsEditing(true);
    };

    const canSave = Boolean(draft.firstName.trim() && draft.lastName.trim()) && !isSaving;

    const save = async () => {
        if (!canSave) return;
        setIsSaving(true);
        const payload: ProfileFields = {
            firstName: draft.firstName.trim(),
            lastName: draft.lastName.trim(),
            displayName: draft.displayName.trim(),
            bio: draft.bio.trim(),
        };
        try {
            await updateProfile(payload);
            setDetails(payload);
            setIsEditing(false);
            toast.success('Profile updated.');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsSaving(false);
        }
    };

    const editable: { key: keyof ProfileFields; label: string; multiline?: boolean }[] = [
        { key: 'firstName', label: 'First Name' },
        { key: 'lastName', label: 'Last Name' },
        { key: 'displayName', label: 'Display Name' },
        { key: 'bio', label: 'Bio', multiline: true },
    ];

    const shownName = details.displayName || `${details.firstName} ${details.lastName}`.trim() || '—';
    const inputCls =
        'w-full max-w-sm rounded-lg border border-[#E6E3E0] bg-white px-3 text-base text-[#20232A] outline-none focus:border-[#E95312]';

    if (loading) {
        return (
            <div>
                <h2 className="text-xl font-medium text-[#243B4A]">Personal Details</h2>
                <p className="mt-8 text-sm text-[#7A7F8A]">Loading your details…</p>
            </div>
        );
    }

    if (loadError && !user) {
        return (
            <div>
                <h2 className="text-xl font-medium text-[#243B4A]">Personal Details</h2>
                <p className="mt-8 text-sm text-[#E22E41]" role="alert">{loadError}</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 rounded-md border border-[#E6E3E0] bg-white px-3 py-1.5 text-xs text-[#20232A] transition hover:bg-slate-50"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-medium text-[#243B4A]">Personal Details</h2>

            {/* Profile summary */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#F6F6F7] px-6 py-5">
                <div className="flex items-center gap-5">
                    <span className="flex h-[65px] w-[65px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E3E5E8]">
                        {user?.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <UserPlus className="h-6 w-6 text-[#20232A]" />
                        )}
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-lg font-medium text-[#3B4150]">{shownName}</p>
                            {/*                    {PROFILE.verified && (
                                <span className="rounded bg-[#DDF0E4] px-2.5 py-1 text-xs font-medium text-[#2E7D4F]">Verified</span>
                            )}
                            <span className="rounded bg-[#FFF3DB] px-2.5 py-1 text-xs font-medium text-[#9A4A00]">{PROFILE.tier}</span> */}
                        </div>
                        {/* <p className="mt-3 text-sm text-[#7A7F8A]">Member since - {PROFILE.memberSince}</p> */}
                    </div>
                </div>
                {/*  <div className="pr-1 text-right sm:pr-4">
                    <p className="text-xs text-[#7A7F8A]">Points balance</p>
                    <p className="mt-2 text-sm font-semibold text-[#20232A]">{PROFILE.pointsBalance}</p>
                </div> */}
            </div>

            {/* Details */}
            <div className="mt-6 rounded-2xl border border-[#F0EDEA] bg-[#F9F9FA] px-6 pb-6 pt-5">
                <div className="flex items-center justify-end gap-2">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                className="rounded-md border border-[#E6E3E0] bg-white px-3 py-1.5 text-xs text-[#52617A] transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={save}
                                disabled={!canSave}
                                className="rounded-md bg-[#E95312] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#D44A10] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? 'Saving…' : 'Save'}
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={startEdit}
                            className="flex items-center gap-1.5 rounded-md border border-[#E6E3E0] bg-white px-3 py-1.5 text-xs text-[#20232A] transition hover:bg-slate-50"
                        >
                            <Pencil className="h-3 w-3" /> Edit
                        </button>
                    )}
                </div>

                <dl className="mt-1">
                    {editable.map((field, index) => (
                        <div key={field.key} className={`px-3 py-5 ${index > 0 ? 'border-t border-[#E6E3E0]' : ''}`}>
                            <dt>
                                <label htmlFor={`profile-${field.key}`} className="text-sm text-[#52617A]">
                                    {field.label}
                                </label>
                            </dt>
                            <dd className="mt-1.5">
                                {isEditing ? (
                                    field.multiline ? (
                                        <textarea
                                            id={`profile-${field.key}`}
                                            rows={3}
                                            value={draft[field.key]}
                                            onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                                            className={`${inputCls} py-2`}
                                        />
                                    ) : (
                                        <input
                                            id={`profile-${field.key}`}
                                            type="text"
                                            value={draft[field.key]}
                                            onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                                            className={`${inputCls} h-10`}
                                        />
                                    )
                                ) : (
                                    <p className="text-base font-medium text-[#20232A]">{details[field.key] || '—'}</p>
                                )}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    );
}

/* ─── Tab: Notification Settings ───────────────────────────────── */
function NotificationSettings() {
    const { data, isLoading, isError } = useNotificationSettings();
    const update = useUpdateNotificationSettings();
    const [selected, setSelected] = useState<Channel | undefined>();

    // Handles both `{ code, status, data: {...} }` and an already-unwrapped response
    const settings = (data as any)?.data ?? data;
    const current: Channel | undefined = settings?.purchaseChannel;
    const available: string[] = settings?.availableChannels ?? [];

    useEffect(() => {
        if (current) setSelected(current);
    }, [current]);

    const choose = (value: Channel) => {
        if (value === selected || update.isPending) return;
        const previous = selected;
        setSelected(value); // optimistic
        update.mutate({ purchaseChannel: value } as any, {
            onSuccess: () => toast.success('Notification preference saved.'),
            onError: (err: unknown) => {
                setSelected(previous);
                toast.error(getErrorMessage(err));
            },
        });
    };

    return (
        <div className="max-w-[690px]">
            <h2 className="text-xl font-medium text-[#243B4A]">Notification Settings</h2>
            <div className="mt-5 grid gap-6 border-t border-[#EEEAE6] py-6 md:grid-cols-[1fr_1fr]">
                <div>
                    <h3 className="text-base font-medium text-[#243B4A]">Purchase Alerts</h3>
                    <p className="mt-2 max-w-[300px] text-sm text-[#7A7F8A]">
                        Choose how you want to be notified about your purchases.
                    </p>
                </div>

                {isLoading ? (
                    <p className="text-sm text-[#7A7F8A]">Loading…</p>
                ) : isError ? (
                    <p className="text-sm text-[#E22E41]">Couldn&apos;t load your notification settings.</p>
                ) : (
                    <div role="radiogroup" aria-label="Purchase alert channel" className="space-y-5">
                        {CHANNEL_OPTIONS.map((opt) => {
                            const enabled = opt.value === 'OFF' || available.includes(opt.value);
                            const checked = selected === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={checked}
                                    disabled={!enabled || update.isPending}
                                    onClick={() => choose(opt.value)}
                                    className="flex w-full items-start gap-4 text-left disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <span
                                        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-[#E95312]' : 'border-[#B8BFC8]'
                                            }`}
                                    >
                                        {checked && <span className="h-2 w-2 rounded-full bg-[#E95312]" />}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-medium text-[#20232A]">{opt.label}</span>
                                        <span className="mt-1 block max-w-[260px] text-xs leading-relaxed text-[#8A8F99]">
                                            {enabled ? opt.description : `${opt.label} isn't verified on your account yet.`}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                        <p className="text-xs text-[#8A8F99]">Push notifications aren&apos;t available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Privacy & Security: step 1 – verify number ───────────────── */
function VerifyPhoneStep({
    phone,
    onPhoneChange,
    editable,
    sendOtp,
    onSent,
}: {
    phone: string;
    onPhoneChange: (value: string) => void;
    editable: boolean;
    sendOtp: (phone: string) => Promise<unknown>;
    onSent: () => void;
}) {
    const [isSending, setIsSending] = useState(false);

    const digitCount = phone.replace(/\D/g, '').length;
    const canSubmit = digitCount >= 10 && !isSending;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;
        setIsSending(true);
        try {
            await sendOtp(phone);
            onSent();
        } catch (err) {
            // Some backends reject on 2xx wrappers – don't block the flow in that case
            if (isSuccessPayload(err)) onSent();
            else toast.error(getErrorMessage(err));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[622px]" noValidate>
            <h2 className="text-xl font-medium text-[#243B4A]">Verify Number</h2>
            <div className="mt-5 border-t border-[#EEEAE6]" />

            <p className="mt-7 text-base leading-relaxed text-[#6B7280]">
                Enter your account email and we&apos;ll send a reset link, along with an OTP to your registered number to keep your
                account safe.
            </p>

            <div className="mt-10">
                <label htmlFor="verify-phone" className="text-sm font-medium text-[#52617A]">
                    Phone Number <span className="text-[#E22E41]">*</span>
                </label>
                <input
                    id="verify-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => onPhoneChange(event.target.value)}
                    readOnly={!editable}
                    autoComplete="tel"
                    className={`mt-2 h-11 w-full rounded-lg border border-[#E6E3E0] px-3.5 text-sm text-[#20232A] outline-none transition focus:border-[#E95312] ${editable ? 'bg-white' : 'bg-[#FBFBFB]'
                        }`}
                />
            </div>

            <div className="mt-24 flex justify-end">
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded-lg bg-[#EE7230] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D9622B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSending ? 'Sending code…' : 'Verify identity'}
                </button>
            </div>
        </form>
    );
}

/* ─── Privacy & Security: step 2 – enter OTP ───────────────────── */
function OtpStep({
    phone,
    sendOtp,
    verifyOtp,
    onVerified,
}: {
    phone: string;
    sendOtp: (phone: string) => Promise<unknown>;
    verifyOtp: (phone: string, code: string) => Promise<unknown>;
    onVerified: () => void;
}) {
    const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const code = digits.join('');
    const canSubmit = code.length === OTP_LENGTH && !isVerifying;

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;
        setIsVerifying(true);
        try {
            await verifyOtp(phone, code);
            onVerified();
        } catch (err) {
            if (isSuccessPayload(err)) {
                onVerified();
            } else {
                toast.error(getErrorMessage(err));
                setDigits(Array(OTP_LENGTH).fill(''));
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const resend = async () => {
        if (isResending) return;
        setIsResending(true);
        try {
            const res = await sendOtp(phone);
            toast.success(getSuccessMessage(res, 'A new code has been sent.'));
        } catch (err) {
            if (isSuccessPayload(err)) toast.success(getSuccessMessage(err, 'A new code has been sent.'));
            else toast.error(getErrorMessage(err));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[622px]" noValidate>
            <h2 className="text-xl font-medium text-[#243B4A]">Verify Number</h2>
            <div className="mt-5 border-t border-[#EEEAE6]" />

            <p className="mt-7 max-w-[520px] text-base leading-relaxed text-[#6B7280]">
                Enter your account email and we&apos;ll send a reset link, along with an OTP to your registered number to keep your
                account safe.
            </p>

            <div className="mt-10">
                <OtpInput digits={digits} onChange={setDigits} disabled={isVerifying} />
            </div>

            <div className="mt-16 flex items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={resend}
                    disabled={isResending}
                    className="text-sm font-medium text-[#E95312] transition hover:opacity-70 disabled:opacity-50"
                >
                    {isResending ? 'Sending…' : 'Resend code'}
                </button>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="rounded-lg bg-[#EE7230] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D9622B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isVerifying ? 'Verifying…' : 'Verify identity'}
                </button>
            </div>
        </form>
    );
}

/* ─── Privacy & Security: step 3 – change password ─────────────── */
function ChangePasswordStep({
    resetPassword,
}: {
    resetPassword: (payload: { oldPassword: string; newPassword: string }) => Promise<unknown>;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');

    const results = useMemo(() => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(next) })), [next]);
    const passedCount = results.filter((r) => r.passed).length;
    const isStrong = passedCount === PASSWORD_RULES.length;
    const mismatch = confirm.length > 0 && confirm !== next;
    const sameAsOld = next.length > 0 && next === current;
    const canSubmit = !isSubmitting && current.length > 0 && isStrong && confirm === next && !sameAsOld;

    const finishSuccess = (source: unknown) => {
        setCurrent('');
        setNext('');
        setConfirm('');
        toast.success(getSuccessMessage(source, 'Password updated.'));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;
        setIsSubmitting(true);
        try {
            await resetPassword({ oldPassword: current, newPassword: next });
            setCurrent('');
            setNext('');
            setConfirm('');
            toast.success('Password Reset Successful')
        } catch {
            toast.error('Password Reset failed')
            // Error is set in store
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[560px]" noValidate>
            <h2 className="text-xl font-medium text-[#243B4A]">Change Password</h2>
            <div className="mt-5 border-t border-[#EEEAE6]" />

            <div className="mt-7 space-y-5">
                <PasswordField
                    id="current-password"
                    label="Current Password"
                    value={current}
                    onChange={setCurrent}
                    autoComplete="current-password"
                />
                <div>
                    <PasswordField
                        id="new-password"
                        label="New Password"
                        value={next}
                        onChange={setNext}
                        autoComplete="new-password"
                    />
                    {sameAsOld && (
                        <p className="mt-2 text-xs text-[#E22E41]">New password must be different from your current one.</p>
                    )}
                </div>
                <div>
                    <PasswordField
                        id="confirm-password"
                        label="Confirm Password"
                        value={confirm}
                        onChange={setConfirm}
                        autoComplete="new-password"
                    />
                    {mismatch && <p className="mt-2 text-xs text-[#E22E41]">Passwords do not match.</p>}
                </div>
            </div>

            {/* Strength meter */}
            <div className="mt-7 grid grid-cols-3 gap-3" aria-hidden="true">
                {PASSWORD_RULES.map((rule, i) => (
                    <div key={rule.id} className={`h-[3px] rounded-full ${i < passedCount ? 'bg-[#5BAA5F]' : 'bg-[#E3E0DD]'}`} />
                ))}
            </div>

            <p className="mt-5 text-base text-[#52617A]" aria-live="polite">
                {isStrong ? 'Strong password.' : 'Weak password. Must contain;'}
            </p>
            <ul className="mt-4 space-y-3">
                {results.map((rule) => (
                    <li key={rule.id} className="flex items-center gap-3 text-base text-[#52617A]">
                        <span
                            className={`flex h-[22px] w-[22px] items-center justify-center rounded-full ${rule.passed ? 'bg-[#5BAA5F]' : 'bg-[#E3E0DD]'
                                }`}
                        >
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </span>
                        {rule.label}
                    </li>
                ))}
            </ul>

            <div className="mt-6 border-t border-[#EEEAE6] pt-6">
                <div className="flex items-center justify-end gap-4">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="rounded-lg bg-[#EE7230] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D9622B] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? 'Updating…' : 'Reset Password'}
                    </button>
                </div>
            </div>
        </form>
    );
}

/* ─── Tab: Privacy & Security (verify number → OTP → change password) ─ */
function PrivacySecurity({
    initialPhone,
    sendOtp,
    verifyOtp,
    resetPassword,
}: {
    initialPhone: string;
    sendOtp: (phone: string) => Promise<unknown>;
    verifyOtp: (phone: string, code: string) => Promise<unknown>;
    resetPassword: (payload: { oldPassword: string; newPassword: string }) => Promise<unknown>;
}) {
    const [step, setStep] = useState<SecurityStep>('password');
    const [phone, setPhone] = useState(initialPhone);

    // If the profile loads after this tab opened, fill the number in (only while still empty)
    useEffect(() => {
        setPhone((current) => current || initialPhone);
    }, [initialPhone]);

    if (step === 'phone') {
        return (
            <VerifyPhoneStep
                phone={phone}
                onPhoneChange={setPhone}
                editable={!initialPhone}
                sendOtp={sendOtp}
                onSent={() => setStep('otp')}
            />
        );
    }

    if (step === 'otp') {
        return <OtpStep phone={phone} sendOtp={sendOtp} verifyOtp={verifyOtp} onVerified={() => setStep('password')} />;
    }

    return <ChangePasswordStep resetPassword={resetPassword} />;
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AccountPage() {
    const [tab, setTab] = useState<TabId>('personal');
    const { updateProfile, resetPassword } = useAuthStore();

    const [me, setMe] = useState<any>(null);
    const [meLoading, setMeLoading] = useState(true);
    const [meError, setMeError] = useState<string | null>(null);

    // Backend shape: { code, status, data: { userId, firstName, lastName, displayName, avatarUrl, bio } }
    const loadMe = useCallback(async () => {
        setMeError(null);
        try {
            const res: any = await getCurrentUser();
            setMe(res?.data ?? res ?? null);
        } catch (err) {
            setMeError(getErrorMessage(err));
        } finally {
            setMeLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMe();
    }, [loadMe]);

    const handleUpdateProfile = async (payload: ProfileFields) => {
        await updateProfile(payload);
        await loadMe(); // refresh so the page reflects what the server stored
    };

    // TODO: wire these to your OTP endpoints. They resolve immediately so the UI flow works for now.
    const handleSendOtp = async (_phone: string) => {
        // e.g. return sendPasswordOtp({ phone: _phone });
    };
    const handleVerifyOtp = async (_phone: string, _code: string) => {
        // e.g. return verifyPasswordOtp({ phone: _phone, code: _code });
    };

    return (
        <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
            {/* ── Page header ── */}
            <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">Your account</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">
                    Your details, privacy and security.
                </h2>
                <p className="mt-2 text-sm text-[#777486] sm:text-base">
                    Keep your information current and choose how Hatiso protects you.
                </p>
            </section>

            <main className="px-5 py-6 sm:px-8 lg:py-8">
                <div className="grid gap-8 rounded-lg bg-white p-5 sm:p-5 lg:min-h-[826px] lg:grid-cols-[280px_1fr]">
                    {/* ── Side menu ── */}
                    <aside className="h-fit self-start rounded-xl border border-[#EBE6E1] bg-white px-3.5 pb-8 pt-7" aria-label="Account menu">
                        <p className="px-3 text-xs font-medium uppercase text-[#52617A]">Select menu</p>
                        <div role="tablist" aria-orientation="vertical" className="mt-3 space-y-1">
                            {MENU.map((item) => {
                                const Icon = item.icon;
                                const active = tab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        role="tab"
                                        id={`tab-${item.id}`}
                                        aria-selected={active}
                                        aria-controls={`panel-${item.id}`}
                                        onClick={() => setTab(item.id)}
                                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[15px] transition ${active ? 'bg-[#F3F4F6] font-medium text-[#20232A]' : 'text-[#52617A] hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="h-[18px] w-[18px] shrink-0" />
                                        <span className="flex-1">{item.label}</span>
                                        {active && (
                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#243B4A]">
                                                <ChevronRight className="h-3 w-3 text-white" strokeWidth={3} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* ── Active panel ── */}
                    <section
                        role="tabpanel"
                        id={`panel-${tab}`}
                        aria-labelledby={`tab-${tab}`}
                        className="min-w-0 pt-3 lg:pr-6"
                    >
                        {tab === 'personal' && (
                            <PersonalDetails
                                user={me}
                                loading={meLoading}
                                loadError={meError}
                                onRetry={loadMe}
                                updateProfile={handleUpdateProfile}
                            />
                        )}
                        {tab === 'notifications' && <NotificationSettings />}
                        {tab === 'privacy' && (
                            <PrivacySecurity
                                initialPhone={me?.phoneNumber ?? me?.phone ?? PROFILE.phone}
                                sendOtp={handleSendOtp}
                                verifyOtp={handleVerifyOtp}
                                resetPassword={resetPassword}
                            />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}