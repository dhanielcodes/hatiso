"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import HatisoLogo from "@/components/brand/HatisoLogo";

/**
 * Left-hand brand panel shared by the sign-in, sign-up, verification and password screens (desktop only).
 * Carbon panel: logo, headline, a photo that cross-fades between two shots with a paid receipt card on top,
 * and a footer line. Stays in view while the form scrolls.
 */
const SLIDES = [
  {
    src: "/images/pink_blazer_phone.jpg",
    alt: "A woman managing her payments on her phone",
    position: "58% 30%",
  },
  {
    src: "/images/smiling_professional.webp",
    alt: "A smiling woman in a bright office",
    position: "72% 30%",
  },
];

const SLIDE_MS = 6000;

export default function AuthBrandPanel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <aside className="relative hidden flex-col gap-10 overflow-hidden bg-carbon px-12 py-10 text-cloud lg:sticky lg:top-0 lg:flex lg:h-screen">
      <HatisoLogo variant="cloud" height={28} />

      <div
        className="hz-rise flex max-w-[520px] flex-col gap-4"
        style={{ "--d": 1 } as React.CSSProperties}
      >
        <h2 className="text-[clamp(32px,3.2vw,44px)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance">
          Bills, banks and everyday payments.{" "}
          <span className="text-highlight">One app.</span>
        </h2>
        <p className="max-w-[470px] text-base leading-relaxed text-silver">
          Pay for the services you use, open your bank&apos;s own app and keep
          every receipt in one place.
        </p>
      </div>

      {/* Photo with a paid receipt card */}
      <div className="relative flex min-h-[280px] flex-1 items-end">
        <div className="hz-unveil absolute inset-x-0 top-0 bottom-12 overflow-hidden rounded-[14px] bg-graphite">
          {SLIDES.map((slide, i) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={i === active ? slide.alt : ""}
              aria-hidden={i !== active}
              fill
              priority={i === 0}
              sizes="(min-width: 1280px) 640px, 480px"
              style={{ objectPosition: slide.position }}
              className={`object-cover transition-opacity duration-1000 ease-out motion-reduce:transition-none ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
        <div className="hz-card relative ml-6 flex w-[280px] flex-col gap-3 rounded-xl bg-cloud p-4.5 text-carbon shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-grey-600">
              Electricity · Ikeja
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-carbon px-2.5 py-1 text-xs font-medium text-cloud">
              <span className="hz-ping h-1.5 w-1.5 rounded-full bg-silver text-silver" />
              Paid
            </span>
          </div>
          <div className="text-[28px] font-semibold tracking-[-0.02em]">
            ₦15,000<span className="text-base text-grey-500">.00</span>
          </div>
          <div className="text-[13px] text-grey-600">
            Token sent to your phone
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4 text-[13px] text-grey-500">
        <span>© 2026 Hatiso</span>
        <span className="inline-flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-grey-400" aria-hidden="true" />
          Bank-grade encryption
        </span>
      </div>
    </aside>
  );
}
