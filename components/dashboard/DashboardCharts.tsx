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

type SpendingDatum = { label: string; amountMinor: number };
type UsageDatum = { name: string; value: number; color: string };

export function SpendingChart({ data }: { data: SpendingDatum[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map((item) => item.label),
        datasets: [
          {
            data: data.map((item) => item.amountMinor / 100),
            borderColor: '#F45A08',
            borderWidth: 3,
            backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; height: number } }) => {
              const gradient = context.chart.ctx.createLinearGradient(0, 0, 0, context.chart.height);
              gradient.addColorStop(0, 'rgba(255, 142, 80, 0.52)');
              gradient.addColorStop(1, 'rgba(255, 142, 80, 0.02)');
              return gradient;
            },
            fill: true,
            tension: 0.42,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#F45A08',
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
            bodyColor: '#162C3B',
            titleColor: '#69707B',
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
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#7F8085', font: { size: 12 }, padding: 12 } },
          y: {
            beginAtZero: true,
            ticks: { color: '#7F8085', font: { size: 12 }, callback: (value: string | number) => `₦${Number(value).toLocaleString('en-NG', { notation: 'compact', maximumFractionDigits: 1 })}` },
            grid: { color: '#F5F2F0', drawTicks: false },
            border: { display: false },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

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
