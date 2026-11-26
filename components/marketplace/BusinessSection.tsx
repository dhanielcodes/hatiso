import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

const POINTS = [
  { label: 'Reach', detail: 'Customers who are ready to pay' },
  { label: 'Track', detail: 'Every payment in one dashboard' },
  { label: 'Support', detail: 'Onboarding help from our team' },
];

/** "For business": photo with a payment chip, and the pitch for merchants (Main board). */
export default function BusinessSection() {
  return (
    <section id="business" className="bg-cloud text-carbon">
      <div className="mx-auto flex max-w-[1280px] flex-wrap-reverse items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,56px)] py-[clamp(72px,9vw,128px)]">
        <div className="hz-reveal relative min-w-0 flex-[1_1_420px]">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-grey-100">
            <Image
              src="/images/smiling_professional.webp"
              alt="A business owner smiling in her office"
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover object-[70%_30%]"
            />
          </div>
          <div className="hz-float absolute right-[clamp(8px,2vw,24px)] -bottom-7 flex items-center gap-3 rounded-[10px] bg-carbon py-3.5 pr-[18px] pl-3.5 text-cloud shadow-[0_24px_48px_-20px_rgba(18,21,26,0.5)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cloud text-carbon">
              <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">New payment received</span>
              <span className="text-xs text-grey-400">₦15,000 · just now</span>
            </span>
          </div>
        </div>

        <div className="hz-reveal flex min-w-0 flex-[1_1_420px] flex-col gap-6">
          <p className="hz-eyebrow text-grey-600">For business</p>
          <h2 className="text-[clamp(32px,4vw,52px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
            Sell where people already pay.
          </h2>
          <p className="max-w-[480px] text-[17px] leading-relaxed text-grey-600">
            List your services on Hatiso and reach customers who are already paying for bills, airtime and more. We help you get set up.
          </p>
          <ul className="flex flex-col border-t border-grey-150">
            {POINTS.map((point) => (
              <li key={point.label} className="flex justify-between gap-4 border-b border-grey-150 py-4 text-[15px]">
                <span className="font-semibold">{point.label}</span>
                <span className="text-right text-grey-600">{point.detail}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/contact"
            className="hz-press inline-flex min-h-13 items-center gap-2.5 self-start rounded-[10px] bg-carbon px-6.5 text-[15px] font-medium text-cloud hover:bg-graphite"
          >
            Talk to our team
            <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
