'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */
type Category = 'Payment Updates' | 'Reminders' | 'Offers' | 'Security Alerts';
type CategoryFilter = 'All' | Category;
type Tone = 'pending' | 'success';
type StatusFilter = 'All Statuses' | 'Pending' | 'Success';

type Notification = {
    id: string;
    category: Category;
    tone: Tone;
    title: string; // bold part
    subtitle?: string; // lighter part after the dash
    message: string;
    date: string;
    action: string;
};

/* ─── Constants ────────────────────────────────────────────────── */
const CATEGORIES: CategoryFilter[] = ['All', 'Payment Updates', 'Reminders', 'Offers', 'Security Alerts'];
const STATUS_OPTIONS: StatusFilter[] = ['All Statuses', 'Pending', 'Success'];
const PAGE_SIZES = [10, 20, 50];

const TONE_DOT: Record<Tone, string> = {
    pending: 'bg-[#F5B53F]',
    success: 'bg-[#4CAF50]',
};

/* ─── Dummy data ───────────────────────────────────────────────── */
type Template = Omit<Notification, 'id' | 'date'> & { date?: string };

// The first six match the screenshot exactly (with their fixed dates)
const TEMPLATES: Template[] = [
    {
        category: 'Payment Updates',
        tone: 'pending',
        title: 'Pending',
        subtitle: 'Payment processing',
        message: 'Your DSTV subscription is being processed. We’ll notify you once it’s complete.',
        date: '20 Nov 2026',
        action: 'View Payment',
    },
    {
        category: 'Payment Updates',
        tone: 'success',
        title: 'Success',
        subtitle: 'Payment successful',
        message: 'Your ₦2,000 MTN 5GB data purchase was successful. Ref: TXN-20261021-00481',
        date: '18 Nov 2026',
        action: 'View Payment',
    },
    {
        category: 'Offers',
        tone: 'success',
        title: 'Points Earned',
        message: 'You earned points+20 points added for your recent purchase. Your balance is now 470 pts.',
        date: '17 Nov 2026',
        action: 'View Reward',
    },
    {
        category: 'Offers',
        tone: 'success',
        title: 'Points Redeemed',
        subtitle: 'Reward redeemed',
        message: 'You redeemed 200 points for ₦500 airtime. Enjoy!',
        date: '17 Nov 2026',
        action: 'View Reward',
    },
    {
        category: 'Reminders',
        tone: 'pending',
        title: 'Tier Progress',
        subtitle: 'You’re almost there',
        message: 'Earn 80 more points to reach Gold tier and unlock better rewards.',
        date: '16 Nov 2026',
        action: 'View Reward',
    },
    {
        category: 'Offers',
        tone: 'success',
        title: 'Referral',
        subtitle: 'Invite a friend, earn more',
        message: 'Share your code and both of you earn 100 points when they make their first purchase.',
        date: '12 Nov 2026',
        action: 'View Calendar',
    },
    // Extra variety so every filter has results
    {
        category: 'Security Alerts',
        tone: 'success',
        title: 'Security',
        subtitle: 'New device sign-in',
        message: 'Your account was accessed from a new device. If this wasn’t you, change your PIN right away.',
        action: 'View Activity',
    },
    {
        category: 'Reminders',
        tone: 'pending',
        title: 'Reminder',
        subtitle: 'Bill due soon',
        message: 'Your IKEDC electricity bill is due in 3 days. Pay early to avoid a late fee.',
        action: 'View Payment',
    },
    {
        category: 'Offers',
        tone: 'success',
        title: 'Offer',
        subtitle: 'Weekend data bonus',
        message: 'Buy any data bundle this weekend and earn double points on every purchase.',
        action: 'View Offer',
    },
    {
        category: 'Payment Updates',
        tone: 'success',
        title: 'Success',
        subtitle: 'Payment successful',
        message: 'Your ₦5,000 AIRTEL airtime top-up was successful. Ref: TXN-20261002-00317',
        action: 'View Payment',
    },
];

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const NOTIFICATIONS: Notification[] = Array.from({ length: 100 }, (_, i) => {
    const template = TEMPLATES[i % TEMPLATES.length];
    // Items without a fixed date step back one day at a time from 11 Nov 2026
    const date = template.date ?? DATE_FORMAT.format(new Date(2026, 10, 11 - i));
    return { ...template, id: `n-${i + 1}`, date };
});

