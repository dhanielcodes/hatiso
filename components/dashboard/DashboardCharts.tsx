'use client';

import { useEffect, useRef } from 'react';
import {
  ArcElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Tooltip,
  type Plugin,
  type TooltipItem,
  type TooltipModel,
} from 'chart.js';
import { themeColor, useTheme, withAlpha, type ThemeId } from '@/lib/theme/theme';

Chart.register(
  ArcElement,
  CategoryScale,
  DoughnutController,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Tooltip
);

// Canvas can't read CSS variables. Classic and Hatiso have hand-picked colours; the hue themes
// (Ocean, Forest, Plum) take the line from their accent token; Dark keeps the orange line on dark gridlines.
type SpendingColors = { line: string; fill: [string, string]; tooltipBody: string; tooltipTitle: string; tick: string; grid: string };
const CLASSIC_SPENDING: SpendingColors = { line: '#F45A08', fill: ['rgba(255, 142, 80, 0.52)', 'rgba(255, 142, 80, 0.02)'], tooltipBody: '#162C3B', tooltipTitle: '#69707B', tick: '#7F8085', grid: '#F5F2F0' };
const HATISO_SPENDING: SpendingColors = { line: '#12151A', fill: ['rgba(35, 39, 47, 0.28)', 'rgba(35, 39, 47, 0.02)'], tooltipBody: '#12151A', tooltipTitle: '#616366', tick: '#79797A', grid: '#F1F2F4' };

function spendingColors(theme: ThemeId): SpendingColors {
  if (theme === 'classic') return CLASSIC_SPENDING;
  if (theme === 'hatiso') return HATISO_SPENDING;
  if (theme === 'dark') return { ...CLASSIC_SPENDING, tick: themeColor('tone-405', CLASSIC_SPENDING.tick), grid: themeColor('tone-78', CLASSIC_SPENDING.grid) };
  const line = themeColor('brand-333', CLASSIC_SPENDING.line);
  const fill = themeColor('brand-249', '#FF8A4C');
  return { ...CLASSIC_SPENDING, line, fill: [withAlpha(fill, 0.52), withAlpha(fill, 0.02)], tooltipBody: themeColor('ink-709', CLASSIC_SPENDING.tooltipBody) };
}

/** `title` is the tooltip heading (e.g. "Tuesday, Mar 21, 2026"); defaults to the axis label. */
type SpendingDatum = { label: string; amountMinor: number; title?: string };
type UsageDatum = { name: string; value: number; color: string };

const nairaFormat = (value: number) => `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 2 })}`;
// "4m", "250k": the overview axis drops the currency sign and uses lower-case units.
const compactAxis = (value: number) =>
  value.toLocaleString('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).toLowerCase();

/**
 * Card-style tooltip for the dashboard overview: the date on top and a pill with
 * "₦ spending ₦100,251". Drawn as HTML next to the canvas (Chart.js "external" tooltip).
 */
function overviewTooltip(context: { chart: Chart; tooltip: TooltipModel<'line'> }, data: SpendingDatum[]) {
  const { chart, tooltip } = context;
  const host = chart.canvas.parentElement;
  if (!host) return;
  let el = host.querySelector<HTMLDivElement>('[data-chart-tooltip]');
  if (!el) {
    el = document.createElement('div');
    el.dataset.chartTooltip = '';
    el.setAttribute('role', 'presentation');
    el.className =
      'pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-xl bg-surface px-3 pb-3 pt-2.5 text-center shadow-[0_10px_30px_rgba(16,42,54,0.12)] transition-opacity duration-150';
    el.innerHTML =
      '<p data-title class="text-[11px] text-tone-405"></p>' +
      '<p class="mt-2 flex items-center gap-2 rounded-lg bg-tone-35 px-2.5 py-1.5 text-[11px] text-tone-432">' +
      '<span class="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-brand-333 text-[9px] font-semibold text-on-brand">₦</span>' +
      'spending <span data-value class="text-[13px] font-semibold text-tone-744"></span></p>';
    host.appendChild(el);
  }
  if (tooltip.opacity === 0 || !tooltip.dataPoints?.length) {
    el.style.opacity = '0';
    return;
  }
  const point = tooltip.dataPoints[0];
  const datum = data[point.dataIndex];
  el.querySelector('[data-title]')!.textContent = datum?.title ?? datum?.label ?? '';
  el.querySelector('[data-value]')!.textContent = nairaFormat(Number(point.raw));
  el.style.opacity = '1';
  el.style.left = `${tooltip.caretX}px`;
  el.style.top = `${tooltip.caretY}px`;
}

export function SpendingChart({ data, variant = 'default' }: { data: SpendingDatum[]; variant?: 'default' | 'overview' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors = spendingColors(theme);
    const overview = variant === 'overview';

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map((item) => item.label),
        datasets: [
          {
            data: data.map((item) => item.amountMinor / 100),
            borderColor: colors.line,
            borderWidth: 3,
            backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; height: number } }) => {
              const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, context.chart.height);
              gradient.addColorStop(0, colors.fill[0]);
              gradient.addColorStop(1, colors.fill[1]);
              return gradient;
            },
            fill: true,
            tension: 0.42,
            pointRadius: 0,
            pointHoverRadius: overview ? 6 : 5,
            pointHoverBackgroundColor: colors.line,
            pointHoverBorderColor: overview ? withAlpha(colors.line, 0.25) : undefined,
            pointHoverBorderWidth: overview ? 6 : undefined,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: overview
            ? { enabled: false, external: (context) => overviewTooltip(context, data) }
            : {
            displayColors: false,
            backgroundColor: '#FFFFFF',
            bodyColor: colors.tooltipBody,
            titleColor: colors.tooltipTitle,
            padding: 12,
            titleFont: { size: 11, weight: 'normal' },
            bodyFont: { size: 14, weight: 'bold' },
            callbacks: {
              title: (items: Array<{ label: string }>) => `${items[0].label} spending`,
              label: (item: TooltipItem<'line'>) => nairaFormat(Number(item.raw)),
            },
          },
        },
        scales: overview
          ? {
              // Design: light vertical gridlines, no horizontal ones, a thin frame on the left and bottom.
              x: { grid: { color: colors.grid, drawTicks: false }, border: { color: colors.fill[0] }, ticks: { color: colors.tick, font: { size: 12 }, padding: 14 } },
              y: {
                beginAtZero: true,
                ticks: { color: colors.tick, font: { size: 13 }, padding: 12, maxTicksLimit: 5, callback: (value: string | number) => compactAxis(Number(value)) },
                grid: { display: false },
                border: { color: colors.fill[0] },
              },
            }
          : {
              x: { grid: { display: false }, border: { display: false }, ticks: { color: colors.tick, font: { size: 12 }, padding: 12 } },
              y: {
                beginAtZero: true,
                ticks: { color: colors.tick, font: { size: 12 }, callback: (value: string | number) => `₦${Number(value).toLocaleString('en-NG', { notation: 'compact', maximumFractionDigits: 1 })}` },
                grid: { color: colors.grid, drawTicks: false },
                border: { display: false },
              },
            },
      },
    });

    return () => {
      chart.destroy();
      canvas.parentElement?.querySelector('[data-chart-tooltip]')?.remove();
    };
  }, [data, theme, variant]);

  return <canvas ref={canvasRef} aria-label="Monthly spending chart" role="img" />;
}

