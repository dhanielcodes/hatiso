'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

/* Dates travel as "YYYY-MM-DD" strings so there's no timezone drift. */
function iso(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parse(value: string) {
    return new Date(`${value}T00:00:00`);
}
function addDays(value: string, days: number) {
    const d = parse(value);
    d.setDate(d.getDate() + days);
    return iso(d);
}
const LONG = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
const DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });
const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

type Preset = '7d' | '30d' | 'month' | 'week' | 'custom';

/** DateRange board: presets on the left, a one-month calendar on the right, summary and Apply below. */
export default function DateRangeDialog({
    today,
    initialFrom,
    initialTo,
    onApply,
    onCancel,
}: {
    /** Today as YYYY-MM-DD; later days can't be picked. */
    today: string;
    initialFrom?: string;
    initialTo?: string;
    onApply: (from: string, to: string) => void;
    onCancel: () => void;
}) {
    const [from, setFrom] = useState(initialFrom || addDays(today, -6));
    const [to, setTo] = useState<string | null>(initialTo || today);
    const [preset, setPreset] = useState<Preset>('custom');
    const [view, setView] = useState(() => {
        const d = parse(initialTo || today);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onCancel]);

    const presets: [Preset, string, () => [string, string] | null][] = [
        ['7d', 'Last 7 days', () => [addDays(today, -6), today]],
        ['30d', 'Last 30 days', () => [addDays(today, -29), today]],
        ['month', 'This month', () => [iso(new Date(parse(today).getFullYear(), parse(today).getMonth(), 1)), today]],
        [
            'week',
            'This week',
            () => {
                const t = parse(today);
                const monday = addDays(today, -((t.getDay() + 6) % 7));
                return [monday, today];
            },
        ],
        ['custom', 'Custom', () => null],
    ];

    const pickPreset = (id: Preset, range: [string, string] | null) => {
        setPreset(id);
        if (!range) return;
        setFrom(range[0]);
        setTo(range[1]);
        const d = parse(range[1]);
        setView(new Date(d.getFullYear(), d.getMonth(), 1));
    };

    const pickDay = (day: string) => {
        setPreset('custom');
        if (!to || day < from) {
            setFrom(day);
            setTo(null);
        } else {
            setTo(day);
        }
    };

    // Monday-first grid for the month on view.
    const days = useMemo(() => {
        const lead = (view.getDay() + 6) % 7;
        const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
        const cells: (string | null)[] = Array.from({ length: lead }, () => null);
        for (let n = 1; n <= count; n++) cells.push(iso(new Date(view.getFullYear(), view.getMonth(), n)));
        while (cells.length % 7) cells.push(null);
        return cells;
    }, [view]);

    const nextMonth = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    const canGoNext = iso(nextMonth) <= today;

    const span = to ? Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000) + 1 : 0;
    const summary = !to
        ? 'Pick an end date'
        : from === to
            ? `${LONG.format(parse(from))} · 1 day`
            : `${(parse(from).getFullYear() === parse(to).getFullYear() ? DAY_MONTH : LONG).format(parse(from))} to ${LONG.format(parse(to))} · ${span} days`;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-carbon/60 px-4 py-10" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
            <div role="dialog" aria-modal="true" aria-labelledby="dr-title" className="hz-pop w-full max-w-[640px] overflow-hidden rounded-[14px] bg-surface text-tone-744 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between border-b border-tone-44 px-[22px] py-[18px]">
                    <h2 id="dr-title" className="text-lg font-semibold">Choose dates</h2>
                    <button type="button" onClick={onCancel} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg bg-tone-44 hover:bg-tone-100">
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex flex-wrap">
                    <div className="flex flex-[1_1_170px] flex-col gap-1 border-r border-tone-44 p-3.5">
                        {presets.map(([id, label, range]) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => pickPreset(id, range())}
                                aria-pressed={preset === id}
                                className={`min-h-10 rounded-lg px-3 text-left text-sm font-medium transition-colors ${preset === id ? 'bg-brand-305 text-on-brand' : 'text-tone-744 hover:bg-tone-44'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-[999_1_340px] flex-col gap-3.5 px-[22px] py-[18px]">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                aria-label="Previous month"
                                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-tone-100 bg-surface hover:border-tone-414"
                            >
                                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <span className="text-[15px] font-semibold">{MONTH.format(view)}</span>
                            <button
                                type="button"
                                aria-label="Next month"
                                disabled={!canGoNext}
                                onClick={() => setView(nextMonth)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-tone-100 bg-surface hover:border-tone-414 disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-y-0.5 text-center">
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                                <span key={d} className="py-1.5 text-xs text-tone-414">{d}</span>
                            ))}
                            {days.map((day, i) => {
                                if (!day) return <span key={`blank-${i}`} />;
                                const edge = day === from || day === to;
                                const inside = Boolean(to) && day > from && day < (to as string);
                                const band = inside || (edge && to && from !== to);
                                const radius = edge && to && from !== to ? (day === from ? 'rounded-l-lg' : 'rounded-r-lg') : '';
                                const future = day > today;
                                return (
                                    <span key={day} className={`flex justify-center ${band ? 'bg-tone-44' : ''} ${radius}`}>
                                        <button
                                            type="button"
                                            onClick={() => pickDay(day)}
                                            disabled={future}
                                            aria-pressed={edge}
                                            aria-label={LONG.format(parse(day))}
                                            className={`h-10 w-10 rounded-lg text-sm transition-colors disabled:opacity-30 ${edge ? 'bg-brand-305 font-semibold text-on-brand' : 'hover:bg-tone-100'} ${day === today && !edge ? 'underline underline-offset-4' : ''}`}
                                        >
                                            {parse(day).getDate()}
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-tone-44 px-[22px] py-4">
                    <span className="text-sm text-tone-414" aria-live="polite">{summary}</span>
                    <span className="flex gap-2.5">
                        <button type="button" onClick={onCancel} className="hz-press inline-flex min-h-11 items-center rounded-[10px] border border-tone-100 bg-surface px-[18px] text-sm font-medium hover:border-tone-414">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => to && onApply(from, to)}
                            disabled={!to}
                            className="hz-press inline-flex min-h-11 items-center rounded-[10px] bg-brand-305 px-[18px] text-sm font-medium text-on-brand hover:bg-brand-361 disabled:opacity-50"
                        >
                            Apply
                        </button>
                    </span>
                </div>
            </div>
        </div>
    );
}
