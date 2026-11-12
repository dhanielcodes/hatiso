'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Search, Smartphone } from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */
type HistoryTab = 'Earned' | 'Redeemed';

type HistoryRow = {
    reference: string;
    provider: string;
    contact: string;
    date: string;
    amount: string;
    points: string;
    status: 'Success' | 'Pending' | 'Failed';
};

/* ─── Constants ────────────────────────────────────────────────── */
const CARD = 'rounded-3xl border border-[#E3E8EB] bg-white';

/* ─── Dummy data ───────────────────────────────────────────────── */
const MEMBER = {
    tier: 'Silver member',
    points: 3480,
    pointsToNextTier: 520,
    nextTier: 'Gold',
    progressPercent: 74,
    referralCode: 'MAYDAY5368',
};

const TIERS = [
    { name: 'Bronze', note: 'Welcome peaks', state: 'done' },
    { name: 'Silver', note: '+3000 Points', state: 'current' },
    { name: 'Gold', note: '+5000 Points', state: 'locked' },
    { name: 'Platinum', note: '+6000 Points', state: 'locked' },
] as const;

const REDEEM_OFFERS = [
    { id: 1, title: 'Get ₦500 airtime', points: 1000 },
    { id: 2, title: 'Get ₦500 airtime', points: 1000 },
    { id: 3, title: 'Get ₦500 airtime', points: 1000 },
    { id: 4, title: 'Get ₦500 airtime', points: 1000 },
];

const PROVIDER_BADGES: Record<string, { label: string; bg: string; fg: string }> = {
    'MTN Nigeria': { label: 'MTN', bg: '#FFCC08', fg: '#1F1F1F' },
    DSTV: { label: 'DStv', bg: '#1F5AA6', fg: '#FFFFFF' },
    AIRTEL: { label: 'airtel', bg: '#E4202D', fg: '#FFFFFF' },
    SPORTYBET: { label: 'S', bg: '#E4202D', fg: '#FFFFFF' },
};

const EARNED_PATTERN: { provider: string; contact: string; points: string }[] = [
    { provider: 'MTN Nigeria', contact: '08053636321', points: '+20 pts' },
    { provider: 'DSTV', contact: '2323453636321', points: '+1000 pts' },
    { provider: 'AIRTEL', contact: '08053636321', points: '+20 pts' },
    { provider: 'SPORTYBET', contact: '2323453636321', points: '+20 pts' },
    { provider: 'DSTV', contact: '08053636321', points: '+20 pts' },
    { provider: 'AIRTEL', contact: '08053636321', points: '+200 pts' },
    { provider: 'MTN Nigeria', contact: '08053636321', points: '+100 pts' },
    { provider: 'AIRTEL', contact: '08053636321', points: '+20 pts' },
    { provider: 'MTN Nigeria', contact: '2323453636321', points: '+20 pts' },
    { provider: 'DSTV', contact: '2323453636321', points: '+20 pts' },
];

const EARNED_ROWS: HistoryRow[] = Array.from({ length: 100 }, (_, i) => {
    const p = EARNED_PATTERN[i % EARNED_PATTERN.length];
    return {
        reference: `R-${String(i + 1).padStart(3, '0')}`,
        provider: p.provider,
        contact: p.contact,
        date: '2 Sep 2026, 08:14 am',
        amount: '₦8,250',
        points: p.points,
        status: 'Success',
    };
});

const REDEEMED_ROWS: HistoryRow[] = [
    { reference: 'X-001', provider: 'MTN Nigeria', contact: '08053636321', date: '20 Aug 2026, 10:02 am', amount: '₦500', points: '-1000 pts', status: 'Success' },
    { reference: 'X-002', provider: 'AIRTEL', contact: '08053636321', date: '4 Jul 2026, 03:45 pm', amount: '₦500', points: '-1000 pts', status: 'Success' },
    { reference: 'X-003', provider: 'MTN Nigeria', contact: '08053636321', date: '12 Jun 2026, 09:20 am', amount: '₦500', points: '-1000 pts', status: 'Pending' },
];

const PAGE_SIZES = [10, 20, 50];

