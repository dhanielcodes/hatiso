'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { AlertTriangle, Check, CreditCard, KeyRound, Monitor, Moon, Sun, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/lib/queries/useNotifications';
import { useCurrentUser, useResetPassword, useUpdateProfile } from '@/lib/queries/useAuth';
import type { CurrentUserProfile } from '@/lib/api/auth';
import type { NotificationChannel } from '@/lib/api/notifications';
import { useAuthStore } from '@/lib/store/authStore';
import { PasswordField, TextField } from '@/components/forms';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';
import DialogFrame, { DIALOG_DANGER, DIALOG_PRIMARY, DIALOG_SECONDARY } from '@/components/ui/DialogFrame';
import { DEFAULT_THEME, MODES, THEMES, setMode, setTheme, useColorMode, useModeChoice, useTheme, type ModeChoice } from '@/lib/theme/theme';

/* ─── Types and constants ─────────────────────────────────────── */
type TabId = 'details' | 'security' | 'notif' | 'look' | 'pay';
type ProfileFields = { firstName: string; lastName: string; displayName: string; bio: string };
type PasswordValues = { current: string; next: string; confirm: string };

const TABS: [TabId, string][] = [
    ['details', 'Personal details'],
    ['security', 'Security'],
    ['notif', 'Notifications'],
    ['look', 'Appearance'],
    ['pay', 'Payment methods'],
];

const CARD = 'rounded-[14px] border border-tone-100 bg-surface';
const BTN = DIALOG_SECONDARY;
const BTN_PRIMARY = DIALOG_PRIMARY;
const READONLY_INPUT = 'min-h-12 rounded-lg border border-tone-100 bg-tone-44 px-3.5 text-[15px] font-normal text-tone-414 outline-none';

const PASSWORD_RULES = [
    { id: 'length', test: (v: string) => v.length >= 8 },
    { id: 'upper', test: (v: string) => /[A-Z]/.test(v) },
    { id: 'number', test: (v: string) => /\d/.test(v) },
];

// The axios interceptor already toasts HTTP failures; only toast errors raised in our own code.
const notifyError = (err: unknown) => {
    if (err instanceof Error) toast.error(err.message || 'Something went wrong. Please try again.');
};

const profileSchema = Yup.object({
    firstName: Yup.string().trim().required('First name is required.'),
    lastName: Yup.string().trim().required('Last name is required.'),
});

const passwordSchema = Yup.object({
    current: Yup.string().required('Enter your current password.'),
    next: Yup.string()
        .required('Enter a new password.')
        .test('rules', 'Use at least 8 characters, an uppercase letter and a number.', (v = '') => PASSWORD_RULES.every((r) => r.test(v)))
        .notOneOf([Yup.ref('current')], 'New password must be different from your current one.'),
    confirm: Yup.string().required('Type the new password again.').oneOf([Yup.ref('next')], 'Passwords do not match.'),
});

const fromUser = (u?: CurrentUserProfile): ProfileFields => ({
    firstName: u?.firstName ?? '',
    lastName: u?.lastName ?? '',
    displayName: u?.displayName ?? '',
    bio: u?.bio ?? '',
});

function initials(first: string, last: string) {
    return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase() || 'H';
}

function maskPhone(phone?: string) {
    if (!phone) return '';
    const d = phone.replace(/\s+/g, '');
    return d.length > 7 ? `${d.slice(0, 4)} ••• ${d.slice(-4)}` : d;
}

function Switch({ on, label, onToggle, disabled }: { on: boolean; label: string; onToggle: () => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            onClick={onToggle}
            disabled={disabled}
            className={`relative h-6 w-[42px] shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${on ? 'bg-brand-305' : 'bg-grey-150'}`}
        >
            <span className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-[18px]' : ''}`} />
        </button>
    );
}

