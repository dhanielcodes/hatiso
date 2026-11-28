import React from 'react';

export type ChartTooltipRow = {
  label: string;
  value: string;
  /** Swatch colour (any CSS colour). Leave out for no swatch. */
  color?: string;
  /** Show the swatch as a dashed line (e.g. "Previous period"). */
  dashed?: boolean;
};

/**
 * The tooltip shared by the dashboard charts: a small card with a title and one row per series. Place it inside a
 * `relative` container; `x` and `y` are where it points, in px or % of that container. It sits above the point (or
 * below it with `placement="below"`, e.g. near the top of a scrolling box that would clip it) and shifts to stay
 * inside the chart near the left or right edge (`edge`). It's for pointer users: give the chart
 * itself an accessible label too.
 */
export default function ChartTooltip({
  x,
  y,
  title,
  rows,
  edge = 'center',
  placement = 'above',
  visible = true,
}: {
  x: number | string;
  y: number | string;
  title: string;
  rows: ChartTooltipRow[];
  edge?: 'start' | 'center' | 'end';
  placement?: 'above' | 'below';
  visible?: boolean;
}) {
  const shift = edge === 'start' ? '-translate-x-3' : edge === 'end' ? '-translate-x-[calc(100%-12px)]' : '-translate-x-1/2';
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 ${placement === 'below' ? 'translate-y-3' : '-translate-y-[calc(100%+12px)]'} ${shift} min-w-[148px] whitespace-nowrap rounded-[10px] border border-tone-100 bg-surface px-3 py-2.5 text-tone-744 shadow-[0_14px_34px_-16px_rgba(18,21,26,0.45)] transition-opacity duration-150 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ left: typeof x === 'number' ? `${x}px` : x, top: typeof y === 'number' ? `${y}px` : y }}
    >
      <p className="text-xs text-tone-414">{title}</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2 text-[13px]">
            {row.color &&
              (row.dashed ? (
                <span className="w-3 shrink-0 border-t-2 border-dashed" style={{ borderColor: row.color }} />
              ) : (
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: row.color }} />
              ))}
            <span className="flex-1 text-tone-414">{row.label}</span>
            <span className="font-semibold tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Which way a tooltip should lean for item `index` of `count` across the chart. */
export function tooltipEdge(index: number, count: number): 'start' | 'center' | 'end' {
  if (count <= 2) return index === 0 ? 'start' : 'end';
  const at = index / (count - 1);
  return at < 0.15 ? 'start' : at > 0.85 ? 'end' : 'center';
}
