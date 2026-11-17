'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { SubmitButton, TextAreaField, useFormField } from '@/components/forms';
import {
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    FileText,
    Headphones,
    Mail,
    Minus,
    Phone,
    Plus,
    Star,
    X,
} from 'lucide-react';
import SupportEnquiryForm from '@/components/support/SupportEnquiryForm';
import { formatDateTime, formatPlainDate, ticketHref, ticketStatus, ticketTypeLabel } from '@/components/support/supportDisplay';
import { newIdempotencyKey, type SupportContentEntry, type SupportReceipt } from '@/lib/api/support';
import { useSubmitSupportFeedback, useSupportHistory, useSupportOptions } from '@/lib/queries/useSupport';

/* ─── Types ────────────────────────────────────────────────────── */
type SupportTab = 'help' | 'faqs' | 'feedback';

type ContactItem = {
    id: string;
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
};

/* ─── Constants ────────────────────────────────────────────────── */
const TABS: { id: SupportTab; label: string }[] = [
    { id: 'help', label: 'Help Center' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'feedback', label: 'Feedback' },
];

/* ─── Forms ────────────────────────────────────────────────────── */
type FeedbackValues = { rating: number; remark: string };
const EMPTY_FEEDBACK: FeedbackValues = { rating: 0, remark: '' };
const feedbackSchema = Yup.object({
    rating: Yup.number().min(1, 'Choose a rating.').max(5),
    remark: Yup.string().trim().max(10_000, 'Keep it under 10,000 characters.'),
});
const PAGE_SIZES = [10, 20, 50];

// Fallback contacts, used until support publishes CONTACT entries in GET /support/options
const CONTACTS: ContactItem[] = [
    { id: 'phone', label: '0-2562718', href: 'tel:02562718', icon: Phone },
    { id: 'email', label: 'Qapp@gmail.com', href: 'mailto:Qapp@gmail.com', icon: Mail },
    { id: 'facebook', label: 'Qapp by Hatiso', href: 'https://facebook.com', icon: FacebookLogo },
    { id: 'instagram', label: 'Qapp by Hatiso', href: 'https://instagram.com', icon: InstagramLogo },
    { id: 'x', label: 'Qapp by Hatiso', href: 'https://x.com', icon: XLogo },
];

const FAQ_GROUPS = [
    {
        id: 'getting-started',
        label: 'Getting Started',
        items: [
            {
                q: 'What is QApp by Hatiso?',
                a: 'QApp by Hatiso is a single place to pay bills, manage transactions and earn rewards, all from your personal account.',
            },
            {
                q: 'How do I create an account?',
                a: 'Tap Sign Up, enter your name, phone number and email, verify the OTP we send you and set a password. It only takes a few minutes.',
            },
            {
                q: 'Does BowenMFB give out loans?',
                a: 'Loan availability depends on your account profile and eligibility. Check the Loans section in your dashboard or contact support for current offers.',
            },
            {
                q: 'Can I buy a service without creating an account?',
                a: 'You need an account to complete a purchase so we can protect your payment and keep a record of your transaction.',
            },
        ],
    },
    {
        id: 'payments',
        label: 'Payments and Pricing',
        items: [
            { q: 'Which payment methods are supported?', a: 'You can pay with your wallet balance, a linked debit card or bank transfer.' },
            { q: 'Are there any transaction fees?', a: 'Any applicable fee is shown on the confirmation screen before you pay, so there are no surprises.' },
            { q: 'What happens if a payment fails?', a: 'If you were debited for a failed payment, the amount is automatically reversed, usually within 24 hours.' },
        ],
    },
    {
        id: 'orders',
        label: 'Orders and Delivery',
        items: [
            { q: 'How do I track my order?', a: 'Open Orders from your dashboard and select the order to see its current status.' },
            { q: 'How long does delivery take?', a: 'Digital services are delivered instantly. Other timelines are shown on the order summary.' },
            { q: 'Can I cancel an order?', a: 'You can cancel an order while it is still pending. Once it is processing, please contact support.' },
        ],
    },
    {
        id: 'security',
        label: 'Account and Security',
        items: [
            { q: 'How do I reset my password?', a: 'Go to Account, then Privacy & Security, verify your phone number with the OTP and choose a new password.' },
            { q: 'How is my data protected?', a: 'We use encryption and OTP verification for sensitive actions to keep your account safe.' },
            { q: 'What should I do if I notice suspicious activity?', a: 'Change your password immediately and contact our support team so we can secure your account.' },
        ],
    },
    {
        id: 'support',
        label: 'Support and Refunds',
        items: [
            { q: 'How do I contact support?', a: 'Use the Help Center to send an enquiry or tap Contact Us for phone, email and social channels.' },
            { q: 'How do refunds work?', a: 'Approved refunds are returned to your original payment method, usually within 3 to 5 working days.' },
            { q: 'How long does a support enquiry take?', a: 'Most enquiries are resolved within 24 hours. You can follow progress in Recent Support History.' },
        ],
    },
];