/**
 * Share of transactions per digital service.
 * `donut` draws a ring with rounded, slightly separated segments (analytics design);
 * otherwise a plain pie.
 */
/**
 * Pie callouts (dashboard design): each slice gets a leader line out to its name and "(51%)".
 * Labels go left or right of the pie depending on which side the slice is on.
 */
function calloutPlugin(color: string, lineColor: string): Plugin<'pie' | 'doughnut'> {
  return {
    id: 'callouts',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const labels = (chart.data.labels ?? []) as string[];
      const values = chart.data.datasets[0].data as number[];
      ctx.save();
      ctx.font = '400 13px var(--font-outfit), system-ui, sans-serif';
      meta.data.forEach((element, index) => {
        if (!values[index]) return;
        const arc = element as unknown as { x: number; y: number; startAngle: number; endAngle: number; outerRadius: number };
        const mid = (arc.startAngle + arc.endAngle) / 2;
        const right = Math.cos(mid) >= 0;
        const edge = { x: arc.x + Math.cos(mid) * arc.outerRadius, y: arc.y + Math.sin(mid) * arc.outerRadius };
        const elbow = { x: arc.x + Math.cos(mid) * (arc.outerRadius + 14), y: arc.y + Math.sin(mid) * (arc.outerRadius + 14) };
        const end = { x: elbow.x + (right ? 22 : -22), y: elbow.y };
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(edge.x, edge.y);
        ctx.lineTo(elbow.x, elbow.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.textAlign = right ? 'left' : 'right';
        const textX = end.x + (right ? 4 : -4);
        ctx.fillText(labels[index], textX, end.y - 4);
        ctx.fillText(`(${Math.round(values[index])}%)`, textX + (right ? 0 : 0), end.y + 13);
      });
      ctx.restore();
    },
  };
}

export function ServiceUsageChart({ data, donut = false, callouts = false }: { data: UsageDatum[]; donut?: boolean; callouts?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tooltip = { callbacks: { label: (item: TooltipItem<'pie' | 'doughnut'>) => `${item.label}: ${item.raw}%` } };
    const labels = data.map((item) => item.name);
    const values = data.map((item) => item.value);
    const colors = data.map((item) => item.color);

    const chart = donut
      ? new Chart(canvas, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, borderRadius: 8, spacing: 3 }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '52%',
            plugins: { legend: { display: false }, tooltip },
          },
        })
      : new Chart(canvas, {
          type: 'pie',
          data: {
            labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            // Room around the pie for the callout labels.
            layout: callouts ? { padding: { top: 34, bottom: 34, left: 92, right: 92 } } : undefined,
            plugins: { legend: { display: false }, tooltip },
          },
          plugins: callouts ? [calloutPlugin(themeColor('tone-405', '#7A7F8A'), themeColor('tone-114', '#DED8D4'))] : [],
        });

    return () => chart.destroy();
  }, [data, donut, callouts, theme]);

  return <canvas ref={canvasRef} aria-label="Digital services usage chart" role="img" />;
}
