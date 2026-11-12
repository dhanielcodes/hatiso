'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import { Formik, Form, type FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { DateField, SelectField, SubmitButton, TextAreaField, useFormField } from '@/components/forms';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Headphones,
    Mail,
    Minus,
    Phone,
    Plus,
    Star,
    X,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */
type SupportTab = 'help' | 'faqs' | 'feedback';
type EnquiryStatus = 'In progress' | 'Approved' | 'Cancel';

type HistoryItem = {
    id: number;
    comment: string;
    type: string;
    date: string; // dd/mm/yyyy
    status: EnquiryStatus;
};

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

const ENQUIRY_TYPES = ['Transaction', 'Onboarding', 'Status', 'Account', 'Other'];

/* ─── Forms ────────────────────────────────────────────────────── */
type EnquiryValues = { enquiryType: string; date: string; remark: string };
const EMPTY_ENQUIRY: EnquiryValues = { enquiryType: '', date: '', remark: '' };
const enquirySchema = Yup.object({
    enquiryType: Yup.string().required('Select an enquiry type.'),
    date: Yup.string().required('Pick a date.'),
    remark: Yup.string().trim().required('Enter a remark.'),
});

type FeedbackValues = { rating: number; remark: string };
const EMPTY_FEEDBACK: FeedbackValues = { rating: 0, remark: '' };
const feedbackSchema = Yup.object({
    rating: Yup.number().min(1, 'Choose a rating.'),
    remark: Yup.string().trim(),
});
const PAGE_SIZES = [10, 20, 50];

const STATUS_STYLES: Record<EnquiryStatus, string> = {
    'In progress': 'text-[#F2A900]',
    Approved: 'text-[#4CAF50]',
    Cancel: 'text-[#E22E41]',
};

/* ─── Dummy data ───────────────────────────────────────────────── */
const HISTORY_SEED: Omit<HistoryItem, 'id'>[] = [
    { comment: 'My Transfer...', type: 'Transaction', date: '21/05/2025', status: 'In progress' },
    { comment: 'Signatories..', type: 'Onboarding', date: '16/05/2025', status: 'Approved' },
    { comment: 'Approval..', type: 'Status', date: '13/02/2024', status: 'Cancel' },
];

// 100 dummy rows so pagination has something to page through
const INITIAL_HISTORY: HistoryItem[] = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    ...HISTORY_SEED[i % HISTORY_SEED.length],
}));

// Replace the hrefs with your real contact details / social links
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

function formatDate(iso: string) {
    const [y, m, d] = iso.split('-');
    return y && m && d ? `${d}/${m}/${y}` : iso;
}


