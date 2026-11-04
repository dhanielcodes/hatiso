'use client';

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ClipboardEvent,
    type ComponentType,
    type FormEvent,
    type KeyboardEvent,
} from 'react';
import { Bell, Check, ChevronRight, Eye, EyeOff, Lock, LogOut, Pencil, UserPlus, User } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */
type TabId = 'personal' | 'notifications' | 'privacy';
type ResetStep = 'phone' | 'otp' | 'password';

type MenuItem = {
    id: TabId;
    label: string;
    icon: ComponentType<{ className?: string }>;
};

/* ─── Constants ────────────────────────────────────────────────── */
const MENU: MenuItem[] = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Lock },
];

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

/* ─── Dummy data ───────────────────────────────────────────────── */
const PROFILE = {
    fullName: 'Mayowa Babs',
    phone: '09058398933',
    registeredPhone: '+234 904 637 3748',
    email: 'Mayback@gmail.com',
    memberSince: 'Jan 15, 2026',
    pointsBalance: '1,250 pts',
    verified: true,
    tier: 'Silver',
};

const NOTIFICATION_GROUPS = [
    {
        title: 'General Notifications',
        description: 'Notifications about requests, transactions and exclusive offers',
        settings: [
            { key: 'billPayment', label: 'Bill Payment Alerts', description: 'Receive notifications for every payment.', defaultOn: true },
            { key: 'transaction', label: 'Transaction Alerts', description: 'Receive notifications for every transactions.', defaultOn: true },
            { key: 'offers', label: 'Exclusive Offers', description: 'Get exclusive access to promotions, discounts, and more.', defaultOn: false },
        ],
    },
    {
        title: 'Notification Method',
        description: 'Choose how you prefer to receive notifications.',
        settings: [
            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email', defaultOn: true },
            { key: 'push', label: 'Push Notification', description: 'Get real-time updates and alerts directly on your phone', defaultOn: true },
            { key: 'sms', label: 'SMS Notification', description: 'Receive notification via SMS', defaultOn: false },
        ],
    },
];

const PASSWORD_RULES = [
    { id: 'upper', label: 'At least 1 uppercase', test: (v: string) => /[A-Z]/.test(v) },
    { id: 'number', label: 'At least 1 number', test: (v: string) => /\d/.test(v) },
    { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
];

/* ─── Small presentational pieces ──────────────────────────────── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative mt-0.5 h-[18px] w-8 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#5BAA5F]' : 'bg-[#B8BFC8]'}`}
        >
            <span
                className={`absolute top-[2px] h-3.5 w-3.5 rounded-full bg-white shadow transition-all ${checked ? 'left-[16px]' : 'left-[2px]'}`}
            />
        </button>
    );
}

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

/** Row of single-digit boxes: auto-advance, backspace-to-previous, arrow keys and paste support. */
function OtpInput({ digits, onChange }: { digits: string[]; onChange: (next: string[]) => void }) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    const focusAt = (index: number) => {
        const el = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
        el?.focus();
        el?.select();
    };

    const setAt = (index: number, digit: string) => {
        const next = digits.slice();
        next[index] = digit;
        onChange(next);
    };

    const handleChange = (index: number, raw: string) => {
        const digit = raw.replace(/\D/g, '').slice(-1);
        setAt(index, digit);
        if (digit && index < OTP_LENGTH - 1) focusAt(index + 1);
    };

    const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            event.preventDefault();
            setAt(index - 1, '');
            focusAt(index - 1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusAt(index - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusAt(index + 1);
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        event.preventDefault();
        const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? '');
        onChange(next);
        focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
    };

    return (
        <div className="flex gap-2 sm:gap-3" role="group" aria-label="One-time password">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        refs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    aria-label={`Digit ${index + 1}`}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    onFocus={(event) => event.target.select()}
                    className="h-14 w-11 rounded-lg border border-[#E95312] bg-[#FFF5EF] text-center text-xl font-medium text-[#E95312] outline-none transition focus:ring-2 focus:ring-[#E95312]/30 sm:h-16 sm:w-14"
                />
            ))}
        </div>
    );
}

