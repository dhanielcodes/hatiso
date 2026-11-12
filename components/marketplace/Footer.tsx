import React from 'react';
import Link from 'next/link';
import XnettLogo from '@/components/auth/XnettLogo';

const COLUMNS = [
  {
    title: 'Digital Services',
    links: [
      { label: 'Airtime', href: '/categories/airtime' },
      { label: 'Data', href: '/categories/data' },
      { label: 'Electricity', href: '/categories/electricity' },
      { label: 'Betting', href: '/categories/betting' },
      { label: 'TV', href: '/categories/tv' },
    ],
  },
  { title: 'Business', links: [{ label: 'Banks', href: '/banks' }] },
  { title: 'Company', links: [{ label: 'Contact Us', href: '/contact' }] },
];

const socialClass =
  'flex h-11 w-11 items-center justify-center rounded-full bg-[#1A2329] text-white transition hover:bg-[#EE6E2D] hover:text-[#14252E]';

/** Landing footer from the web redesign, with the oversized faded "Hatiso." wordmark. */
export default function Footer() {
  return (
    <footer className="overflow-hidden bg-[#0A1014] font-jakarta text-white">
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-12 px-4 pb-8 pt-[72px] sm:px-6">
        <div className="min-w-0 flex-[1_1_300px]">
          <XnettLogo href="/" className="[&_svg]:h-10 [&_svg]:w-auto" />
          <p className="mt-[18px] max-w-[280px] text-base leading-[1.6] text-[#9AA8B0]">
            Hatiso. Services, banking, and business. All in one place.
          </p>
          <div className="mt-[22px] flex gap-2">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={`${socialClass} text-sm font-bold`}>
              in
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={`${socialClass} text-[15px] font-bold`}>
              f
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialClass}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={socialClass}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="2.5" y="5.5" width="19" height="13" rx="3" />
                <path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-[72px] gap-y-8 text-[15px]">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <span className="text-base font-bold">{col.title}</span>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href} className="text-[#9AA8B0] transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mx-auto max-w-[1280px] overflow-hidden whitespace-nowrap px-4 text-[clamp(88px,16vw,210px)] font-bold leading-[0.9] tracking-[-0.04em] text-[#131C21] sm:px-6"
      >
        Hatiso<span className="text-[#EE6E2D]">.</span>
      </div>

      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 border-t border-[#1E2A31] px-4 pb-8 pt-[22px] text-sm text-[#9AA8B0] sm:px-6">
        <span>© 2026 Xnett. All rights reserved.</span>
        <span className="flex gap-6">
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms of use
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy policy
          </Link>
        </span>
      </div>
    </footer>
  );
}
