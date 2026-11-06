'use client';

import { useCallback, useEffect, useMemo, useState, type ComponentType, type FormEvent } from 'react';
import { Bell, Check, ChevronRight, Eye, EyeOff, Lock, Pencil, UserPlus, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/lib/queries/useNotifications';
import { useAuthStore } from '@/lib/store/authStore';
import { getCurrentUser } from '@/lib/api/auth';

/* ─── Types ────────────────────────────────────────────────────── */
type TabId = 'personal' | 'notifications' | 'privacy';
type Channel = 'EMAIL' | 'SMS' | 'OFF';

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
};

/* ─── Response helpers ─────────────────────────────────────────── */
const getErrorMessage = (err: unknown) =>
    (err as { message?: string } | null)?.message || 'Something went wrong. Please try again.';

// HTTP failures are rejected by the axios interceptor as plain `ApiError` objects and it
// already shows a toast for them. Only toast errors raised in our own code (`Error` instances),
// so the user never sees the same failure twice.
const notifyError = (err: unknown) => {
    if (err instanceof Error) toast.error(getErrorMessage(err));
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
            notifyError(err);
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
        update.mutate({ purchaseChannel: value }, {
            onSuccess: () => toast.success('Notification preference saved.'),
            onError: (err: unknown) => {
                setSelected(previous);
                notifyError(err);
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

/* ─── Tab: Privacy & Security (change password) ────────────────── */
function PrivacySecurity({
    resetPassword,
}: {
    resetPassword: (payload: { oldPassword: string; newPassword: string }) => Promise<{ message?: string } | void>;
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

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;
        setIsSubmitting(true);
        try {
            const result = await resetPassword({ oldPassword: current, newPassword: next });
            setCurrent('');
            setNext('');
            setConfirm('');
            toast.success(result?.message || 'Password updated.');
        } catch (err) {
            notifyError(err);
        } finally {
            setIsSubmitting(false);
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
                            <PrivacySecurity resetPassword={resetPassword} />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}