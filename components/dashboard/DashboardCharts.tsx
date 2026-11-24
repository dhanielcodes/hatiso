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
  type TooltipItem,
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

type SpendingDatum = { label: string; amountMinor: number };
type UsageDatum = { name: string; value: number; color: string };

export function SpendingChart({ data }: { data: SpendingDatum[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors = spendingColors(theme);

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
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors.line,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { display: false },
          tooltip: {
            displayColors: false,
            backgroundColor: '#FFFFFF',
            bodyColor: colors.tooltipBody,
            titleColor: colors.tooltipTitle,
            padding: 12,
            titleFont: { size: 11, weight: 'normal' },
            bodyFont: { size: 14, weight: 'bold' },
            callbacks: {
              title: (items: Array<{ label: string }>) => `${items[0].label} spending`,
              label: (item: TooltipItem<'line'>) => `₦${Number(item.raw).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
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

    return () => chart.destroy();
  }, [data, theme]);

  return <canvas ref={canvasRef} aria-label="Monthly spending chart" role="img" />;
}

/**
 * Share of transactions per digital service.
 * `donut` draws a ring with rounded, slightly separated segments (analytics design);
 * otherwise a plain pie.
 */
export function ServiceUsageChart({ data, donut = false }: { data: UsageDatum[]; donut?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
            plugins: { legend: { display: false }, tooltip },
          },
        });

    return () => chart.destroy();
  }, [data, donut]);

  return <canvas ref={canvasRef} aria-label="Digital services usage chart" role="img" />;
}