/* ─── Helpers ──────────────────────────────────────────────────── */
// Brand icons were removed from lucide-react, so these are inline SVGs in the same outline style
const outlineIconProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
};

function FacebookLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...outlineIconProps} {...props}>
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

function InstagramLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...outlineIconProps} {...props}>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

function XLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function bySection(content: SupportContentEntry[], section: string) {
    return content.filter((entry) => entry.section?.toUpperCase() === section);
}

/** Turns a published CONTACT entry into a link: an email, phone number or URL. */
function contactFromEntry(entry: SupportContentEntry, index: number): ContactItem {
    const value = (entry.url || entry.body || '').trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhone = /^\+?[\d\s()-]{6,}$/.test(value);
    const href = entry.url || (isEmail ? `mailto:${value}` : isPhone ? `tel:${value.replace(/[^\d+]/g, '')}` : '#');
    const lower = `${entry.title} ${value}`.toLowerCase();
    const icon = isEmail || lower.includes('mail')
        ? Mail
        : isPhone || lower.includes('phone') || lower.includes('call')
            ? Phone
            : lower.includes('facebook')
                ? FacebookLogo
                : lower.includes('instagram')
                    ? InstagramLogo
                    : lower.includes('twitter') || lower.includes('x.com')
                        ? XLogo
                        : ExternalLink;
    return { id: `contact-${index}`, label: entry.body && entry.url ? `${entry.title} · ${entry.body}` : entry.title || value, href, icon };
}

