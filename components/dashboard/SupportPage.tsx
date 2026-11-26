'use client';

import { useMemo, useRef, useState, type ComponentType, type SVGProps } from 'react';
import Link from 'next/link';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { SubmitButton, TextAreaField, useFormField } from '@/components/forms';
import { Check, ChevronDown, ExternalLink, FileText, Mail, Phone, Search } from 'lucide-react';
import SupportEnquiryForm from '@/components/support/SupportEnquiryForm';
import { ticketHref, ticketStatus, ticketTypeLabel } from '@/components/support/supportDisplay';
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
    { id: 'help', label: 'Get help' },
    { id: 'faqs', label: 'Questions' },
    { id: 'feedback', label: 'Feedback' },
];

/* ─── Forms ────────────────────────────────────────────────────── */
type FeedbackValues = { rating: number; remark: string };
const EMPTY_FEEDBACK: FeedbackValues = { rating: 0, remark: '' };
const feedbackSchema = Yup.object({
    rating: Yup.number().min(1, 'Choose a rating.').max(5),
    remark: Yup.string().trim().max(10_000, 'Keep it under 10,000 characters.'),
});
const HISTORY_PAGE = 6;

// Fallback contacts, used until support publishes CONTACT entries in GET /support/options
const CONTACTS: ContactItem[] = [
    { id: 'phone', label: '0-2562718', href: 'tel:02562718', icon: Phone },
    { id: 'email', label: 'Qapp@gmail.com', href: 'mailto:Qapp@gmail.com', icon: Mail },
    { id: 'facebook', label: 'Qapp by Hatiso', href: 'https://facebook.com', icon: FacebookLogo },
    { id: 'instagram', label: 'Qapp by Hatiso', href: 'https://instagram.com', icon: InstagramLogo },
    { id: 'x', label: 'Qapp by Hatiso', href: 'https://x.com', icon: XLogo },
];

