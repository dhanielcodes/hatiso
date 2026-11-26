'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Bell, CheckCheck, Gift, Lock, Receipt, type LucideIcon } from 'lucide-react';
import moment from 'moment';
import { toast } from 'sonner';
import { useNotifications, useNotificationSettings, useUpdateNotificationSettings } from '@/lib/queries/useNotifications';
import type { NotificationChannel } from '@/lib/api/notifications';
import { useAuthStore } from '@/lib/store/authStore';
import { ListSkeleton } from '@/components/ui/Skeleton';

/** One item as returned by the API. */
type ApiNotification = {
    id: string;
    category: string; // e.g. "PAYMENT_UPDATES"
    status: string; // e.g. "PENDING" | "FAILED" | "SUCCESS"
    title: string;
    message: string;
    orderReference?: string;
    productName?: string;
    amountMinor?: number;
    currency?: string;
    createdAt: string; // ISO timestamp
};

type NotificationsPayload = { items: ApiNotification[]; page: number; size: number; hasMore: boolean };

/** Accepts either the full envelope ({ code, status, data }) or the inner `data` object. */
function unwrapNotifications(payload: unknown): NotificationsPayload | undefined {
    if (!payload || typeof payload !== 'object') return undefined;
    const candidate = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(candidate.items)) return payload as NotificationsPayload;
    if (candidate.data && typeof candidate.data === 'object') {
        const inner = candidate.data as { items?: unknown };
        if (Array.isArray(inner.items)) return candidate.data as NotificationsPayload;
    }
    return undefined;
}

/** Notifications board tabs. "Unread" is worked out in the browser; the rest map to API categories. */
type Tab = 'all' | 'unread' | 'pay' | 'account' | 'offers';
const TAB_CATEGORY: Record<Tab, string | null> = {
    all: null,
    unread: null,
    pay: 'PAYMENT_UPDATES',
    account: 'SECURITY_ALERTS',
    offers: 'OFFERS',
};

const CATEGORY_ICON: Record<string, LucideIcon> = {
    PAYMENT_UPDATES: Receipt,
    REMINDERS: Bell,
    OFFERS: Gift,
    SECURITY_ALERTS: Lock,
};

/* The API has no read state, so read notifications are remembered in this browser. */
const READ_KEY = 'hatiso_read_notifications';
const readListeners = new Set<() => void>();
function getReadRaw() {
    try {
        return localStorage.getItem(READ_KEY) ?? '[]';
    } catch {
        return '[]';
    }
}
function subscribeRead(cb: () => void) {
    readListeners.add(cb);
    window.addEventListener('storage', cb);
    return () => {
        readListeners.delete(cb);
        window.removeEventListener('storage', cb);
    };
}
function markRead(ids: string[]) {
    const current = new Set<string>(JSON.parse(getReadRaw()) as string[]);
    ids.forEach((id) => current.add(id));
    try {
        localStorage.setItem(READ_KEY, JSON.stringify([...current].slice(-500)));
    } catch {
        /* storage unavailable: read state lasts only until reload */
    }
    readListeners.forEach((cb) => cb());
}

function whenLabel(iso: string) {
    const m = moment(iso);
    if (!m.isValid()) return '';
    if (m.isSame(moment(), 'day')) return m.format('HH:mm');
    if (m.isSame(moment().subtract(1, 'day'), 'day')) return 'Yesterday';
    return m.format('D MMM');
}

function maskPhone(phone?: string) {
    if (!phone) return '';
    const digits = phone.replace(/\s+/g, '');
    return digits.length > 7 ? `${digits.slice(0, 4)} ••• ${digits.slice(-4)}` : digits;
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
            className={`relative h-6 w-[42px] shrink-0 rounded-full transition-colors disabled:opacity-50 ${on ? 'bg-brand-305' : 'bg-grey-150'}`}
        >
            <span className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-[18px]' : ''}`} />
        </button>
    );
}