const COLUMNS = [
    { label: 'Reference', sortable: true },
    { label: 'Service/Provider', sortable: true },
    { label: 'Phone number/ User ID', sortable: true },
    { label: 'Date & Time', sortable: true },
    { label: 'Amount', sortable: true },
    { label: 'Points earned', sortable: true },
    { label: 'Status', sortable: true },
];

const STATUS_STYLES: Record<HistoryRow['status'], { pill: string; dot: string }> = {
    Success: { pill: 'bg-[#E7F5EE] text-[#2E9A4F]', dot: 'bg-[#2E9A4F]' },
    Pending: { pill: 'bg-[#FFF4DB] text-[#B7791F]', dot: 'bg-[#B7791F]' },
    Failed: { pill: 'bg-[#FDE8EA] text-[#E22E41]', dot: 'bg-[#E22E41]' },
};

/* ─── Small presentational pieces ──────────────────────────────── */
function ProviderLogo({ provider }: { provider: string }) {
    const badge = PROVIDER_BADGES[provider] ?? { label: provider.slice(0, 2).toUpperCase(), bg: '#E5E7EB', fg: '#374151' };
    return (
        <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
            style={{ backgroundColor: badge.bg, color: badge.fg }}
            aria-hidden="true"
        >
            {badge.label}
        </span>
    );
}