/* ─── Contact Us modal ─────────────────────────────────────────── */
function ContactModal({ open, onClose, contacts }: { open: boolean; onClose: () => void; contacts: ContactItem[] }) {
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const previousOverflow = document.body.style.overflow;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previousOverflow;
            previouslyFocused?.focus();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="contact-title"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-[523px] rounded-2xl bg-white shadow-xl"
            >
                <div className="flex items-center justify-between border-b border-[#EEEAE6] px-6 py-5">
                    <h2 id="contact-title" className="text-xl font-semibold text-[#20232A]">
                        Contact Us
                    </h2>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-1 text-[#243B4A] transition hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <ul className="px-6 pb-6 pt-2">
                    {contacts.map((item, index) => {
                        const Icon = item.icon;
                        const external = item.href.startsWith('http');
                        return (
                            <li key={item.id} className={index > 0 ? 'border-t border-[#F0EDEA]' : ''}>
                                <a
                                    href={item.href}
                                    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                                    className="flex items-center gap-3 py-4 text-sm text-[#3B4150] transition hover:text-[#E95312]"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF0F2] text-[#243B4A]">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    {item.label}
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

/* ─── Tab: Help Center ─────────────────────────────────────────── */
type HelpCenterProps = {
    enquiryTypes: string[];
    loadingTypes: boolean;
    content: SupportContentEntry[];
};

function HistorySkeleton({ rows }: { rows: number }) {
    return (
        <ul className="mt-6" aria-hidden="true">
            {Array.from({ length: rows }, (_, index) => (
                <li key={index} className={`grid grid-cols-2 gap-4 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr] ${index > 0 ? 'border-t border-[#EEEAE6]' : ''}`}>
                    {Array.from({ length: 4 }, (_, cell) => (
                        <div key={cell}>
                            <span className="block h-3 w-16 animate-pulse rounded bg-[#EEF0F2]" />
                            <span className="mt-3 block h-4 w-24 animate-pulse rounded bg-[#EEF0F2]" />
                        </div>
                    ))}
                </li>
            ))}
        </ul>
    );
}

function HelpCenter({ enquiryTypes, loadingTypes, content }: HelpCenterProps) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [contactOpen, setContactOpen] = useState(false);
    const closeContact = useCallback(() => setContactOpen(false), []);

    const history = useSupportHistory(page - 1, pageSize);
    const rows = history.data ?? [];
    // The history endpoint has no total count, so a short page means it is the last one.
    const hasNext = rows.length === pageSize;
    const start = (page - 1) * pageSize;

    const helpEntries = bySection(content, 'HELP');
    const publishedContacts = bySection(content, 'CONTACT').map(contactFromEntry);
    const contacts = publishedContacts.length ? publishedContacts : CONTACTS;
    const legalLinks = [...bySection(content, 'TERMS'), ...bySection(content, 'PRIVACY')].filter((entry) => entry.url);

    return (
        <div>
            {/* Service banner */}
            <div className="flex items-center gap-3 rounded-lg bg-[#EEF4F6] px-4 py-4 text-sm text-[#243B4A]">
                <Headphones className="h-5 w-5 shrink-0 text-[#2A7F86]" />
                <p>
                    <span className="font-semibold">Customer Service Center.</span>{' '}
                    <span className="text-[#52617A]">24 hours service for you.</span>
                </p>
            </div>

            {/* Published help entries */}
            {helpEntries.length > 0 && (
                <section className="mt-6" aria-labelledby="help-articles-title">
                    <h3 id="help-articles-title" className="text-sm font-semibold text-[#20232A]">
                        Helpful articles
                    </h3>
                    <ul className="mt-3 grid gap-3 md:grid-cols-2">
                        {helpEntries.map((entry, index) => {
                            const body = (
                                <>
                                    <span className="flex items-center gap-2 text-sm font-medium text-[#20232A]">
                                        <FileText className="h-4 w-4 shrink-0 text-[#E95312]" />
                                        {entry.title}
                                        {entry.url && <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-[#7A7F8A]" />}
                                    </span>
                                    {entry.body && <span className="mt-1.5 line-clamp-3 block text-xs leading-relaxed text-[#52617A]">{entry.body}</span>}
                                </>
                            );
                            const cls = 'block h-full rounded-lg border border-[#EBE6E1] bg-white px-4 py-3.5';
                            return (
                                <li key={`${entry.title}-${index}`}>
                                    {entry.url ? (
                                        <a href={entry.url} target="_blank" rel="noreferrer" className={`${cls} transition hover:border-[#F6D9C8] hover:bg-[#FFF9F6]`}>
                                            {body}
                                        </a>
                                    ) : (
                                        <div className={cls}>{body}</div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            <p className="mt-8 text-sm text-[#7A7F8A] sm:text-base">Hi there! 👋 Need a hand with anything today?</p>

            {/* Enquiry form */}
            <div className="mt-6">
                <SupportEnquiryForm enquiryTypes={enquiryTypes} loadingTypes={loadingTypes} onSent={() => setPage(1)} />
            </div>

            {/* Recent Support History */}
            <section className="mt-8 rounded-xl border border-[#EBE6E1] bg-white px-5 py-6 sm:px-6" aria-labelledby="history-title">
                <h3 id="history-title" className="text-base font-semibold text-[#20232A]">
                    Recent Support History
                </h3>
                <p className="mt-2 text-xs text-[#52617A]">Select a request to see replies and its progress.</p>

                {history.isLoading ? (
                    <HistorySkeleton rows={3} />
                ) : history.isError && !rows.length ? (
                    <div className="mt-6 rounded-lg bg-[#FFF5F4] px-4 py-6 text-center">
                        <p className="text-sm text-[#52617A]">We could not load your support history.</p>
                        <button
                            type="button"
                            onClick={() => history.refetch()}
                            className="mt-3 rounded-md border border-[#E6E3E0] bg-white px-3.5 py-2 text-xs font-medium text-[#20232A] transition hover:bg-slate-50"
                        >
                            Try again
                        </button>
                    </div>
                ) : !rows.length ? (
                    <p className="mt-6 rounded-lg bg-[#F9F9FA] px-4 py-8 text-center text-sm text-[#7A7F8A]">
                        {page > 1 ? 'No more requests.' : 'You have not contacted support yet. Your requests will show here.'}
                    </p>
                ) : (
                    <ul className={`mt-6 transition-opacity ${history.isPlaceholderData ? 'opacity-55' : ''}`}>
                        {rows.map((row, index) => {
                            const status = ticketStatus(row.status);
                            return (
                                <li key={row.ticketId} className={index > 0 ? 'border-t border-[#EEEAE6]' : ''}>
                                    <Link
                                        href={ticketHref(row.ticketId)}
                                        className="-mx-3 grid grid-cols-2 gap-x-4 gap-y-4 rounded-lg px-3 py-4 transition hover:bg-[#FFF9F6] md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs text-[#7A7F8A]">Comment</p>
                                            <p className="mt-2 truncate text-sm font-medium text-[#20232A] sm:text-base">
                                                {row.remark?.trim() || (row.rating != null ? `${row.rating} star rating` : '—')}
                                            </p>
                                            <p className="mt-1 truncate font-mono text-[11px] text-[#7A7F8A]">{row.reference}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#7A7F8A]">Enquiry Type</p>
                                            <p className="mt-2 text-sm font-medium text-[#20232A] sm:text-base">{ticketTypeLabel(row)}</p>
                                            {row.requestType === 'COMPLAINT' && <p className="mt-1 text-[11px] text-[#C2410C]">Complaint</p>}
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#7A7F8A]">Date</p>
                                            <p className="mt-2 text-sm font-medium text-[#20232A] sm:text-base">
                                                {row.date ? formatPlainDate(row.date) : formatDateTime(row.createdAt)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[#7A7F8A]">Status</p>
                                            <span className={`mt-2 inline-block rounded px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                                        </div>
                                        <ChevronRight className="hidden h-4 w-4 text-[#A3A8B1] md:block" aria-hidden="true" />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Pagination */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[#7A7F8A]">
                    <p>{rows.length ? `Showing ${start + 1}-${start + rows.length}` : `Page ${page}`}</p>
                    <div className="flex items-center gap-2">
                        <label htmlFor="page-size">Show</label>
                        <div className="relative">
                            <select
                                id="page-size"
                                value={pageSize}
                                onChange={(event) => {
                                    setPageSize(Number(event.target.value));
                                    setPage(1);
                                }}
                                className="h-8 appearance-none rounded-md border border-[#E6E3E0] bg-white pl-3 pr-7 text-sm text-[#52617A] outline-none focus:border-[#E95312]"
                            >
                                {PAGE_SIZES.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                        </div>
                        <span>entries</span>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            aria-label="Previous page"
                            className="ml-1 flex h-7 w-7 items-center justify-center rounded-md border border-[#E6E3E0] bg-[#F1F3F9] text-[#52617A] transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-1 font-medium text-[#20232A]" aria-current="page">
                            {page}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasNext || history.isPlaceholderData}
                            aria-label="Next page"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E6E3E0] bg-white text-[#20232A] transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact strip */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#FFEFE5] px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-[#20232A]">Do you still need our help?</p>
                    <p className="mt-1 text-xs text-[#52617A]">Reach us via phone, email &amp; social accounts</p>
                </div>
                <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="rounded-md border border-[#E6E3E0] bg-white px-3.5 py-2 text-xs font-medium text-[#20232A] transition hover:bg-slate-50"
                >
                    Contact Us
                </button>
            </div>

            {legalLinks.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#52617A]">
                    {legalLinks.map((entry, index) => (
                        <li key={`${entry.section}-${index}`}>
                            <a href={entry.url as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition hover:text-[#E95312]">
                                {entry.title} <ExternalLink className="h-3 w-3" />
                            </a>
                        </li>
                    ))}
                </ul>
            )}

            <ContactModal open={contactOpen} onClose={closeContact} contacts={contacts} />
        </div>
    );
}

/* ─── Tab: FAQs ────────────────────────────────────────────────── */
type FaqGroup = { id: string; label: string; items: { q: string; a: string; url?: string | null }[] };

function Faqs({ entries }: { entries: SupportContentEntry[] }) {
    // Published FAQ entries from the API replace the built-in list once support adds any.
    const groups: FaqGroup[] = entries.length
        ? [{ id: 'published', label: 'Frequently asked questions', items: entries.map((e) => ({ q: e.title, a: e.body ?? '', url: e.url })) }]
        : FAQ_GROUPS;
    const [groupId, setGroupId] = useState(groups[0].id);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const group = groups.find((g) => g.id === groupId) ?? groups[0];

    const selectGroup = (id: string) => {
        setGroupId(id);
        setOpenIndex(null);
    };

    return (
        <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
            <aside className="h-fit self-start rounded-xl border border-[#EBE6E1] bg-white px-3.5 pb-6 pt-6" aria-label="FAQ categories">
                <p className="px-3 text-xs font-medium uppercase text-[#52617A]">Select FAQs type</p>
                <ul className="mt-3 space-y-1">
                    {groups.map((item) => {
                        const active = item.id === group.id;
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => selectGroup(item.id)}
                                    aria-current={active ? 'true' : undefined}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${active ? 'bg-[#EEF0F2] font-medium text-[#20232A]' : 'text-[#52617A] hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="flex-1">{item.label}</span>
                                    {active && (
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#243B4A]">
                                            <ChevronRight className="h-3 w-3 text-white" strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </aside>

            <section className="min-w-0 max-w-[592px] lg:pt-3" aria-labelledby="faq-title">
                <h3 id="faq-title" className="text-lg font-semibold text-[#20232A]">
                    {group.label}
                </h3>
                <ul className="mt-4">
                    {group.items.map((item, index) => {
                        const open = openIndex === index;
                        const panelId = `faq-panel-${group.id}-${index}`;
                        return (
                            <li key={item.q} className="border-b border-[#E6E3E0]">
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(open ? null : index)}
                                    aria-expanded={open}
                                    aria-controls={panelId}
                                    className="flex w-full items-center gap-4 py-4 text-left text-base text-[#20232A]"
                                >
                                    {open ? (
                                        <Minus className="h-4 w-4 shrink-0 text-[#E95312]" />
                                    ) : (
                                        <Plus className="h-4 w-4 shrink-0 text-[#E95312]" />
                                    )}
                                    {item.q}
                                </button>
                                {open && (
                                    <div id={panelId} className="pb-5 pl-8 text-sm leading-relaxed text-[#52617A]">
                                        {item.a && <p className="whitespace-pre-line">{item.a}</p>}
                                        {'url' in item && item.url && (
                                            <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[#E95312] hover:underline">
                                                Read more <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}

/* ─── Tab: Feedback ────────────────────────────────────────────── */
// Star rating bound to Formik through the shared field hook
function RatingField({ name }: { name: string }) {
    const { field, setValue, error } = useFormField<number>(name);
    const [hover, setHover] = useState(0);
    const shown = hover || field.value;

    return (
        <div>
            <p id={`${name}-label`} className="mt-7 text-base font-medium text-[#20232A]">
                Rating <span className="text-[#E95312]">*</span>
            </p>
            <div role="radiogroup" aria-labelledby={`${name}-label`} className="mt-5 flex gap-4" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={field.value === value}
                        aria-label={`${value} star${value > 1 ? 's' : ''}`}
                        onClick={() => setValue(value)}
                        onMouseEnter={() => setHover(value)}
                        className="rounded-md transition hover:scale-105"
                    >
                        <Star
                            className={`h-[52px] w-[52px] text-[#D2492A] ${value <= shown ? 'fill-[#D2492A]' : 'fill-transparent'}`}
                            strokeWidth={1.5}
                        />
                    </button>
                ))}
            </div>
            {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
        </div>
    );
}

function Feedback() {
    const submitFeedback = useSubmitSupportFeedback();
    const [receipt, setReceipt] = useState<SupportReceipt | null>(null);
    // Reused if the user retries after a failure; replaced after each successful submission.
    const keyRef = useRef(newIdempotencyKey());

    const handleSubmit = async (values: FeedbackValues, { resetForm }: FormikHelpers<FeedbackValues>) => {
        const remark = values.remark.trim();
        try {
            const result = await submitFeedback.mutateAsync({
                rating: values.rating,
                ...(remark ? { remark } : {}),
                idempotencyKey: keyRef.current,
            });
            keyRef.current = newIdempotencyKey();
            resetForm();
            setReceipt(result);
        } catch {
            // The axios interceptor shows the error toast; keep the values so the user can retry.
        }
    };

    return (
        <Formik<FeedbackValues> initialValues={EMPTY_FEEDBACK} validationSchema={feedbackSchema} onSubmit={handleSubmit}>
            <Form noValidate>
                {receipt && (
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[#D5EEDD] bg-[#F3FAF6] px-4 py-4" aria-live="polite">
                        <div className="flex min-w-0 items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2E9A4F]" />
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#20232A]">Thanks for your feedback.</p>
                                <p className="mt-1 text-xs text-[#52617A]">
                                    Reference <span className="break-all font-mono font-medium text-[#20232A]">{receipt.reference}</span>
                                </p>
                            </div>
                        </div>
                        <Link
                            href={ticketHref(receipt.ticketId)}
                            className="shrink-0 rounded-md border border-[#E6E3E0] bg-white px-3.5 py-2 text-xs font-medium text-[#20232A] transition hover:bg-slate-50"
                        >
                            View ticket
                        </Link>
                    </div>
                )}

                <p className="text-sm text-[#7A7F8A] sm:text-base">How would you rate your experience with QApp today?</p>

                <RatingField name="rating" />

                <TextAreaField
                    name="remark"
                    id="feedback-remark"
                    label="Remark"
                    variant="dashboard"
                    placeholder="Enter Remark"
                    rows={4}
                    maxLength={10_000}
                    className="mt-7"
                />

                <div className="mt-4 flex items-center justify-end gap-4">
                    <SubmitButton variant="primary" loadingLabel="Submitting…">
                        Submit
                    </SubmitButton>
                </div>
            </Form>
        </Formik>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function SupportPage() {
    const [tab, setTab] = useState<SupportTab>('help');
    const options = useSupportOptions();
    const content = options.data?.content ?? [];

    return (
        <div className="min-h-full bg-[#FFFAF7] text-[#18202A]">
            {/* ── Page header ── */}
            <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">Support</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">
                    Real help, right <span className="text-[#EE7230]">when you need it.</span>
                </h2>
                <p className="mt-2 text-sm text-[#777486] sm:text-base">Keep your information current and choose how Hatiso protects you.</p>
            </section>

            <main className="px-5 py-6 sm:px-8 lg:py-8">
                {/* ── Pill tabs ── */}
                <div role="tablist" aria-label="Support sections" className="flex flex-wrap gap-3">
                    {TABS.map((item) => {
                        const active = tab === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                id={`support-tab-${item.id}`}
                                aria-selected={active}
                                aria-controls={`support-panel-${item.id}`}
                                onClick={() => setTab(item.id)}
                                className={`rounded-full border px-5 py-2.5 text-sm transition ${active
                                    ? 'border-[#243B4A] bg-[#243B4A] font-medium text-white'
                                    : 'border-[#EBE6E1] bg-white text-[#20232A] hover:bg-slate-50'
                                    }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* ── Active panel ── */}
                <section
                    role="tabpanel"
                    id={`support-panel-${tab}`}
                    aria-labelledby={`support-tab-${tab}`}
                    className="mt-8 min-w-0"
                >
                    {tab === 'help' && (
                        <HelpCenter enquiryTypes={options.data?.enquiryTypes ?? []} loadingTypes={options.isLoading} content={content} />
                    )}
                    {tab === 'faqs' && <Faqs entries={bySection(content, 'FAQ')} />}
                    {tab === 'feedback' && <Feedback />}
                </section>
            </main>
        </div>
    );
}