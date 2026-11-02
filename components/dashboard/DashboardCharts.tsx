'use client';

import { useEffect, useRef } from 'react';
import {
  ArcElement,
  CategoryScale,
  Chart,
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
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PieController,
  PointElement,
  Tooltip
);

type SpendingDatum = { month: string; amount: number };
type UsageDatum = { name: string; value: number; color: string };

export function SpendingChart({ data }: { data: SpendingDatum[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map((item) => item.month),
        datasets: [
          {
            data: data.map((item) => item.amount),
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
              label: (item: TooltipItem<'line'>) => `₦${Math.round(Number(item.raw) * 42300).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#7F8085', font: { size: 12 }, padding: 12 } },
          y: {
            min: 0,
            max: 4,
            ticks: { stepSize: 1, color: '#7F8085', font: { size: 12 }, callback: (value: string | number) => (value === 0 ? '0' : `${value}m`) },
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

export function ServiceUsageChart({ data }: { data: UsageDatum[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: data.map((item) => item.name),
        datasets: [{ data: data.map((item) => item.value), backgroundColor: data.map((item) => item.color), borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (item: TooltipItem<'pie'>) => `${item.label}: ${item.raw}%` } },
        },
      },
    });

    return () => chart.destroy();
  }, [data]);

  return <canvas ref={canvasRef} aria-label="Digital services usage chart" role="img" />;
}