/* ─── Personal details ─────────────────────────────────────────── */
function PersonalDetails({ onDelete }: { onDelete: () => void }) {
    const { data: profile, isLoading, isError, refetch } = useCurrentUser();
    const { user } = useAuthStore();
    const updateProfile = useUpdateProfile();
    const details = useMemo(() => fromUser(profile), [profile]);
    const [saved, setSaved] = useState(false);

    const save = async (values: ProfileFields) => {
        try {
            await updateProfile.mutateAsync({
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                displayName: values.displayName.trim(),
                bio: values.bio.trim(),
            });
            setSaved(true);
            toast.success('Profile updated.');
        } catch (err) {
            notifyError(err);
        }
    };

    if (isLoading) {
        return (
            <SkeletonGroup label="Loading your details" className={`${CARD} flex flex-col gap-5 p-6`}>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton strong className="h-5 w-40" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
            </SkeletonGroup>
        );
    }

    if (isError && !profile) {
        return (
            <div className={`${CARD} p-6`}>
                <p className="text-sm text-status-error" role="alert">We couldn&apos;t load your details.</p>
                <button type="button" onClick={() => refetch()} className={`${BTN} mt-4`}>Try again</button>
            </div>
        );
    }

    const name = details.displayName || `${details.firstName} ${details.lastName}`.trim() || user?.name || '';

    return (
        <div className="hz-stagger flex flex-wrap items-start gap-4">
            <Formik<ProfileFields> initialValues={details} validationSchema={profileSchema} enableReinitialize onSubmit={save}>
                {({ resetForm, dirty, isSubmitting }) => (
                    <Form noValidate className={`${CARD} flex min-w-0 flex-[999_1_520px] flex-col gap-[22px] p-6`} onChange={() => setSaved(false)}>
                        <div className="flex items-center gap-4">
                            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-305 text-[22px] font-semibold text-on-brand">
                                {profile?.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    initials(details.firstName, details.lastName)
                                )}
                            </span>
                            <span className="flex flex-col gap-1.5">
                                <span className="text-lg font-semibold">{name}</span>
                                {/* Photo upload has no API yet. */}
                                <button type="button" disabled title="Photo upload is coming soon" className={`${BTN} min-h-9 px-3 text-[13px]`}>
                                    Change photo
                                </button>
                            </span>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-4">
                            <TextField name="firstName" id="profile-firstName" label="First name" required variant="dashboard" autoComplete="given-name" />
                            <TextField name="lastName" id="profile-lastName" label="Last name" required variant="dashboard" autoComplete="family-name" />
                            <label className="flex flex-col gap-2 text-sm font-medium">
                                Email address
                                <input readOnly value={user?.email || 'Not added'} className={READONLY_INPUT} />
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-medium">
                                Phone number
                                <input readOnly value={user?.phone || 'Not added'} className={READONLY_INPUT} />
                            </label>
                        </div>
                        <div className="flex justify-end gap-2.5">
                            <button type="button" onClick={() => resetForm()} disabled={!dirty || isSubmitting} className={BTN}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || (!dirty && !saved)} className={BTN_PRIMARY}>
                                {isSubmitting ? 'Saving…' : saved && !dirty ? 'Saved' : 'Save changes'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>

            <aside className={`${CARD} flex min-w-0 flex-[1_1_280px] flex-col gap-3 p-[22px]`}>
                <h2 className="text-lg font-semibold">Account</h2>
                <div className="flex justify-between gap-3 text-sm">
                    <span className="text-tone-414">Email</span>
                    <span className="truncate font-medium">{user?.email || 'Not added'}</span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                    <span className="text-tone-414">Phone</span>
                    <span className="font-medium">{maskPhone(user?.phone) || 'Not added'}</span>
                </div>
                <button type="button" onClick={onDelete} className={`${BTN} mt-2 text-status-error`}>
                    Delete account
                </button>
            </aside>
        </div>
    );
}

/* ─── Security ─────────────────────────────────────────────────── */
function deviceLabel() {
    if (typeof navigator === 'undefined') return 'This browser';
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '';
    return os ? `${browser} on ${os}` : browser;
}

function Security({ onChangePassword }: { onChangePassword: () => void }) {
    const [device] = useState(deviceLabel);
    return (
        <div className="hz-stagger flex flex-col gap-4">
            <section className={`${CARD} flex flex-wrap items-center gap-4 p-[22px]`}>
                <span className="flex flex-[1_1_300px] flex-col gap-1">
                    <span className="text-base font-semibold">Password</span>
                    <span className="text-sm text-tone-414">Use at least 8 characters, an uppercase letter and a number.</span>
                </span>
                <button type="button" onClick={onChangePassword} className={BTN}>Change password</button>
            </section>
            <section className={`${CARD} flex flex-wrap items-center gap-4 p-[22px]`}>
                <span className="flex flex-[1_1_300px] flex-col gap-1">
                    <span className="text-base font-semibold">Two-step verification</span>
                    <span className="text-sm text-tone-414">Ask for a code from your phone when you sign in on a new device.</span>
                    <span className="text-[13px] font-medium text-status-warning">Coming soon</span>
                </span>
                {/* No two-step API yet, so the switch stays off. */}
                <Switch on={false} label="Two-step verification" onToggle={() => undefined} disabled />
            </section>
            <section className={`${CARD} flex flex-col p-[22px]`}>
                <h2 className="pb-2 text-lg font-semibold">Where you&apos;re signed in</h2>
                <div className="flex items-center gap-3 border-t border-tone-44 py-3">
                    <span className="flex flex-1 flex-col gap-0.5">
                        <span className="text-[15px] font-medium">{device}</span>
                        <span className="text-[13px] text-tone-414">Now</span>
                    </span>
                    <span className="text-[13px] font-medium text-status-success">This device</span>
                </div>
                <p className="border-t border-tone-44 pt-3 text-[13px] text-tone-414">Other devices will show here once device history is available.</p>
            </section>
        </div>
    );
}

/* ─── Notifications ────────────────────────────────────────────── */
function NotificationPrefs() {
    const { user } = useAuthStore();
    const { data, isLoading, isError } = useNotificationSettings();
    const update = useUpdateNotificationSettings();
    const channel = data?.purchaseChannel;
    const available = data?.availableChannels ?? [];
    const [local, setLocal] = useState({ signin: true, weekly: false, offers: false });

    const choose = (next: NotificationChannel) =>
        update.mutate({ purchaseChannel: next }, {
            onSuccess: () => toast.success('Notification preference saved.'),
            onError: notifyError,
        });

    const busy = isLoading || update.isPending;
    const groups = [
        {
            title: 'Payments',
            note: 'Receipts and payment updates go to one channel at a time.',
            items: [
                { label: 'Receipts by email', note: user?.email || 'No email on your account', on: channel === 'EMAIL', toggle: () => choose(channel === 'EMAIL' ? 'OFF' : 'EMAIL'), disabled: busy || !available.includes('EMAIL') },
                { label: 'Payment updates by SMS', note: maskPhone(user?.phone) || 'No phone on your account', on: channel === 'SMS', toggle: () => choose(channel === 'SMS' ? 'OFF' : 'SMS'), disabled: busy || !available.includes('SMS') },
            ],
        },
        {
            title: 'Account and security',
            note: 'Sign-ins and changes to your account. Security alerts are always on.',
            items: [
                { label: 'New sign-in alerts', note: 'Email and push', on: local.signin, toggle: () => setLocal((s) => ({ ...s, signin: !s.signin })), disabled: false },
                { label: 'Weekly spending summary', note: 'Every Monday by email', on: local.weekly, toggle: () => setLocal((s) => ({ ...s, weekly: !s.weekly })), disabled: false },
            ],
        },
        {
            title: 'Offers',
            note: 'Promotions and new services.',
            items: [{ label: 'Offers and news', note: 'Email and push', on: local.offers, toggle: () => setLocal((s) => ({ ...s, offers: !s.offers })), disabled: false }],
        },
    ];

    return (
        <div className="hz-stagger flex flex-col gap-4">
            {isError && <p role="alert" className="text-sm text-status-error">We couldn&apos;t load your notification settings.</p>}
            {groups.map((g) => (
                <section key={g.title} className={`${CARD} flex flex-col p-[22px]`}>
                    <div className="flex flex-col gap-1 pb-2">
                        <h2 className="text-lg font-semibold">{g.title}</h2>
                        <span className="text-sm text-tone-414">{g.note}</span>
                    </div>
                    {g.items.map((p) => (
                        <div key={p.label} className="flex items-center gap-3 border-t border-tone-44 py-3">
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="text-[15px] font-medium">{p.label}</span>
                                <span className="truncate text-[13px] text-tone-414">{p.note}</span>
                            </span>
                            <Switch on={p.on} label={p.label} onToggle={p.toggle} disabled={p.disabled} />
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
}

/* ─── Appearance ───────────────────────────────────────────────── */
const MODE_ICONS: Record<ModeChoice, typeof Sun> = { light: Sun, dark: Moon, system: Monitor };

function Appearance() {
    const active = useTheme();
    const mode = useColorMode();
    const modeChoice = useModeChoice();
    return (
        <section className={`hz-pop ${CARD} flex flex-col gap-[18px] p-[22px]`}>
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">Appearance</h2>
                <span className="text-sm text-tone-414">Choose the colours for your dashboard and whether it&apos;s light or dark. It&apos;s saved on this device.</span>
            </div>
            <div className="flex flex-col gap-2.5">
                <span id="mode-label" className="text-sm font-medium">Mode</span>
                <div role="radiogroup" aria-labelledby="mode-label" className="inline-flex flex-wrap self-start rounded-[10px] bg-tone-44 p-1">
                    {MODES.map((option) => {
                        const on = modeChoice === option.id;
                        const Icon = MODE_ICONS[option.id];
                        return (
                            <button
                                key={option.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => setMode(option.id)}
                                className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition ${on ? 'bg-surface text-tone-744 shadow-[0_1px_3px_rgba(18,21,26,0.15)]' : 'text-tone-414 hover:text-tone-744'}`}
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                {option.name}
                            </button>
                        );
                    })}
                </div>
            </div>
            <span id="theme-label" className="text-sm font-medium">Theme</span>
            <div role="radiogroup" aria-labelledby="theme-label" className="-mt-2 grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3.5">
                {THEMES.map((theme) => {
                    const on = active === theme.id;
                    // Each card previews the theme in the mode that's on screen.
                    const [side, accent, background, line, card] = mode === 'dark' ? theme.darkSwatches : theme.swatches;
                    return (
                        <button
                            key={theme.id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => !on && setTheme(theme.id)}
                            className={`flex flex-col overflow-hidden rounded-xl text-left transition-colors ${on ? 'border-2 border-brand-305' : 'border border-tone-100 hover:border-tone-414'}`}
                        >
                            <span aria-hidden="true" className="flex h-24" style={{ backgroundColor: background }}>
                                <span className="flex w-1/4 flex-col gap-1.5 p-2" style={{ backgroundColor: side }}>
                                    <span className="h-1.5 w-full rounded-full" style={{ backgroundColor: accent }} />
                                    <span className="h-1.5 w-3/4 rounded-full bg-white/30" />
                                    <span className="h-1.5 w-2/3 rounded-full bg-white/30" />
                                </span>
                                <span className="flex flex-1 flex-col gap-2 p-2.5">
                                    <span className="h-2 w-1/2 rounded-full" style={{ backgroundColor: side }} />
                                    <span className="flex-1 rounded-md border" style={{ borderColor: line, backgroundColor: card }} />
                                </span>
                            </span>
                            <span className="flex items-center gap-3 p-3.5">
                                <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-brand-305' : 'border-grey-400'}`}>
                                    {on && <span className="h-2 w-2 rounded-full bg-brand-305" />}
                                </span>
                                <span className="flex flex-col gap-0.5">
                                    <span className="text-[15px] font-medium">{theme.name}</span>
                                    <span className="text-[13px] text-tone-414">{theme.id === DEFAULT_THEME ? 'Recommended' : theme.description}</span>
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

/* ─── Payment methods ──────────────────────────────────────────── */
function PaymentMethods() {
    // No saved-card API: cards are entered on Paystack's checkout each time.
    return (
        <section className={`hz-pop ${CARD} flex flex-col items-center gap-3 px-6 py-12 text-center`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-tone-44">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-semibold">No saved cards yet</h2>
            <p className="max-w-[420px] text-sm leading-normal text-tone-414">
                You enter your card on Paystack&apos;s secure checkout each time you pay. Hatiso never stores your card details.
            </p>
        </section>
    );
}

/* ─── Dialogs ──────────────────────────────────────────────────── */
const EMPTY_PASSWORDS: PasswordValues = { current: '', next: '', confirm: '' };

function ChangePasswordDialog({ onClose }: { onClose: () => void }) {
    const resetPassword = useResetPassword();
    const submit = async (values: PasswordValues, { resetForm }: FormikHelpers<PasswordValues>) => {
        try {
            const result = await resetPassword.mutateAsync({ oldPassword: values.current, newPassword: values.next });
            resetForm();
            toast.success(result?.message || 'Password updated.');
            onClose();
        } catch (err) {
            notifyError(err);
        }
    };
    return (
        <Formik<PasswordValues> initialValues={EMPTY_PASSWORDS} validationSchema={passwordSchema} onSubmit={submit}>
            {({ values, isSubmitting, submitForm }) => (
                <DialogFrame
                    title="Change password"
                    icon={KeyRound}
                    onClose={onClose}
                    footer={
                        <>
                            <button type="button" onClick={onClose} className={DIALOG_SECONDARY}>Cancel</button>
                            <button type="button" onClick={submitForm} disabled={isSubmitting} className={DIALOG_PRIMARY}>
                                {isSubmitting ? 'Updating…' : 'Update password'}
                            </button>
                        </>
                    }
                >
                    <Form noValidate className="flex flex-col gap-3.5">
                        <PasswordField name="current" label="Current password" required variant="dashboard" autoComplete="current-password" />
                        <PasswordField name="next" label="New password" required variant="dashboard" autoComplete="new-password" placeholder="At least 8 characters" />
                        <PasswordField name="confirm" label="Confirm new password" required variant="dashboard" autoComplete="new-password" placeholder="Type it again" />
                        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-tone-414" aria-label="Password rules">
                            {[['length', '8+ characters'], ['upper', 'Uppercase letter'], ['number', 'Number']].map(([id, label]) => {
                                const ok = PASSWORD_RULES.find((r) => r.id === id)!.test(values.next);
                                return (
                                    <li key={id} className={`inline-flex items-center gap-1.5 ${ok ? 'text-tone-744' : ''}`}>
                                        <Check className={`h-3.5 w-3.5 ${ok ? '' : 'opacity-30'}`} aria-hidden="true" />
                                        {label}
                                    </li>
                                );
                            })}
                        </ul>
                        <button type="submit" hidden aria-hidden="true" />
                    </Form>
                </DialogFrame>
            )}
        </Formik>
    );
}

function DeleteAccountDialog({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [typed, setTyped] = useState('');
    // There's no self-serve delete API, so confirming hands the request to support.
    const confirm = () => {
        onClose();
        toast.message('Our support team will finish closing your account.');
        router.push('/dashboard/support');
    };
    return (
        <DialogFrame
            title="Delete your account?"
            icon={Trash2}
            tone="danger"
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className={DIALOG_SECONDARY}>Keep my account</button>
                    <button type="button" onClick={confirm} disabled={typed.trim() !== 'DELETE'} className={DIALOG_DANGER}>Delete account</button>
                </>
            }
        >
            <p className="text-[15px] leading-relaxed text-tone-414">This removes your saved numbers and receipts. It can&apos;t be undone.</p>
            <label className="flex flex-col gap-2 text-sm font-medium">
                Type DELETE to confirm
                <input
                    type="text"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="DELETE"
                    autoComplete="off"
                    className="min-h-12 rounded-lg border border-tone-100 bg-surface px-3.5 text-[15px] font-normal outline-none focus:border-brand-305"
                />
            </label>
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-status-error">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Warning: this is permanent
            </span>
        </DialogFrame>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AccountPage() {
    const [tab, setTab] = useState<TabId>('details');
    const [dialog, setDialog] = useState<'password' | 'delete' | null>(null);

    return (
        <div className="min-h-full bg-tone-44 text-tone-744">
            <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
                <div className="hz-rise flex flex-col gap-1.5">
                    <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em]">Profile and security</h1>
                    <span className="text-[15px] text-tone-414">Your details, how you sign in, and how you pay.</span>
                </div>

                <div className="hz-rise" style={{ '--d': 1 } as React.CSSProperties}>
                    <div role="radiogroup" aria-label="Section" className="flex flex-wrap gap-2">
                        {TABS.map(([id, label]) => {
                            const on = tab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    role="radio"
                                    aria-checked={on}
                                    onClick={() => setTab(id)}
                                    className={`min-h-[38px] rounded-lg border px-3.5 text-sm font-medium transition-colors ${on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface hover:border-tone-414'}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {tab === 'details' && <PersonalDetails onDelete={() => setDialog('delete')} />}
                {tab === 'security' && <Security onChangePassword={() => setDialog('password')} />}
                {tab === 'notif' && <NotificationPrefs />}
                {tab === 'look' && <Appearance />}
                {tab === 'pay' && <PaymentMethods />}
            </div>

            {dialog === 'password' && <ChangePasswordDialog onClose={() => setDialog(null)} />}
            {dialog === 'delete' && <DeleteAccountDialog onClose={() => setDialog(null)} />}
        </div>
    );
}

