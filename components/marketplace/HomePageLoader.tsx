'use client';

import { useEffect, useState } from 'react';
import { useMarketplacePageConfiguration } from '@/lib/queries/useMarketplace';

/** The loader stays at least this long, so a fast answer doesn't flash it, in ms. */
const MIN_SHOW_MS = 700;
/** Matches the exit in globals.css (content fades, then the panel lifts away), in ms. */
const EXIT_MS = 950;

type Phase = 'loading' | 'leaving' | 'gone';

/**
 * Full-page loader for the home page. It covers the page until GET /api/public/marketplace/page-configuration
 * answers, so visitors never see sections appear or disappear. The wordmark has a light sweeping across it. When
 * it's done, the content fades up and the panel lifts away like a curtain. While it shows, the page's own entrance animations are paused (globals.css), so the hero animates in as
 * the curtain lifts. A failed load also ends it (the page then shows every section).
 */
export default function HomePageLoader() {
  const { isPending } = useMarketplacePageConfiguration();
  const [minElapsed, setMinElapsed] = useState(false);
  const [gone, setGone] = useState(false);
  const phase: Phase = gone ? 'gone' : isPending || !minElapsed ? 'loading' : 'leaving';

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), MIN_SHOW_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const timer = setTimeout(() => setGone(true), EXIT_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  // Stop the page scrolling behind the loader.
  useEffect(() => {
    if (phase === 'gone') return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={phase === 'loading'}
      data-hz-loader={phase}
      className="hz-loader fixed inset-0 z-[100] flex items-center justify-center bg-carbon bg-[radial-gradient(55%_45%_at_50%_48%,var(--color-graphite),var(--color-carbon))] text-cloud"
    >
      <div className="hz-loader__content flex flex-col items-center">
        {/* The wordmark as a mask, so the sweep only lights the letters. */}
        <span aria-hidden="true" className="hz-loader__logo block h-9 w-[127px]" />
        <span className="sr-only">Loading the page…</span>
      </div>
    </div>
  );
}
