'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Bell, Check, ChevronRight, Lock, Pencil, UserPlus, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNotificationSettings, useUpdateNotificationSettings } from '@/lib/queries/useNotifications';
import { useCurrentUser, useResetPassword, useUpdateProfile } from '@/lib/queries/useAuth';
import type { CurrentUserProfile } from '@/lib/api/auth';
import type { NotificationChannel } from '@/lib/api/notifications';
import { Button, PasswordField, SubmitButton, TextAreaField, TextField } from '@/components/forms';
import { Skeleton, SkeletonGroup } from '@/components/ui/Skeleton';

/* ─── Types ────────────────────────────────────────────────────── */
type TabId = 'personal' | 'notifications' | 'privacy';
type Channel = NotificationChannel;

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

/* ─── Response helpers ─────────────────────────────────────────── */
const getErrorMessage = (err: unknown) =>
    (err as { message?: string } | null)?.message || 'Something went wrong. Please try again.';

// HTTP failures are rejected by the axios interceptor as plain `ApiError` objects and it
// already shows a toast for them. Only toast errors raised in our own code (`Error` instances),
// so the user never sees the same failure twice.
const notifyError = (err: unknown) => {
    if (err instanceof Error) toast.error(getErrorMessage(err));
};

/* ─── Validation ───────────────────────────────────────────────── */
const profileSchema = Yup.object({
    firstName: Yup.string().trim().required('First name is required.'),
    lastName: Yup.string().trim().required('Last name is required.'),
    displayName: Yup.string().trim(),
    bio: Yup.string().trim(),
});

type PasswordValues = { current: string; next: string; confirm: string };

const passwordSchema = Yup.object({
    current: Yup.string().required('Enter your current password.'),
    next: Yup.string()
        .required('Enter a new password.')
        .test('rules', 'Password does not meet the rules below.', (v = '') => PASSWORD_RULES.every((rule) => rule.test(v)))
        .notOneOf([Yup.ref('current')], 'New password must be different from your current one.'),
    confirm: Yup.string()
        .required('Confirm your new password.')
        .oneOf([Yup.ref('next')], 'Passwords do not match.'),
});

/* ─── Tab: Personal Details ────────────────────────────────────── */
const fromUser = (u?: CurrentUserProfile): ProfileFields => ({
    firstName: u?.firstName ?? '',
    lastName: u?.lastName ?? '',
    displayName: u?.displayName ?? '',
    bio: u?.bio ?? '',
});