/* ═══════════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<StatusFilter>('All Statuses');
    const [category, setCategory] = useState<CategoryFilter>('All');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return NOTIFICATIONS.filter((n) => {
            if (category !== 'All' && n.category !== category) return false;
            if (status === 'Pending' && n.tone !== 'pending') return false;
            if (status === 'Success' && n.tone !== 'success') return false;
            if (!q) return true;
            return [n.title, n.subtitle ?? '', n.message].some((value) => value.toLowerCase().includes(q));
        });
    }, [query, status, category]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const visible = filtered.slice(startIndex, startIndex + pageSize);
    const showingFrom = filtered.length === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(startIndex + pageSize, filtered.length);

    return (
        <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
            {/* ── Page header ── */}
            <section className="border-b border-[#F2EAE5] px-5 py-5 sm:px-8 sm:py-6">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#E95312]">Notifications</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#18202A]">
                    Nothing important <span className="text-[#E95312]">slips by.</span>
                </h1>
                <p className="mt-3 text-sm text-[#7E7581]">Payment updates, helpful reminders, offers, and security alerts.</p>
            </section>

            <main className="mx-auto px-5 py-6 sm:px-8 lg:py-7">
                {/* ── Filters ── */}
                <section className="flex flex-wrap items-center gap-3">
                    <label className="relative flex min-w-[220px] flex-1 items-center sm:max-w-[354px]">
                        <span className="sr-only">Search notifications</span>
                        <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#52617A]" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search by updates,reminders,offers..."
                            className="h-12 w-full rounded-lg border border-[#E6E3E0] bg-white pl-11 pr-4 text-sm text-[#343238] outline-none placeholder:text-[#A29B9C] focus:border-[#E95312]"
                        />
                    </label>

                    <div className="border-l border-[#E6E3E0] pl-3">
                        <label className="relative flex items-center">
                            <span className="sr-only">Filter by status</span>
                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value as StatusFilter);
                                    setPage(1);
                                }}
                                className="h-11 w-[144px] appearance-none rounded-lg border border-[#E6E3E0] bg-white pl-3.5 pr-9 text-xs text-[#343238] outline-none focus:border-[#E95312]"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option}>{option}</option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#343238]" />
                        </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 border-l border-[#E6E3E0] pl-3" role="group" aria-label="Notification category">
                        {CATEGORIES.map((name) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => {
                                    setCategory(name);
                                    setPage(1);
                                }}
                                aria-pressed={category === name}
                                className={`rounded-full border px-5 py-2.5 text-sm transition ${category === name
                                    ? 'border-[#243B4A] bg-[#243B4A] font-medium text-white'
                                    : 'border-[#DED8D4] bg-white text-[#343238] hover:bg-slate-50'
                                    }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Notification list ── */}
                <section className="mt-6 space-y-4" aria-live="polite">
                    {visible.map((item) => (
                        <article
                            key={item.id}
                            className="flex flex-col gap-4 rounded-xl border border-[#F4EFEB] bg-white px-6 py-5 sm:flex-row sm:items-start sm:justify-between"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3">
                                    <span className={`h-3 w-3 shrink-0 rounded-full ${TONE_DOT[item.tone]}`} aria-hidden="true" />
                                    <h2 className="text-[15px] text-[#20232A]">
                                        <span className="font-semibold">{item.title}</span>
                                        {item.subtitle && <span className="font-normal"> - {item.subtitle}</span>}
                                    </h2>
                                </div>
                                <p className="mt-4 text-[15px] text-[#52617A]">{item.message}</p>
                            </div>

                            <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                                <time className="text-sm font-semibold text-[#20232A]">{item.date}</time>
                                <button
                                    type="button"
                                    className="rounded-lg border border-[#E6E3E0] bg-white px-4 py-2 text-sm text-[#52617A] transition hover:bg-slate-50"
                                >
                                    {item.action}
                                </button>
                            </div>
                        </article>
                    ))}

                    {visible.length === 0 && (
                        <div className="rounded-xl border border-[#F4EFEB] bg-white px-6 py-16 text-center text-sm text-slate-500">
                            No notifications match your filters.
                        </div>
                    )}
                </section>

                {/* ── Pagination ── */}
                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 px-2 pb-6 text-sm text-[#52617A]">
                    <span>
                        Showing {showingFrom}-{showingTo} of {filtered.length} entries
                    </span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2">
                            Show
                            <label className="relative flex items-center">
                                <span className="sr-only">Entries per page</span>
                                <select
                                    value={pageSize}
                                    onChange={(event) => {
                                        setPageSize(Number(event.target.value));
                                        setPage(1);
                                    }}
                                    className="appearance-none rounded-md border border-[#E6E3E0] bg-white py-1.5 pl-3 pr-7 text-xs text-[#343238] outline-none"
                                >
                                    {PAGE_SIZES.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-slate-500" />
                            </label>
                            entries
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                aria-label="Previous page"
                                className="flex h-7 w-8 items-center justify-center rounded-md border border-[#E6E3E0] bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="min-w-4 text-center text-xs font-semibold text-[#20232A]">{currentPage}</span>
                            <button
                                type="button"
                                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                aria-label="Next page"
                                className="flex h-7 w-8 items-center justify-center rounded-md border border-[#E6E3E0] bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}