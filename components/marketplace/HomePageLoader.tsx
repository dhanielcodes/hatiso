'use client';

import { useEffect, useState } from 'react';
import HatisoLogo from '@/components/brand/HatisoLogo';
import { useMarketplacePageConfiguration } from '@/lib/queries/useMarketplace';

/** How long the loader takes to fade out, in ms. */
const FADE_MS = 300;

/**
 * Full-page loader for the home page. It covers the page until GET /api/public/marketplace/page-configuration
 * answers, so visitors never see sections appear or disappear as the configuration arrives. It then fades out.
 * A failed load also ends it (the page then shows every section).
 */
export default function HomePageLoader({ className = 'bg-ink-662 text-white' }: { className?: string }) {
  const { isPending } = useMarketplacePageConfiguration();
  const [gone, setGone] = useState(false);

  // Stop the page scrolling behind the loader.
  useEffect(() => {
    if (!isPending) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [isPending]);

  // Unmount once the fade has finished.
  useEffect(() => {
    if (isPending) return;
    const timer = setTimeout(() => setGone(true), FADE_MS);
    return () => clearTimeout(timer);
  }, [isPending]);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!isPending}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 transition-opacity ease-out motion-reduce:transition-none ${
        isPending ? 'opacity-100' : 'pointer-events-none opacity-0'
      } ${className}`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <HatisoLogo variant="cloud" height={34} href={null} priority />
      <span
        aria-hidden="true"
        className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70 motion-reduce:animate-none"
      />
      <span className="sr-only">Loading the page…</span>
    </div>
  );
}