export default function NotificationsPage() {
    const { user } = useAuthStore();
    const [tab, setTab] = useState<Tab>('all');
    const [size, setSize] = useState(20);
    const [pushOn, setPushOn] = useState(false);
    const [offersOn, setOffersOn] = useState(false);

    const { data, isLoading, isError } = useNotifications(0, size, null, TAB_CATEGORY[tab]);
    const payload = useMemo(() => unwrapNotifications(data), [data]);
    const items = useMemo(() => payload?.items ?? [], [payload]);

    const readRaw = useSyncExternalStore(subscribeRead, getReadRaw, () => '[]');
    const readIds = useMemo(() => new Set<string>(JSON.parse(readRaw) as string[]), [readRaw]);
    const unreadCount = items.filter((n) => !readIds.has(n.id)).length;
    const shown = tab === 'unread' ? items.filter((n) => !readIds.has(n.id)) : items;

    const settings = useNotificationSettings();
    const updateSettings = useUpdateNotificationSettings();
    const channel = (settings.data as { purchaseChannel?: NotificationChannel } | undefined)?.purchaseChannel;
    const setChannel = (next: NotificationChannel) =>
        updateSettings.mutate(
            { purchaseChannel: next },
            {
                onSuccess: () => toast.success(next === 'OFF' ? 'Receipt messages turned off.' : `Receipts will go by ${next === 'EMAIL' ? 'email' : 'SMS'}.`),
                onError: () => toast.error("We couldn't save that. Please try again."),
            }
        );

    const tabs: { id: Tab; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: `Unread (${unreadCount})` },
        { id: 'pay', label: 'Payments' },
        { id: 'account', label: 'Account' },
        { id: 'offers', label: 'Offers' },
    ];

    const prefs = [
        { label: 'Email', note: user?.email || 'No email on your account', on: channel === 'EMAIL', toggle: () => setChannel(channel === 'EMAIL' ? 'OFF' : 'EMAIL'), saving: true },
        { label: 'SMS', note: maskPhone(user?.phone) || 'No phone on your account', on: channel === 'SMS', toggle: () => setChannel(channel === 'SMS' ? 'OFF' : 'SMS'), saving: true },
        { label: 'Push notifications', note: 'On this device', on: pushOn, toggle: () => setPushOn((v) => !v), saving: false },
        { label: 'Offers and news', note: 'Promotions and new services', on: offersOn, toggle: () => setOffersOn((v) => !v), saving: false },
    ];

    return (
        <div className="min-h-full bg-tone-44 text-tone-744">
            <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
                <div className="hz-rise flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em]">Notifications</h1>
                        <span className="text-[15px] text-tone-414">Payment updates, account alerts and offers.</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => markRead(items.map((n) => n.id))}
                        disabled={!unreadCount}
                        className="hz-press inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium hover:border-tone-414 disabled:opacity-50"
                    >
                        <CheckCheck className="h-4 w-4" aria-hidden="true" />
                        Mark all as read
                    </button>
                </div>

                <div className="flex flex-wrap items-start gap-4">
                    <section className="hz-rise flex min-w-0 flex-[999_1_560px] flex-col gap-3.5" style={{ '--d': 1 } as React.CSSProperties}>
                        <div role="radiogroup" aria-label="Show" className="flex flex-wrap gap-2">
                            {tabs.map((t) => {
                                const on = tab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        role="radio"
                                        aria-checked={on}
                                        onClick={() => setTab(t.id)}
                                        className={`min-h-[38px] rounded-lg border px-3.5 text-sm font-medium transition-colors ${on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface text-tone-744 hover:border-tone-414'}`}
                                    >
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>

                        {isError && (
                            <p role="alert" className="rounded-[10px] border border-status-error/30 bg-status-error/8 px-4 py-3 text-sm text-status-error">
                                We couldn&apos;t load your notifications. Please try again shortly.
                            </p>
                        )}

                        <div className="overflow-hidden rounded-[14px] border border-tone-100 bg-surface" aria-live="polite">
                            {isLoading ? (
                                <div className="p-4"><ListSkeleton rows={5} avatar={false} label="Loading notifications" /></div>
                            ) : shown.length ? (
                                shown.map((n) => {
                                    const read = readIds.has(n.id);
                                    const Icon = CATEGORY_ICON[n.category] ?? Bell;
                                    return (
                                        <button
                                            key={n.id}
                                            type="button"
                                            onClick={() => markRead([n.id])}
                                            className={`flex w-full items-start gap-3.5 border-b border-tone-44 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-tone-44 ${read ? 'bg-surface' : 'bg-tone-44'}`}
                                        >
                                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${read ? 'bg-tone-44 text-tone-744' : 'bg-brand-305 text-on-brand'}`}>
                                                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                                            </span>
                                            <span className="flex min-w-0 flex-1 flex-col gap-1">
                                                <span className="flex justify-between gap-3">
                                                    <span className={`text-[15px] ${read ? 'font-medium' : 'font-semibold'}`}>
                                                        {n.title}
                                                        {n.productName && <span className="font-normal text-tone-414"> · {n.productName}</span>}
                                                    </span>
                                                    <time dateTime={n.createdAt} className="shrink-0 text-[13px] text-tone-414">{whenLabel(n.createdAt)}</time>
                                                </span>
                                                <span className="text-sm leading-normal text-tone-414">{n.message}</span>
                                            </span>
                                            <span
                                                aria-label={read ? undefined : 'Unread'}
                                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${read ? 'bg-transparent' : 'bg-brand-305'}`}
                                            />
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-5 py-12 text-center text-[15px] text-tone-414">You&apos;re all caught up.</div>
                            )}
                        </div>

                        {payload?.hasMore && tab !== 'unread' && (
                            <button
                                type="button"
                                onClick={() => setSize((s) => s + 20)}
                                className="hz-press mx-auto inline-flex min-h-11 items-center rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium hover:border-tone-414"
                            >
                                Load more
                            </button>
                        )}
                    </section>

                    <aside className="hz-rise flex min-w-0 flex-[1_1_300px] flex-col gap-1.5 rounded-[14px] border border-tone-100 bg-surface p-[22px]" style={{ '--d': 2 } as React.CSSProperties}>
                        <h2 className="text-lg font-semibold">How we reach you</h2>
                        <p className="mb-2 text-sm leading-normal text-tone-414">Payment receipts go to one channel at a time. Security alerts are always sent.</p>
                        {prefs.map((p) => (
                            <div key={p.label} className="flex items-center gap-3 border-t border-tone-44 py-3">
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <span className="text-[15px] font-medium">{p.label}</span>
                                    <span className="truncate text-[13px] text-tone-414">{p.note}</span>
                                </span>
                                <Switch on={p.on} label={p.label} onToggle={p.toggle} disabled={p.saving && (updateSettings.isPending || settings.isLoading)} />
                            </div>
                        ))}
                    </aside>
                </div>
            </div>
        </div>
    );
}