/** Support board questions. Published FAQ entries from the API replace these once support adds any. */
const FAQ_GROUPS = [
    {
        id: 'pay',
        label: 'Payments',
        items: [
            { q: 'I paid but my electricity token didn\u2019t arrive', a: 'Tokens usually arrive within a minute. Check Transactions for the token on your receipt. If it\u2019s still missing after 15 minutes, send us a request with the meter number.' },
            { q: 'How do refunds work?', a: 'If a provider declines a payment, the money goes back to your card automatically. Your bank may take 1 to 5 working days to show it.' },
            { q: 'Can I pay without an account?', a: 'Yes. You can pay as a guest from any service page.' },
            { q: 'Are there any fees?', a: 'Any service fee is shown on the confirmation screen before you pay.' },
        ],
    },
    {
        id: 'account',
        label: 'Account',
        items: [
            { q: 'How do I change my name?', a: 'Go to Profile and security, then Personal details.' },
            { q: 'How do I change my password?', a: 'Go to Profile and security, then Security, and choose Change password.' },
            { q: 'What should I do if I notice suspicious activity?', a: 'Change your password straight away and send us a request so we can secure your account.' },
        ],
    },
    {
        id: 'bank',
        label: 'Banking',
        items: [
            { q: 'Does Hatiso see my bank login?', a: 'No. We open your bank\u2019s official app or website and you sign in there.' },
            { q: 'My bank isn\u2019t listed. What can I do?', a: 'Send us a request with the bank\u2019s name. We add new partner banks regularly.' },
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

/* ─── Get help ─────────────────────────────────────────────────── */
type HelpCenterProps = {
    enquiryTypes: string[];
    loadingTypes: boolean;
    content: SupportContentEntry[];
};

const CARD = 'rounded-[14px] border border-tone-100 bg-surface';

/** Status colour for the "Your requests" dots: resolved/closed green, anything still open amber. */
function statusDot(status: string) {
    const key = (status || '').toUpperCase();
    if (['RESOLVED', 'CLOSED', 'COMPLETED'].includes(key)) return 'bg-status-success';
    if (['REJECTED', 'FAILED', 'CANCELLED'].includes(key)) return 'bg-status-error';
    return 'bg-status-warning';
}

function whenLabel(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(d);
}

function HelpCenter({ enquiryTypes, loadingTypes, content }: HelpCenterProps) {
    const [size, setSize] = useState(HISTORY_PAGE);
    const history = useSupportHistory(0, size);
    const rows = history.data ?? [];
    const hasMore = rows.length === size;

    const helpEntries = bySection(content, 'HELP');
    const publishedContacts = bySection(content, 'CONTACT').map(contactFromEntry);
    const contacts = publishedContacts.length ? publishedContacts : CONTACTS;
    const direct = contacts.filter((c) => c.href.startsWith('mailto:') || c.href.startsWith('tel:'));
    const social = contacts.filter((c) => c.href.startsWith('http'));
    const legalLinks = [...bySection(content, 'TERMS'), ...bySection(content, 'PRIVACY')].filter((entry) => entry.url);

    return (
        <div className="hz-stagger flex flex-wrap items-start gap-4">
            <section className={`${CARD} flex min-w-0 flex-[999_1_520px] flex-col gap-[18px] p-6`}>
                <h2 className="text-lg font-semibold">Send us a request</h2>
                <SupportEnquiryForm enquiryTypes={enquiryTypes} loadingTypes={loadingTypes} onSent={() => setSize(HISTORY_PAGE)} />
            </section>

            <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
                <section className={`${CARD} flex flex-col p-[22px]`}>
                    <h2 className="pb-2 text-lg font-semibold">Your requests</h2>
                    {history.isLoading ? (
                        <div className="flex flex-col gap-3 py-2" aria-hidden="true">
                            {Array.from({ length: 3 }, (_, i) => <span key={i} className="block h-10 animate-pulse rounded-lg bg-tone-44" />)}
                        </div>
                    ) : history.isError && !rows.length ? (
                        <div className="flex flex-col items-start gap-3 border-t border-tone-44 py-3">
                            <p className="text-sm text-tone-414">We couldn&apos;t load your requests.</p>
                            <button type="button" onClick={() => history.refetch()} className="text-sm font-medium underline underline-offset-4">Try again</button>
                        </div>
                    ) : !rows.length ? (
                        <p className="border-t border-tone-44 py-3 text-sm text-tone-414">You haven&apos;t sent a request yet. They&apos;ll show here.</p>
                    ) : (
                        <ul className={history.isPlaceholderData ? 'opacity-60' : ''}>
                            {rows.map((row) => {
                                const status = ticketStatus(row.status);
                                const subject = row.remark?.trim().replace(/^Transaction reference:.*\n+/, '') || ticketTypeLabel(row);
                                return (
                                    <li key={row.ticketId}>
                                        <Link href={ticketHref(row.ticketId)} className="-mx-2 flex flex-col gap-1 rounded-lg border-t border-tone-44 px-2 py-3 transition-colors hover:bg-tone-44">
                                            <span className="flex items-center justify-between gap-3">
                                                <span className="truncate text-[15px] font-medium">{subject}</span>
                                                <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-tone-414">
                                                    <span className={`h-2 w-2 rounded-full ${statusDot(row.status)}`} aria-hidden="true" />
                                                    {status.label}
                                                </span>
                                            </span>
                                            <span className="truncate text-[13px] text-tone-414">{row.reference} · {whenLabel(row.createdAt)}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {hasMore && (
                        <button type="button" onClick={() => setSize((n) => n + HISTORY_PAGE)} disabled={history.isPlaceholderData} className="mt-2 self-start text-sm font-medium underline underline-offset-4 disabled:opacity-50">
                            Show more
                        </button>
                    )}
                </section>

                <div className="flex flex-col gap-2.5 rounded-[14px] bg-carbon p-[22px] text-cloud">
                    <span className="text-base font-semibold">Reach us directly</span>
                    {direct.map((c) => {
                        const Icon = c.icon;
                        return (
                            <a key={c.id} href={c.href} className="inline-flex items-center gap-2.5 text-sm text-silver hover:text-cloud">
                                <Icon className="h-4 w-4" />
                                {c.label}
                                {c.href.startsWith('tel:') && ' · 24 hours'}
                            </a>
                        );
                    })}
                    {social.length > 0 && (
                        <div className="mt-1 flex gap-2">
                            {social.map((c) => {
                                const Icon = c.icon;
                                return (
                                    <a key={c.id} href={c.href} target="_blank" rel="noreferrer" aria-label={c.label} className="flex h-9 w-9 items-center justify-center rounded-lg bg-graphite text-silver hover:text-cloud">
                                        <Icon className="h-4 w-4" />
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>

                {helpEntries.length > 0 && (
                    <section className={`${CARD} flex flex-col gap-1 p-[22px]`} aria-labelledby="help-articles-title">
                        <h2 id="help-articles-title" className="pb-2 text-lg font-semibold">Helpful articles</h2>
                        {helpEntries.map((entry, index) => {
                            const inner = (
                                <>
                                    <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-[15px] font-medium">{entry.title}</span>
                                        {entry.body && <span className="line-clamp-2 text-[13px] text-tone-414">{entry.body}</span>}
                                    </span>
                                </>
                            );
                            const cls = 'flex gap-2.5 border-t border-tone-44 py-3';
                            return entry.url ? (
                                <a key={`${entry.title}-${index}`} href={entry.url} target="_blank" rel="noreferrer" className={`${cls} hover:text-tone-414`}>{inner}</a>
                            ) : (
                                <div key={`${entry.title}-${index}`} className={cls}>{inner}</div>
                            );
                        })}
                    </section>
                )}

                {legalLinks.length > 0 && (
                    <ul className="flex flex-wrap gap-x-5 gap-y-2 px-1 text-xs text-tone-414">
                        {legalLinks.map((entry, index) => (
                            <li key={`${entry.section}-${index}`}>
                                <a href={entry.url as string} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-tone-744">
                                    {entry.title} <ExternalLink className="h-3 w-3" />
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </aside>
        </div>
    );
}

/* ─── Questions ────────────────────────────────────────────────── */
type FaqGroup = { id: string; label: string; items: { q: string; a: string; url?: string | null }[] };

function Faqs({ entries }: { entries: SupportContentEntry[] }) {
    const groups: FaqGroup[] = useMemo(
        () => (entries.length ? [{ id: 'published', label: 'All questions', items: entries.map((e) => ({ q: e.title, a: e.body ?? '', url: e.url })) }] : FAQ_GROUPS),
        [entries]
    );
    const [groupId, setGroupId] = useState(groups[0].id);
    const [open, setOpen] = useState(0);
    const [query, setQuery] = useState('');
    const group = groups.find((g) => g.id === groupId) ?? groups[0];

    // Search looks across every group; without a search, the chosen group shows.
    const items = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return group.items;
        return groups.flatMap((g) => g.items).filter((i) => `${i.q} ${i.a}`.toLowerCase().includes(q));
    }, [query, group, groups]);

    return (
        <div className="hz-stagger flex w-full flex-col gap-3.5">
            <label className="relative flex items-center">
                <Search className="pointer-events-none absolute left-4 h-[18px] w-[18px] text-tone-414" aria-hidden="true" />
                <span className="sr-only">Search questions</span>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(0);
                    }}
                    placeholder="Search questions"
                    className="min-h-12 w-full rounded-[10px] border border-tone-100 bg-surface pr-4 pl-11 text-[15px] outline-none placeholder:text-tone-414 focus:border-brand-305"
                />
            </label>
            {groups.length > 1 && !query.trim() && (
                <div role="radiogroup" aria-label="Question type" className="flex flex-wrap gap-2">
                    {groups.map((g) => {
                        const on = g.id === group.id;
                        return (
                            <button
                                key={g.id}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => {
                                    setGroupId(g.id);
                                    setOpen(0);
                                }}
                                className={`min-h-[38px] rounded-lg border px-3.5 text-sm font-medium transition-colors ${on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface hover:border-tone-414'}`}
                            >
                                {g.label}
                            </button>
                        );
                    })}
                </div>
            )}
            <div className={`${CARD} overflow-hidden`}>
                {items.length ? (
                    items.map((item, index) => {
                        const isOpen = open === index;
                        const panelId = `faq-panel-${index}`;
                        return (
                            <div key={item.q} className="border-b border-tone-44 last:border-b-0">
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    onClick={() => setOpen(isOpen ? -1 : index)}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left text-[15px] font-medium hover:bg-tone-44"
                                >
                                    {item.q}
                                    <ChevronDown className={`h-[18px] w-[18px] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>
                                {isOpen && (
                                    <div id={panelId} className="hz-pop px-5 pb-[18px] text-sm leading-relaxed text-tone-414">
                                        {item.a && <p className="whitespace-pre-line">{item.a}</p>}
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-medium text-tone-744 underline underline-offset-4">
                                                Read more <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="px-5 py-10 text-center text-sm text-tone-414">No questions match that. Try another word, or send us a request.</p>
                )}
            </div>
        </div>
    );
}

/* ─── Feedback ─────────────────────────────────────────────────── */
const SCORE_LABELS = ['Poor', 'Fair', 'Okay', 'Good', 'Great'];

function ScoreField({ name }: { name: string }) {
    const { field, setValue, error } = useFormField<number>(name);
    return (
        <div className="flex flex-col gap-2">
            <div role="radiogroup" aria-label="Rating" className="grid grid-cols-5 gap-2">
                {SCORE_LABELS.map((label, i) => {
                    const value = i + 1;
                    const on = field.value === value;
                    return (
                        <button
                            key={label}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setValue(value)}
                            className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-[10px] border transition-colors ${on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface hover:border-tone-414'}`}
                        >
                            <span className="text-xl font-semibold">{value}</span>
                            <span className={`text-xs ${on ? '' : 'text-tone-414'}`}>{label}</span>
                        </button>
                    );
                })}
            </div>
            {error ? <p className="text-xs text-status-error">{error}</p> : null}
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

    if (receipt) {
        return (
            <section className={`hz-pop ${CARD} flex max-w-[720px] flex-col items-center gap-3 px-6 py-12 text-center`}>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-305 text-on-brand">
                    <Check className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="text-xl font-semibold">Thanks for your feedback.</h2>
                <p className="text-[15px] text-tone-414">It helps us make Hatiso better.</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2.5">
                    <Link href={ticketHref(receipt.ticketId)} className="hz-press inline-flex min-h-11 items-center rounded-[10px] border border-tone-100 px-[18px] text-sm font-medium hover:border-tone-414">View {receipt.reference}</Link>
                    <button type="button" onClick={() => setReceipt(null)} className="hz-press inline-flex min-h-11 items-center rounded-[10px] px-[18px] text-sm font-medium hover:bg-tone-44">Send more feedback</button>
                </div>
            </section>
        );
    }

    return (
        <Formik<FeedbackValues> initialValues={EMPTY_FEEDBACK} validationSchema={feedbackSchema} onSubmit={handleSubmit}>
            <Form noValidate className={`hz-pop ${CARD} flex max-w-[720px] flex-col gap-5 p-6`}>
                <h2 className="text-lg font-semibold">How would you rate your experience with Hatiso today?</h2>
                <ScoreField name="rating" />
                <TextAreaField name="remark" id="feedback-remark" label="What could we do better? (optional)" variant="dashboard" rows={4} maxLength={10_000} />
                <div className="flex justify-end">
                    <SubmitButton variant="primary" loadingLabel="Sending…">Send feedback</SubmitButton>
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
        <div className="min-h-full bg-tone-44 text-tone-744">
            <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
                <div className="hz-rise flex flex-col gap-1.5">
                    <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em]">Help and support</h1>
                    <span className="text-[15px] text-tone-414">Get help with a payment, find answers, or tell us how we did.</span>
                </div>

                <div className="hz-rise" style={{ '--d': 1 } as React.CSSProperties}>
                    <div role="radiogroup" aria-label="Section" className="flex flex-wrap gap-2">
                        {TABS.map((item) => {
                            const on = tab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={on}
                                    onClick={() => setTab(item.id)}
                                    className={`min-h-[38px] rounded-lg border px-3.5 text-sm font-medium transition-colors ${on ? 'border-brand-305 bg-brand-305 text-on-brand' : 'border-tone-100 bg-surface hover:border-tone-414'}`}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {tab === 'help' && <HelpCenter enquiryTypes={options.data?.enquiryTypes ?? []} loadingTypes={options.isLoading} content={content} />}
                {tab === 'faqs' && <Faqs entries={bySection(content, 'FAQ')} />}
                {tab === 'feedback' && <Feedback />}
            </div>
        </div>
    );
}