/* ─── Tab: Personal Details ────────────────────────────────────── */
function PersonalDetails() {
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState({ fullName: PROFILE.fullName, phone: PROFILE.phone, email: PROFILE.email });
    const [draft, setDraft] = useState(details);

    const startEdit = () => {
        setDraft(details);
        setIsEditing(true);
    };

    const save = () => {
        setDetails(draft);
        setIsEditing(false);
    };

    const fields: { key: keyof typeof details; label: string; type: string }[] = [
        { key: 'fullName', label: 'Full Name', type: 'text' },
        { key: 'phone', label: 'Phone Number', type: 'tel' },
        { key: 'email', label: 'Email', type: 'email' },
    ];

    return (
        <div>
            <h2 className="text-xl font-medium text-[#243B4A]">Personal Details</h2>

            {/* Profile summary */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#F6F6F7] px-6 py-5">
                <div className="flex items-center gap-5">
                    <span className="flex h-[65px] w-[65px] shrink-0 items-center justify-center rounded-full bg-[#E3E5E8]">
                        <UserPlus className="h-6 w-6 text-[#20232A]" />
                    </span>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <p className="text-lg font-medium text-[#3B4150]">{details.fullName}</p>
                            {PROFILE.verified && (
                                <span className="rounded bg-[#DDF0E4] px-2.5 py-1 text-xs font-medium text-[#2E7D4F]">Verified</span>
                            )}
                            <span className="rounded bg-[#FFF3DB] px-2.5 py-1 text-xs font-medium text-[#9A4A00]">{PROFILE.tier}</span>
                        </div>
                        <p className="mt-3 text-sm text-[#7A7F8A]">Member since - {PROFILE.memberSince}</p>
                    </div>
                </div>
                <div className="pr-1 text-right sm:pr-4">
                    <p className="text-xs text-[#7A7F8A]">Points balance</p>
                    <p className="mt-2 text-sm font-semibold text-[#20232A]">{PROFILE.pointsBalance}</p>
                </div>
            </div>

            {/* Details */}
            <div className="mt-6 rounded-2xl border border-[#F0EDEA] bg-[#F9F9FA] px-6 pb-6 pt-5">
                <div className="flex justify-end gap-2">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="rounded-md border border-[#E6E3E0] bg-white px-3 py-1.5 text-xs text-[#52617A] transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={save}
                                className="rounded-md bg-[#E95312] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#D44A10]"
                            >
                                Save
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
                    {fields.map((field, index) => (
                        <div key={field.key} className={`px-3 py-5 ${index > 0 ? 'border-t border-[#E6E3E0]' : ''}`}>
                            <dt>
                                <label htmlFor={`profile-${field.key}`} className="text-sm text-[#52617A]">
                                    {field.label}
                                </label>
                            </dt>
                            <dd className="mt-1.5">
                                {isEditing ? (
                                    <input
                                        id={`profile-${field.key}`}
                                        type={field.type}
                                        value={draft[field.key]}
                                        onChange={(event) => setDraft((d) => ({ ...d, [field.key]: event.target.value }))}
                                        className="h-10 w-full max-w-sm rounded-lg border border-[#E6E3E0] bg-white px-3 text-base text-[#20232A] outline-none focus:border-[#E95312]"
                                    />
                                ) : (
                                    <p className="text-base font-medium text-[#20232A]">{details[field.key]}</p>
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
    const [values, setValues] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(NOTIFICATION_GROUPS.flatMap((g) => g.settings.map((s) => [s.key, s.defaultOn])))
    );

    return (
        <div className="max-w-[690px]">
            <h2 className="text-xl font-medium text-[#243B4A]">Notification Settings</h2>
            <div className="mt-5 border-t border-[#EEEAE6]">
                {NOTIFICATION_GROUPS.map((group, index) => (
                    <section
                        key={group.title}
                        className={`grid gap-6 py-6 md:grid-cols-[1fr_1fr] ${index > 0 ? 'border-t border-[#EEEAE6]' : ''}`}
                    >
                        <div>
                            <h3 className="text-base font-medium text-[#243B4A]">{group.title}</h3>
                            <p className="mt-2 max-w-[300px] text-sm text-[#7A7F8A]">{group.description}</p>
                        </div>
                        <ul className="space-y-6">
                            {group.settings.map((setting) => (
                                <li key={setting.key} className="flex items-start gap-4">
                                    <Toggle
                                        checked={values[setting.key]}
                                        onChange={(next) => setValues((v) => ({ ...v, [setting.key]: next }))}
                                        label={setting.label}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-[#20232A]">{setting.label}</p>
                                        <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-[#8A8F99]">{setting.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}

/* ─── Privacy & Security: Step 1 — Verify Number ───────────────── */
function VerifyNumberStep({ onSent }: { onSent: () => void }) {
    const [phone, setPhone] = useState(PROFILE.registeredPhone);
    const valid = phone.replace(/\D/g, '').length >= 10;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!valid) return;
        // Dummy only: call your "send reset link + OTP" endpoint here
        onSent();
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[560px]" noValidate>
            <h2 className="text-xl font-medium text-[#243B4A]">Verify Number</h2>
            <div className="mt-5 border-t border-[#EEEAE6]" />

            <p className="mt-7 text-sm leading-relaxed text-[#52617A] sm:text-base">
                Enter your account email and we&apos;ll send a reset link, along with an OTP to your registered number to keep your account safe.
            </p>

            <div className="mt-7">
                <label htmlFor="verify-phone" className="text-sm font-medium text-[#52617A]">
                    Phone Number <span className="text-[#E22E41]">*</span>
                </label>
                <input
                    id="verify-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-[#E6E3E0] bg-white px-4 text-sm tracking-wide text-[#20232A] outline-none transition focus:border-[#E95312]"
                />
            </div>

            <div className="mt-16 flex justify-end">
                <button
                    type="submit"
                    disabled={!valid}
                    className="rounded-lg bg-[#EE7230] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D9622B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Verify identity
                </button>
            </div>
        </form>
    );
}

/* ─── Privacy & Security: Step 2 — Enter OTP ───────────────────── */
function OtpStep({ onVerified, onBack }: { onVerified: () => void; onBack: () => void }) {
    const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
    const [seconds, setSeconds] = useState(RESEND_SECONDS);
    const complete = digits.every(Boolean);

    useEffect(() => {
        if (seconds <= 0) return;
        const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds]);

    const handleResend = () => {
        // Dummy only: call your "resend OTP" endpoint here
        setDigits(Array(OTP_LENGTH).fill(''));
        setSeconds(RESEND_SECONDS);
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!complete) return;
        // Dummy only: verify digits.join('') against your backend here
        onVerified();
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[560px]" noValidate>
            <h2 className="text-xl font-medium text-[#243B4A]">Verify Number</h2>
            <div className="mt-5 border-t border-[#EEEAE6]" />

            <p className="mt-7 text-sm leading-relaxed text-[#52617A] sm:text-base">
                Enter your account email and we&apos;ll send a reset link, along with an OTP to your registered number to keep your account safe.
            </p>

            <div className="mt-7">
                <OtpInput digits={digits} onChange={setDigits} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#7A7F8A]">
                {seconds > 0 ? (
                    <span aria-live="polite">Resend code in {seconds}s</span>
                ) : (
                    <button type="button" onClick={handleResend} className="font-medium text-[#E95312] hover:underline">
                        Resend code
                    </button>
                )}
                <button type="button" onClick={onBack} className="text-[#52617A] hover:underline">
                    Change number
                </button>
            </div>

            <div className="mt-10 flex justify-end">
                <button
                    type="submit"
                    disabled={!complete}
                    className="rounded-lg bg-[#EE7230] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D9622B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Verify identity
                </button>
            </div>
        </form>
    );
}

/* ─── Privacy & Security: Step 3 — Change Password ─────────────── */
function ChangePasswordStep({ onDone }: { onDone: () => void }) {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [done, setDone] = useState(false);

    // Return to step 1 after the success message so a new reset needs fresh verification
    useEffect(() => {
        if (!done) return;
        const timer = setTimeout(onDone, 2500);
        return () => clearTimeout(timer);
    }, [done, onDone]);

    const results = useMemo(() => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(next) })), [next]);
    const passedCount = results.filter((r) => r.passed).length;
    const isStrong = passedCount === PASSWORD_RULES.length;
    const mismatch = confirm.length > 0 && confirm !== next;
    const canSubmit = !done && current.length > 0 && isStrong && confirm === next;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;
        // Dummy only: no request is sent
        setCurrent('');
        setNext('');
        setConfirm('');
        setDone(true);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-[560px]" noValidate>
            <h2 className="text-xl font-medium text-[#243B4A]">Change Password</h2>
            <div className="mt-5 border-t border-[#EEEAE6]" />

            <div className="mt-7 space-y-5">
                <PasswordField id="current-password" label="Password" value={current} onChange={setCurrent} autoComplete="current-password" />
                <PasswordField id="new-password" label="New Password" value={next} onChange={setNext} autoComplete="new-password" />
                <div>
                    <PasswordField id="confirm-password" label="Confirm Password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
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
                            className={`flex h-[22px] w-[22px] items-center justify-center rounded-full ${rule.passed ? 'bg-[#5BAA5F]' : 'bg-[#E3E0DD]'}`}
                        >
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </span>
                        {rule.label}
                    </li>
                ))}
            </ul>

            <div className="mt-6 border-t border-[#EEEAE6] pt-6">
                <div className="flex items-center justify-end gap-4">
                    {done && <p className="text-sm text-[#2E9A4F]">Password updated.</p>}
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="rounded-lg bg-[#EE7230] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#D9622B] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Reset Password
                    </button>
                </div>
            </div>
        </form>
    );
}

/* ─── Tab: Privacy & Security (flow controller) ────────────────── */
function PrivacySecurity() {
    const [step, setStep] = useState<ResetStep>('phone');

    return (
        <>
            {step === 'phone' && <VerifyNumberStep onSent={() => setStep('otp')} />}
            {step === 'otp' && <OtpStep onVerified={() => setStep('password')} onBack={() => setStep('phone')} />}
            {step === 'password' && <ChangePasswordStep onDone={() => setStep('phone')} />}
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AccountPage() {
    const [tab, setTab] = useState<TabId>('personal');

    const handleLogout = () => {
        // Dummy only: hook up your sign-out flow here
    };

    return (
        <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
            {/* ── Page header ── */}

            <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">Your account</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">Your details, privacy and security. <span className="text-[#FF6500]"></span></h2>
                <p className="mt-2 text-sm text-[#777486] sm:text-base">Keep your information current and choose how Hatiso protects you.</p>
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
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[15px] font-medium text-[#E0431F] transition hover:bg-[#FFF3EE]"
                            >
                                <LogOut className="h-[18px] w-[18px] shrink-0" />
                                Log Out
                            </button>
                        </div>
                    </aside>

                    {/* ── Active panel ── */}
                    <section
                        role="tabpanel"
                        id={`panel-${tab}`}
                        aria-labelledby={`tab-${tab}`}
                        className="min-w-0 pt-3 lg:pr-6"
                    >
                        {tab === 'personal' && <PersonalDetails />}
                        {tab === 'notifications' && <NotificationSettings />}
                        {tab === 'privacy' && <PrivacySecurity />}
                    </section>
                </div>
            </main>
        </div>
    );
}