/* ─── Contact Us modal ─────────────────────────────────────────── */
function ContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
                <div className="flex items-center justify-between border-b border-[#E3E8EB] px-6 py-5">
                    <h2 id="contact-title" className="text-xl font-semibold text-[#10202A]">
                        Contact Us
                    </h2>
                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-1 text-[#10202A] transition hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <ul className="px-6 pb-6 pt-2">
                    {CONTACTS.map((item, index) => {
                        const Icon = item.icon;
                        const external = item.href.startsWith('http');
                        return (
                            <li key={item.id} className={index > 0 ? 'border-t border-[#F3F4F5]' : ''}>
                                <a
                                    href={item.href}
                                    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                                    className="flex items-center gap-3 py-4 text-sm text-[#233C49] transition hover:text-[#C2531C]"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF0F2] text-[#10202A]">
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
function HelpCenter() {
    const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
    const [sent, setSent] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [contactOpen, setContactOpen] = useState(false);
    const closeContact = useCallback(() => setContactOpen(false), []);

    useEffect(() => {
        if (!sent) return;
        const timer = setTimeout(() => setSent(false), 3000);
        return () => clearTimeout(timer);
    }, [sent]);

    const handleSubmit = (values: EnquiryValues, { resetForm }: FormikHelpers<EnquiryValues>) => {
        // Dummy only: no request is sent
        const text = values.remark.trim();
        setHistory((h) => [
            {
                id: Date.now(),
                comment: text.length > 16 ? `${text.slice(0, 16)}...` : text,
                type: values.enquiryType,
                date: formatDate(values.date),
                status: 'In progress',
            },
            ...h,
        ]);
        setPage(1);
        resetForm();
        setSent(true);
    };

    const total = history.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const rows = history.slice(start, start + pageSize);

    return (
        <div>
            {/* Service banner */}
            <div className="flex items-center gap-3 rounded-lg bg-[#EEF4F6] px-4 py-4 text-sm text-[#10202A]">
                <Headphones className="h-5 w-5 shrink-0 text-[#2A7F86]" />
                <p>
                    <span className="font-semibold">Customer Service Center.</span>{' '}
                    <span className="text-[#4A5B64]">24 hours service for you.</span>
                </p>
            </div>

            <p className="mt-8 text-sm text-[#5D6F78] sm:text-base">Hi there! 👋 Need a hand with anything today?</p>

            {/* Enquiry form */}
            <Formik<EnquiryValues> initialValues={EMPTY_ENQUIRY} validationSchema={enquirySchema} onSubmit={handleSubmit}>
                <Form className="mt-6" noValidate>
                    <div className="grid gap-5 md:grid-cols-2">
                        <SelectField
                            name="enquiryType"
                            id="enquiry-type"
                            label="Enquiry Type"
                            required
                            variant="dashboard"
                            placeholder="Select enquiry type"
                            options={ENQUIRY_TYPES.map((type) => ({ value: type, label: type }))}
                        />
                        <DateField name="date" id="enquiry-date" label="Date" required variant="dashboard" />
                    </div>

                    <TextAreaField
                        name="remark"
                        id="enquiry-remark"
                        label="Remark"
                        required
                        variant="dashboard"
                        placeholder="Enter Remark"
                        rows={4}
                        className="mt-5"
                    />

                    <div className="mt-6 flex items-center justify-end gap-4">
                        {sent && (
                            <p className="text-sm text-[#2E9A4F]" aria-live="polite">
                                Enquiry sent.
                            </p>
                        )}
                        <SubmitButton variant="primary">Send Enquiry</SubmitButton>
                    </div>
                </Form>
            </Formik>

            {/* Recent Support History */}
            <section className="mt-8 rounded-3xl border border-[#E3E8EB] bg-white px-5 py-6 sm:px-6" aria-labelledby="history-title">
                <h3 id="history-title" className="text-base font-semibold text-[#10202A]">
                    Recent Support History
                </h3>
                <p className="mt-2 text-xs text-[#4A5B64]">Here is the most recent history</p>

                <ul className="mt-6">
                    {rows.map((row, index) => (
                        <li
                            key={row.id}
                            className={`grid grid-cols-2 gap-x-4 gap-y-4 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr] ${index > 0 ? 'border-t border-[#E3E8EB]' : ''}`}
                        >
                            <div>
                                <p className="text-xs text-[#5D6F78]">Comment</p>
                                <p className="mt-2 text-sm font-medium text-[#10202A] sm:text-base">{row.comment}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#5D6F78]">Enquiry Type</p>
                                <p className="mt-2 text-sm font-medium text-[#10202A] sm:text-base">{row.type}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#5D6F78]">Date</p>
                                <p className="mt-2 text-sm font-medium text-[#10202A] sm:text-base">{row.date}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#5D6F78]">Enquiries Status</p>
                                <p className={`mt-2 text-sm font-medium sm:text-base ${STATUS_STYLES[row.status]}`}>{row.status}</p>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Pagination */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[#5D6F78]">
                    <p>
                        Showing {total === 0 ? 0 : start + 1}-{Math.min(start + pageSize, total)} of {total} entries
                    </p>
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
                                className="h-8 appearance-none rounded-md border border-[#E3E8EB] bg-white pl-3 pr-7 text-sm text-[#4A5B64] outline-none focus:border-[#EE6E2D]"
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
                            className="ml-1 flex h-7 w-7 items-center justify-center rounded-md border border-[#E3E8EB] bg-[#F1F3F9] text-[#4A5B64] transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-1 font-medium text-[#10202A]" aria-current="page">
                            {page}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            aria-label="Next page"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E3E8EB] bg-white text-[#10202A] transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact strip */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#FFEFE5] px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-[#10202A]">Do you still need our help?</p>
                    <p className="mt-1 text-xs text-[#4A5B64]">Reach us via phone, email &amp; social accounts</p>
                </div>
                <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="rounded-md border border-[#E3E8EB] bg-white px-3.5 py-2 text-xs font-medium text-[#10202A] transition hover:bg-slate-50"
                >
                    Contact Us
                </button>
            </div>

            <ContactModal open={contactOpen} onClose={closeContact} />
        </div>
    );
}

/* ─── Tab: FAQs ────────────────────────────────────────────────── */
function Faqs() {
    const [groupId, setGroupId] = useState(FAQ_GROUPS[0].id);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const group = FAQ_GROUPS.find((g) => g.id === groupId) ?? FAQ_GROUPS[0];

    const selectGroup = (id: string) => {
        setGroupId(id);
        setOpenIndex(null);
    };

    return (
        <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
            <aside className="h-fit self-start rounded-3xl border border-[#E3E8EB] bg-white px-3.5 pb-6 pt-6" aria-label="FAQ categories">
                <p className="px-3 text-xs font-medium uppercase text-[#4A5B64]">Select FAQs type</p>
                <ul className="mt-3 space-y-1">
                    {FAQ_GROUPS.map((item) => {
                        const active = item.id === groupId;
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => selectGroup(item.id)}
                                    aria-current={active ? 'true' : undefined}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${active ? 'bg-[#EEF0F2] font-medium text-[#10202A]' : 'text-[#4A5B64] hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="flex-1">{item.label}</span>
                                    {active && (
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#10202A]">
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
                <h3 id="faq-title" className="text-lg font-semibold text-[#10202A]">
                    {group.label}
                </h3>
                <ul className="mt-4">
                    {group.items.map((item, index) => {
                        const open = openIndex === index;
                        const panelId = `faq-panel-${group.id}-${index}`;
                        return (
                            <li key={item.q} className="border-b border-[#E3E8EB]">
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(open ? null : index)}
                                    aria-expanded={open}
                                    aria-controls={panelId}
                                    className="flex w-full items-center gap-4 py-4 text-left text-base text-[#10202A]"
                                >
                                    {open ? (
                                        <Minus className="h-4 w-4 shrink-0 text-[#C2531C]" />
                                    ) : (
                                        <Plus className="h-4 w-4 shrink-0 text-[#C2531C]" />
                                    )}
                                    {item.q}
                                </button>
                                {open && (
                                    <p id={panelId} className="pb-5 pl-8 text-sm leading-relaxed text-[#4A5B64]">
                                        {item.a}
                                    </p>
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
            <p id={`${name}-label`} className="mt-7 text-base font-medium text-[#10202A]">
                Rating <span className="text-[#C2531C]">*</span>
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
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!done) return;
        const timer = setTimeout(() => setDone(false), 3000);
        return () => clearTimeout(timer);
    }, [done]);

    const handleSubmit = (_values: FeedbackValues, { resetForm }: FormikHelpers<FeedbackValues>) => {
        // Dummy only: no request is sent
        resetForm();
        setDone(true);
    };

    return (
        <Formik<FeedbackValues> initialValues={EMPTY_FEEDBACK} validationSchema={feedbackSchema} onSubmit={handleSubmit}>
            <Form noValidate>
                <p className="text-sm text-[#5D6F78] sm:text-base">How would you rate your experience with QApp today?</p>

                <RatingField name="rating" />

                <TextAreaField
                    name="remark"
                    id="feedback-remark"
                    label="Remark"
                    variant="dashboard"
                    placeholder="Enter Remark"
                    rows={4}
                    className="mt-7"
                />

                <div className="mt-4 flex items-center justify-end gap-4">
                    {done && (
                        <p className="text-sm text-[#2E9A4F]" aria-live="polite">
                            Thanks for your feedback.
                        </p>
                    )}
                    <SubmitButton variant="primary">Submit</SubmitButton>
                </div>
            </Form>
        </Formik>
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function SupportPage() {
    const [tab, setTab] = useState<SupportTab>('help');

    return (
        <div className="min-h-full bg-[#F3F4F5] text-[#10202A]">
            {/* ── Page header ── */}
            <section className="border-b border-[#E3E8EB] px-5 py-7 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C2531C]">Support</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#10202A] sm:text-3xl">
                    Real help, right <span className="text-[#C2531C]">when you need it.</span>
                </h2>
                <p className="mt-2 text-sm text-[#4A5B64] sm:text-base">Keep your information current and choose how Hatiso protects you.</p>
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
                                    ? 'border-[#10202A] bg-[#10202A] font-medium text-white'
                                    : 'border-[#E3E8EB] bg-white text-[#10202A] hover:bg-slate-50'
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
                    {tab === 'help' && <HelpCenter />}
                    {tab === 'faqs' && <Faqs />}
                    {tab === 'feedback' && <Feedback />}
                </section>
            </main>
        </div>
    );
}