function PersonalDetails() {
    const { data: user, isLoading, isError, refetch } = useCurrentUser();
    const updateProfile = useUpdateProfile();
    const [isEditing, setIsEditing] = useState(false);
    const details = useMemo(() => fromUser(user), [user]);

    const save = async (values: ProfileFields) => {
        const payload: ProfileFields = {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            displayName: values.displayName.trim(),
            bio: values.bio.trim(),
        };
        try {
            // On success the hook refetches the current user, so the page shows what the server stored
            await updateProfile.mutateAsync(payload);
            setIsEditing(false);
            toast.success('Profile updated.');
        } catch (err) {
            notifyError(err);
        }
    };

    const editable: { key: keyof ProfileFields; label: string; multiline?: boolean; required?: boolean }[] = [
        { key: 'firstName', label: 'First Name', required: true },
        { key: 'lastName', label: 'Last Name', required: true },
        { key: 'displayName', label: 'Display Name' },
        { key: 'bio', label: 'Bio', multiline: true },
    ];

    const shownName = details.displayName || `${details.firstName} ${details.lastName}`.trim() || '—';

    if (isLoading) {
        return (
            <div>
                <h2 className="text-xl font-medium text-[#10202A]">Personal Details</h2>
                <SkeletonGroup label="Loading your details">
                    <div className="mt-8 flex items-center gap-5 rounded-2xl bg-[#F6F6F7] px-6 py-5">
                        <Skeleton className="h-[65px] w-[65px] shrink-0 rounded-full" />
                        <Skeleton strong className="h-5 w-40" />
                    </div>
                    <div className="mt-6 rounded-2xl border border-[#F3F4F5] bg-[#F9F9FA] px-6 pb-6 pt-5">
                        {Array.from({ length: 4 }, (_, index) => (
                            <div key={index} className={`space-y-2 px-3 py-5 ${index > 0 ? 'border-t border-[#E3E8EB]' : ''}`}>
                                <Skeleton className="h-3.5 w-24" />
                                <Skeleton strong className="h-5 w-48" />
                            </div>
                        ))}
                    </div>
                </SkeletonGroup>
            </div>
        );
    }

    if (isError && !user) {
        return (
            <div>
                <h2 className="text-xl font-medium text-[#10202A]">Personal Details</h2>
                <p className="mt-8 text-sm text-[#E22E41]" role="alert">Couldn&apos;t load your details.</p>
                <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-4">
                    Try again
                </Button>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-medium text-[#10202A]">Personal Details</h2>

            {/* Profile summary */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#F6F6F7] px-6 py-5">
                <div className="flex items-center gap-5">
                    <span className="flex h-[65px] w-[65px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E3E5E8]">
                        {user?.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <UserPlus className="h-6 w-6 text-[#10202A]" />
                        )}
                    </span>
                    <p className="text-lg font-medium text-[#233C49]">{shownName}</p>
                </div>
            </div>

            {/* Details */}
            <Formik<ProfileFields> initialValues={details} validationSchema={profileSchema} enableReinitialize onSubmit={save}>
                {({ resetForm }) => (
                    <Form noValidate className="mt-6 rounded-2xl border border-[#F3F4F5] bg-[#F9F9FA] px-6 pb-6 pt-5">
                        <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            resetForm();
                                            setIsEditing(false);
                                        }}
                                        disabled={updateProfile.isPending}
                                    >
                                        Cancel
                                    </Button>
                                    <SubmitButton variant="primary" size="sm" loadingLabel="Saving…">
                                        Save
                                    </SubmitButton>
                                </>
                            ) : (
                                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                                    <Pencil className="h-3 w-3" /> Edit
                                </Button>
                            )}
                        </div>

                        <div className="mt-1">
                            {editable.map((field, index) => (
                                <div key={field.key} className={`px-3 py-5 ${index > 0 ? 'border-t border-[#E3E8EB]' : ''}`}>
                                    {isEditing ? (
                                        field.multiline ? (
                                            <TextAreaField
                                                name={field.key}
                                                id={`profile-${field.key}`}
                                                label={field.label}
                                                variant="dashboard"
                                                rows={3}
                                                className="max-w-sm"
                                            />
                                        ) : (
                                            <TextField
                                                name={field.key}
                                                id={`profile-${field.key}`}
                                                label={field.label}
                                                required={field.required}
                                                variant="dashboard"
                                                className="max-w-sm"
                                            />
                                        )
                                    ) : (
                                        <>
                                            <p className="text-sm text-[#4A5B64]">{field.label}</p>
                                            <p className="mt-1.5 text-base font-medium text-[#10202A]">{details[field.key] || '—'}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

/* ─── Tab: Notification Settings ───────────────────────────────── */
function NotificationSettings() {
    const { data, isLoading, isError } = useNotificationSettings();
    const update = useUpdateNotificationSettings();
    const [selected, setSelected] = useState<Channel | undefined>();

    const current = data?.purchaseChannel;
    const available = data?.availableChannels ?? [];

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
            <h2 className="text-xl font-medium text-[#10202A]">Notification Settings</h2>
            <div className="mt-5 grid gap-6 border-t border-[#E3E8EB] py-6 md:grid-cols-[1fr_1fr]">
                <div>
                    <h3 className="text-base font-medium text-[#10202A]">Purchase Alerts</h3>
                    <p className="mt-2 max-w-[300px] text-sm text-[#5D6F78]">
                        Choose how you want to be notified about your purchases.
                    </p>
                </div>

                {isLoading ? (
                    <SkeletonGroup className="space-y-5" label="Loading notification settings">
                        {CHANNEL_OPTIONS.map((opt) => (
                            <div key={opt.value} className="flex items-start gap-4">
                                <Skeleton className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton strong className="h-4 w-16" />
                                    <Skeleton className="h-3 w-full max-w-[260px]" />
                                </div>
                            </div>
                        ))}
                    </SkeletonGroup>
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
                                        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${checked ? 'border-[#EE6E2D]' : 'border-[#B8BFC8]'
                                            }`}
                                    >
                                        {checked && <span className="h-2 w-2 rounded-full bg-[#EE6E2D]" />}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-medium text-[#10202A]">{opt.label}</span>
                                        <span className="mt-1 block max-w-[260px] text-xs leading-relaxed text-[#5D6F78]">
                                            {enabled ? opt.description : `${opt.label} isn't verified on your account yet.`}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                        <p className="text-xs text-[#5D6F78]">Push notifications aren&apos;t available yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Tab: Privacy & Security (change password) ────────────────── */
const EMPTY_PASSWORDS: PasswordValues = { current: '', next: '', confirm: '' };

function PrivacySecurity() {
    const resetPassword = useResetPassword();

    const handleSubmit = async (values: PasswordValues, { resetForm }: FormikHelpers<PasswordValues>) => {
        try {
            const result = await resetPassword.mutateAsync({ oldPassword: values.current, newPassword: values.next });
            resetForm();
            toast.success(result?.message || 'Password updated.');
        } catch (err) {
            notifyError(err);
        }
    };

    return (
        <Formik<PasswordValues> initialValues={EMPTY_PASSWORDS} validationSchema={passwordSchema} onSubmit={handleSubmit}>
            {({ values }) => {
                const results = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(values.next) }));
                const passedCount = results.filter((r) => r.passed).length;
                const isStrong = passedCount === PASSWORD_RULES.length;

                return (
                    <Form className="max-w-[560px]" noValidate>
                        <h2 className="text-xl font-medium text-[#10202A]">Change Password</h2>
                        <div className="mt-5 border-t border-[#E3E8EB]" />

                        <div className="mt-7 space-y-5">
                            <PasswordField name="current" label="Current Password" required variant="dashboard" autoComplete="current-password" />
                            <PasswordField name="next" label="New Password" required variant="dashboard" autoComplete="new-password" />
                            <PasswordField name="confirm" label="Confirm Password" required variant="dashboard" autoComplete="new-password" />
                        </div>

                        {/* Strength meter */}
                        <div className="mt-7 grid grid-cols-3 gap-3" aria-hidden="true">
                            {PASSWORD_RULES.map((rule, i) => (
                                <div key={rule.id} className={`h-[3px] rounded-full ${i < passedCount ? 'bg-[#5BAA5F]' : 'bg-[#E3E8EB]'}`} />
                            ))}
                        </div>

                        <p className="mt-5 text-base text-[#4A5B64]" aria-live="polite">
                            {isStrong ? 'Strong password.' : 'Weak password. Must contain;'}
                        </p>
                        <ul className="mt-4 space-y-3">
                            {results.map((rule) => (
                                <li key={rule.id} className="flex items-center gap-3 text-base text-[#4A5B64]">
                                    <span
                                        className={`flex h-[22px] w-[22px] items-center justify-center rounded-full ${rule.passed ? 'bg-[#5BAA5F]' : 'bg-[#E3E8EB]'}`}
                                    >
                                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                    </span>
                                    {rule.label}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 flex justify-end border-t border-[#E3E8EB] pt-6">
                            <SubmitButton variant="primary" size="lg" loadingLabel="Updating…">
                                Reset Password
                            </SubmitButton>
                        </div>
                    </Form>
                );
            }}
        </Formik>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AccountPage() {
    const [tab, setTab] = useState<TabId>('personal');
    return (
        <div className="min-h-full bg-[#F3F4F5] text-[#10202A]">
            {/* ── Page header ── */}
            <section className="border-b border-[#E3E8EB] px-5 py-7 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C2531C]">Your account</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#10202A] sm:text-3xl">
                    Your details, privacy and security.
                </h2>
                <p className="mt-2 text-sm text-[#4A5B64] sm:text-base">
                    Keep your information current and choose how Hatiso protects you.
                </p>
            </section>

            <main className="px-5 py-6 sm:px-8 lg:py-8">
                <div className="grid gap-8 rounded-2xl bg-white p-5 sm:p-5 lg:min-h-[826px] lg:grid-cols-[280px_1fr]">
                    {/* ── Side menu ── */}
                    <aside className="h-fit self-start rounded-3xl border border-[#E3E8EB] bg-white px-3.5 pb-8 pt-7" aria-label="Account menu">
                        <p className="px-3 text-xs font-medium uppercase text-[#4A5B64]">Select menu</p>
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
                                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[15px] transition ${active ? 'bg-[#F3F4F6] font-medium text-[#10202A]' : 'text-[#4A5B64] hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="h-[18px] w-[18px] shrink-0" />
                                        <span className="flex-1">{item.label}</span>
                                        {active && (
                                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#10202A]">
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
                            <PersonalDetails />
                        )}
                        {tab === 'notifications' && <NotificationSettings />}
                        {tab === 'privacy' && (
                            <PrivacySecurity />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}