function CoinWalletIllustration() {
    return (
        <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Wallet with reward coins">
            {/* sparkles */}
            <path d="M285 30 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#3E8E4F" />
            <path d="M40 100 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#C0647F" />
            <circle cx="268" cy="20" r="3" fill="#8B5CF6" />
            <circle cx="298" cy="62" r="2.5" fill="#F5B53F" />
            <circle cx="30" cy="145" r="4" fill="#F5B53F" />
            <circle cx="62" cy="128" r="2.5" fill="#8B5CF6" />
            {/* wallet back */}
            <g transform="rotate(-18 170 110)">
                <rect x="70" y="70" width="190" height="70" rx="14" fill="#B8651F" />
                <rect x="70" y="86" width="190" height="62" rx="14" fill="#3E8E4F" />
                <path d="M96 128 q60 -34 150 -22" stroke="#E0833A" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            </g>
            {/* coins */}
            <g>
                <circle cx="130" cy="78" r="30" fill="#D4A22A" />
                <circle cx="130" cy="78" r="22" fill="#E8B93A" />
                <text x="130" y="88" textAnchor="middle" fontSize="28" fontWeight="700" fill="#B8861A">P</text>
            </g>
            <g>
                <circle cx="212" cy="42" r="30" fill="#D4A22A" />
                <circle cx="212" cy="42" r="22" fill="#E8B93A" />
                <text x="212" y="52" textAnchor="middle" fontSize="28" fontWeight="700" fill="#B8861A">P</text>
            </g>
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function RewardPage() {
    const [copied, setCopied] = useState(false);
    const [tab, setTab] = useState<HistoryTab>('Earned');
    const [query, setQuery] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);

    /* ── Referral actions ── */
    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(MEMBER.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            /* clipboard unavailable – ignore */
        }
    };

    const shareInvite = async () => {
        const text = `Join me on Hatiso and use my code ${MEMBER.referralCode} to get started.`;
        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({ title: 'Join Hatiso', text });
            } else {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            }
        } catch {
            /* share cancelled – ignore */
        }
    };

    /* ── History: filter + paginate ── */
    const filteredRows = useMemo(() => {
        const rows = tab === 'Earned' ? EARNED_ROWS : REDEEMED_ROWS;
        const q = query.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) =>
            [r.reference, r.provider, r.contact].some((value) => value.toLowerCase().includes(q))
        );
    }, [tab, query]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const visibleRows = filteredRows.slice(startIndex, startIndex + pageSize);
    const showingFrom = filteredRows.length === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(startIndex + pageSize, filteredRows.length);

    return (
        <div className="min-h-full bg-[#F3F4F5] text-[#10202A]">
            {/* ── Page header ── */}

            <section className="border-b border-[#E3E8EB] px-5 py-7 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C2531C]">Rewards</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#10202A] sm:text-3xl">Good habits deserve <span className="text-[#C2531C]">good rewards.</span></h2>
                <p className="mt-2 text-sm text-[#4A5B64] sm:text-base">Earn points whenever you pay, refer friends, and complete simple challenges.</p>
            </section>

            <main className="mx-auto space-y-6 px-5 py-6 sm:px-8 lg:py-7">
                {/* ── Points hero ── */}
                <section className="relative overflow-hidden rounded-[28px] bg-[#10202A] px-6 py-8 text-white sm:px-8">
                    <div className="relative z-10 max-w-md">
                        <span className="inline-block rounded-full bg-[#FBE9B7] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8A5A00]">
                            {MEMBER.tier}
                        </span>
                        <p className="mt-6 text-xs text-white/60">Available points</p>
                        <p className="mt-1 text-5xl font-semibold tracking-[-0.03em]">{MEMBER.points.toLocaleString('en-NG').replace(/,/g, '')}</p>
                        <p className="mt-4 text-xs text-white/90">
                            {MEMBER.pointsToNextTier} points until you reach {MEMBER.nextTier}
                        </p>
                        <div
                            className="mt-3 h-1.5 w-full max-w-[470px] rounded-full bg-white/20"
                            role="progressbar"
                            aria-valuenow={MEMBER.progressPercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Progress to ${MEMBER.nextTier}`}
                        >
                            <div className="h-full rounded-full bg-[#EE6E2D]" style={{ width: `${MEMBER.progressPercent}%` }} />
                        </div>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 right-4 top-0 hidden w-[340px] items-center sm:flex lg:right-12">
                        <CoinWalletIllustration />
                    </div>
                </section>

                {/* ── Tier + referral ── */}
                <section className="grid gap-5 lg:grid-cols-2">
                    <article className={`${CARD} p-5 sm:p-6`}>
                        <h2 className="text-base font-semibold text-[#10202A]">Tier</h2>
                        <p className="mt-1.5 text-sm text-[#5D6F78]">See for every stage of growth</p>

                        <ol className="relative mt-12 grid grid-cols-4 gap-2 pb-2">
                            <div className="absolute left-[12.5%] right-[12.5%] top-[14px] border-t border-dashed border-[#D9D3CE]" aria-hidden="true" />
                            {TIERS.map((tier) => (
                                <li key={tier.name} className="relative flex flex-col items-center text-center">
                                    <span
                                        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${tier.state === 'done'
                                            ? 'bg-[#2E7D4F]'
                                            : tier.state === 'current'
                                                ? 'bg-[#F48245]'
                                                : 'bg-[#F7E1D5]'
                                            }`}
                                    >
                                        <Check className={`h-4 w-4 ${tier.state === 'locked' ? 'text-white/80' : 'text-white'}`} strokeWidth={3} />
                                    </span>
                                    <span className="mt-5 text-lg font-medium text-[#10202A]">{tier.name}</span>
                                    <span className="mt-1 text-sm text-[#5D6F78]">{tier.note}</span>
                                </li>
                            ))}
                        </ol>
                    </article>

                    <article className={`${CARD} p-5 sm:p-6`}>
                        <h2 className="text-base font-semibold text-[#10202A]">Refer a friend</h2>
                        <p className="mt-1.5 text-sm text-[#5D6F78]">Get 1,000 points when their first bill is paid.</p>

                        <div className="mt-8 flex items-center justify-between rounded-2xl border border-dashed border-[#EE6E2D] bg-[#FFF7F2] px-4 py-4">
                            <span className="text-sm font-medium tracking-wide text-[#10202A]">{MEMBER.referralCode}</span>
                            <button
                                type="button"
                                onClick={copyCode}
                                aria-label="Copy referral code"
                                className="text-[#C2531C] transition hover:opacity-70"
                            >
                                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={shareInvite}
                            className="mt-4 w-full rounded-lg bg-[#EE6E2D] py-3.5 text-sm font-semibold text-white transition hover:bg-[#F48245]"
                        >
                            Share invite
                        </button>
                    </article>
                </section>

                {/* ── Redeem your points ── */}
                <section>
                    <h2 className="text-base font-semibold text-[#10202A]">Redeem your points</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {REDEEM_OFFERS.map((offer) => {
                            const canRedeem = MEMBER.points >= offer.points;
                            return (
                                <article key={offer.id} className={`${CARD} flex items-center gap-4 p-3`}>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#FBE3D5]">
                                        <Smartphone className="h-5 w-5 text-[#EE6E2D]" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[#10202A]">{offer.title}</p>
                                        <p className="mt-1 text-xs text-[#5D6F78]">{offer.points} Points</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!canRedeem}
                                        className="flex items-center gap-1.5 pr-2 text-xs font-medium text-[#C2531C] transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Redeem <ChevronRight className="h-4 w-4 text-[#5D6F78]" />
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* ── Reward history ── */}
                <section className={`${CARD} p-5 sm:p-6`}>
                    <h2 className="text-lg font-semibold text-[#10202A]">Reward History</h2>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <label className="relative flex min-w-[220px] flex-1 items-center">
                            <span className="sr-only">Search services or provider</span>
                            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#4A5B64]" />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Search services or provider"
                                className="h-11 w-full rounded-3xl border border-[#E3E8EB] bg-white pl-11 pr-4 text-sm text-[#10202A] outline-none placeholder:text-[#5D6F78] focus:border-[#EE6E2D]"
                            />
                        </label>

                        <div className="flex items-center gap-2 border-l border-[#E3E8EB] pl-3">
                            {(['Earned', 'Redeemed'] as HistoryTab[]).map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                        setTab(name);
                                        setPage(1);
                                    }}
                                    aria-pressed={tab === name}
                                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${tab === name
                                        ? 'border-[#10202A] bg-[#10202A] text-white'
                                        : 'border-[#DDE3E6] bg-white text-[#10202A] hover:bg-slate-50'
                                        }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 overflow-x-auto rounded-2xl border border-[#F3F4F5]">
                        <table className="w-full min-w-[900px] text-left">
                            <thead>
                                <tr className="bg-[#FAF7F4] text-[11px] font-medium uppercase text-[#4A5B64]">
                                    {COLUMNS.map((col) => (
                                        <th key={col.label} scope="col" className="whitespace-nowrap px-4 py-4 font-medium">
                                            <span className="inline-flex items-center gap-1.5">
                                                {col.label}
                                                {col.sortable && <ArrowDown className="h-3 w-3" />}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F3F4F5]">
                                {visibleRows.map((row) => {
                                    const status = STATUS_STYLES[row.status];
                                    return (
                                        <tr key={row.reference} className="text-sm text-[#4A5B64]">
                                            <td className="px-4 py-[18px]">{row.reference}</td>
                                            <td className="px-4 py-[18px]">
                                                <span className="flex items-center gap-3">
                                                    <ProviderLogo provider={row.provider} />
                                                    <span className="whitespace-nowrap">{row.provider}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-[18px] font-medium text-[#10202A]">{row.contact}</td>
                                            <td className="whitespace-nowrap px-4 py-[18px]">{row.date}</td>
                                            <td className="px-4 py-[18px] font-semibold text-[#10202A]">{row.amount}</td>
                                            <td className="whitespace-nowrap px-4 py-[18px]">{row.points}</td>
                                            <td className="px-4 py-[18px]">
                                                <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-medium ${status.pill}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {visibleRows.length === 0 && (
                                    <tr>
                                        <td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-sm text-slate-500">
                                            No {tab.toLowerCase()} rewards found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F3F4F5] px-5 py-6 text-sm text-[#4A5B64]">
                            <span>
                                Showing {showingFrom}-{showingTo} of {filteredRows.length} entries
                            </span>
                            <div className="flex items-center gap-3">
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
                                            className="appearance-none rounded-md border border-[#E3E8EB] bg-white py-1.5 pl-3 pr-7 text-xs text-[#10202A] outline-none"
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
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E3E8EB] bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="min-w-4 text-center text-xs font-semibold text-[#10202A]">{currentPage}</span>
                                    <button
                                        type="button"
                                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        aria-label="Next page"
                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E3E8EB] bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}