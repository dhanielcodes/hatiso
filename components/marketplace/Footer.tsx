import React from 'react';
import Link from 'next/link';
import HatisoLogo from '@/components/brand/HatisoLogo';

/** Main board footer. Privacy and Terms have no pages yet, so they stay as plain text. */
const COLUMNS = [
  {
    title: 'Services',
    links: [
      { label: 'Airtime', href: '/categories/airtime' },
      { label: 'Data', href: '/categories/data' },
      { label: 'Electricity', href: '/categories/electricity' },
      { label: 'Cable TV', href: '/categories/tv' },
    ],
  },
  {
    title: 'Banking',
    links: [
      { label: 'Partner banks', href: '/banks' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Security', href: '/banks' },
    ],
  },
  {
    title: 'Business',
    links: [
      { label: 'Sell on Hatiso', href: '/#business' },
      { label: 'Contact sales', href: '/contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#how-it-works' },
      { label: 'Contact', href: '/contact' },
      { label: 'Help centre', href: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-carbon text-silver">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-[clamp(16px,4vw,56px)] pt-[clamp(64px,8vw,96px)] pb-10">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="flex max-w-[300px] flex-col gap-4">
            <HatisoLogo variant="cloud" height={26} />
            <p className="text-[15px] leading-[1.6] text-grey-400">Services, banking and business. All in one place.</p>
          </div>
          <div className="grid flex-[0_1_640px] grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-10">
            {COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-3.5">
                <h3 className="text-[13px] font-medium tracking-[0.12em] text-grey-500 uppercase">{column.title}</h3>
                <ul className="flex flex-col gap-3.5 text-[15px] text-grey-150">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition-colors hover:text-cloud">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4 border-t border-grey-900 pt-7 text-sm text-grey-500">
          <span>© 2026 Hatiso. All rights reserved.</span>
          <span className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
