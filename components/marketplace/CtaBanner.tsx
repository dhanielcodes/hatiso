"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CtaBannerProps {
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

export default function CtaBanner({
  secondaryButtonText = "Pay a bill",
  secondaryButtonHref = "/#popular-categories",
}: CtaBannerProps) {
  return (
    <section className="bg-carbon text-cloud">
      <div className="mx-auto max-w-[1280px] px-[clamp(16px,4vw,56px)] pt-[clamp(64px,8vw,112px)]">
        <div className="hz-reveal flex flex-wrap items-end justify-between gap-8 rounded-2xl bg-graphite p-[clamp(36px,6vw,80px)]">
          <div className="flex max-w-[620px] flex-col gap-4">
            <h2 className="text-[clamp(34px,4.5vw,60px)] leading-[1.04] font-semibold tracking-[-0.03em]">
              Ready when <span className="text-highlight">you are.</span>
            </h2>
            <p className="text-[17px] leading-relaxed text-silver">
              Create a free account in minutes, or pay as a guest right now.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/register"
              className="hz-press inline-flex min-h-13 items-center gap-2.5 rounded-xl bg-cloud px-6.5 text-[15px] font-medium text-carbon hover:bg-white"
            >
              Create a free account
              <ArrowRight className="hz-arrow h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={secondaryButtonHref}
              className="hz-press inline-flex min-h-13 items-center rounded-xl border border-grey-700 px-6.5 text-[15px] font-medium hover:border-grey-400"
            >
              {secondaryButtonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
