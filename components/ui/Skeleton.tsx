/**
 * Shared loading skeletons. Use these for every loading state instead of "Loading…" text,
 * so cards keep their shape while data loads. Each composed skeleton is wrapped in
 * `SkeletonGroup`, which announces the loading state to screen readers.
 */
import type React from 'react';

export type SkeletonTone = 'light' | 'dark';

const TONE: Record<SkeletonTone, { base: string; strong: string }> = {
  light: { base: 'bg-slate-100', strong: 'bg-slate-200' },
  dark: { base: 'bg-white/10', strong: 'bg-white/20' },
};

/* ─── Building blocks ──────────────────────────────────────────── */
export function Skeleton({
  className = '',
  tone = 'light',
  strong = false,
  style,
}: {
  className?: string;
  tone?: SkeletonTone;
  /** Slightly darker shade, for headline values */
  strong?: boolean;
  style?: React.CSSProperties;
}) {
  const shade = strong ? TONE[tone].strong : TONE[tone].base;
  return <div aria-hidden="true" style={style} className={['animate-pulse rounded-md', shade, className].join(' ')} />;
}

/** Wraps a skeleton so assistive tech hears one "Loading…" instead of nothing. */
export function SkeletonGroup({
  label = 'Loading…',
  className = '',
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Repeats a skeleton `count` times (grids of cards or tiles). */
export function SkeletonRepeat({ count, children }: { count: number; children: (index: number) => React.ReactNode }) {
  return <>{Array.from({ length: count }, (_, index) => children(index))}</>;
}

/* ─── Composed skeletons ───────────────────────────────────────── */

/** Stat / metric card: label, big value, change line. */
export function MetricCardSkeleton({ className = 'rounded-xl border border-[#E6E3E0] bg-white px-5 py-6' }: { className?: string }) {
  return (
    <SkeletonGroup className={className} label="Loading metric">
      <Skeleton className="h-4 w-28" />
      <Skeleton strong className="mt-4 h-8 w-32" />
      <Skeleton className="mt-3 h-4 w-40" />
    </SkeletonGroup>
  );
}

/** A few lines of text; the last one is shorter. */
export function TextSkeleton({ lines = 2, className = '' }: { lines?: number; className?: string }) {
  return (
    <SkeletonGroup className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </SkeletonGroup>
  );
}

const BAR_HEIGHTS = [45, 70, 55, 85, 40, 65, 90, 50, 75, 60, 80, 48];

/**
 * Chart placeholder that fills its container.
 * - `bars`: bar/line/area charts
 * - `donut`: pie/donut charts (pass a square container)
 * - `heatmap`: grid charts (e.g. activity by day/time)
 */
export function ChartSkeleton({
  shape = 'bars',
  className = 'h-full w-full',
  label = 'Loading chart',
}: {
  shape?: 'bars' | 'donut' | 'heatmap';
  className?: string;
  label?: string;
}) {
  if (shape === 'donut') {
    return (
      <SkeletonGroup className={`flex items-center justify-center ${className}`} label={label}>
        <div aria-hidden="true" className="aspect-square h-full max-h-full animate-pulse rounded-full border-[28px] border-slate-100" />
      </SkeletonGroup>
    );
  }

  if (shape === 'heatmap') {
    return (
      <SkeletonGroup className={`mx-auto grid max-w-[360px] grid-cols-5 gap-2 ${className}`} label={label}>
        {Array.from({ length: 35 }, (_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </SkeletonGroup>
    );
  }

  return (
    <SkeletonGroup className={`flex items-end gap-2 sm:gap-3 ${className}`} label={label}>
      {BAR_HEIGHTS.map((height, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md rounded-b-none" style={{ height: `${height}%` }} />
      ))}
    </SkeletonGroup>
  );
}

/** List rows: optional leading circle, two lines, optional trailing value. */
export function ListSkeleton({
  rows = 3,
  avatar = true,
  trailing = true,
  card = false,
  className = '',
  label = 'Loading list',
}: {
  rows?: number;
  avatar?: boolean;
  trailing?: boolean;
  /** Render each row as its own bordered card (e.g. notifications) */
  card?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <SkeletonGroup className={card ? `space-y-4 ${className}` : `divide-y divide-[#E8E5E2] ${className}`} label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 ${card ? 'rounded-xl border border-[#F4EFEB] bg-white px-6 py-5' : 'py-4'}`}
        >
          {avatar && <Skeleton className="h-12 w-12 shrink-0 rounded-full" />}
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton strong className="h-4 w-2/5" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
          {trailing && <Skeleton className="h-5 w-20 shrink-0" />}
        </div>
      ))}
    </SkeletonGroup>
  );
}

/** Label + value + progress bar rows (e.g. top providers). */
export function ProgressListSkeleton({ rows = 4, className = '' }: { rows?: number; className?: string }) {
  return (
    <SkeletonGroup className={`space-y-5 ${className}`} label="Loading list">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i}>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton strong className="h-4 w-20" />
          </div>
          <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
        </div>
      ))}
    </SkeletonGroup>
  );
}

/** Table body rows. Render inside <tbody>. */
export function TableRowsSkeleton({ rows = 8, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-[#EEF0F2]" aria-hidden="true">
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="px-6 py-4">
              <Skeleton className={`h-4 ${c === 0 ? 'w-28' : 'w-20'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Label + input pairs, optionally followed by a submit button. */
export function FormSkeleton({
  fields = 3,
  button = false,
  className = '',
  label = 'Loading form',
}: {
  fields?: number;
  button?: boolean;
  className?: string;
  label?: string;
}) {
  return (
    <SkeletonGroup className={`space-y-5 ${className}`} label={label}>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      ))}
      {button && <Skeleton strong className="h-12 w-full rounded-xl" />}
    </SkeletonGroup>
  );
}
