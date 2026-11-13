"use client";

import React from "react";
import Link from "next/link";
import { LpIcon, SectionPill } from "@/components/landing/LandingKit";
import { useDigitalServiceCategories } from "@/lib/queries/useDigitalServices";
import {
  servicesForCategory,
  type ServiceCategoryMeta,
} from "@/lib/marketing/serviceCategories";
import type { PayBillService } from "./HeroSection";

const cardClass =
  "lp-reveal flex min-h-[150px] flex-col justify-between gap-[34px] rounded-[26px] border border-[#E3E8EB] bg-white p-[22px] text-left text-[#10202A] transition hover:-translate-y-0.5 hover:border-[#C9D0D4] hover:shadow-[0_12px_30px_-18px_rgba(16,32,42,0.35)]";

function CardBody({ c }: { c: ServiceCategoryMeta }) {
  return (
    <>
      <span className="flex items-start justify-between">
        <span
          className={`flex h-[50px] w-[50px] items-center justify-center rounded-full ${c.pay ? "bg-[#EE6E2D] text-[#14252E]" : "bg-[#F3F4F5] text-[#10202A]"}`}
        >
          <LpIcon name={c.icon} strokeWidth={1.7} />
        </span>
        <span
          className={`text-xs font-bold ${c.pay ? "text-[#C2531C]" : "text-[#5D6F78]"}`}
        >
          {c.pay ? "Pay here" : "Explore"}
        </span>
      </span>
      <span className="text-lg font-bold tracking-[-0.3px]">{c.label}</span>
    </>
  );
}

/**
 * "Popular categories", built from GET /digital-services/categories.
 * Categories the home payment card handles open it; the rest link to their category page.
 */
export default function PopularCategories({
  onPay,
}: {
  onPay: (service: PayBillService) => void;
}) {
  const { data, isLoading, isError, refetch } = useDigitalServiceCategories();
  const categories = (data ?? []).flatMap(servicesForCategory);

  return (
    <>
      <section aria-labelledby="cats" className="bg-[#F3F4F5] text-[#10202A]">
        <div className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 sm:py-24">
          <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionPill>Digital services</SectionPill>
              <h2
                id="cats"
                className="m-0 mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-1.4px] sm:text-[44px]"
              >
                Popular <span className="text-[#E2591A]">categories</span>
              </h2>
            </div>
            <p className="m-0 max-w-[360px] text-base leading-[1.6] text-[#4A5B64]">
              Tap Airtime, Data, Electricity or TV and the payment card above
              opens it, ready to pay.
            </p>
          </div>
          {isError ? (
            <div className="rounded-[26px] border border-dashed border-[#C9D0D4] bg-white px-6 py-12 text-center text-base text-[#4A5B64]">
              We couldn&apos;t load the categories.
              <button
                type="button"
                onClick={() => refetch()}
                className="ml-2 font-bold text-[#C2531C] hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div
              aria-busy={isLoading}
              className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]"
            >
              {isLoading &&
                Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="min-h-[150px] animate-pulse rounded-[26px] border border-[#E3E8EB] bg-white p-[22px]"
                  >
                    <div className="h-[50px] w-[50px] rounded-full bg-[#EEF1F3]" />
                    <div className="mt-[34px] h-5 w-24 rounded-full bg-[#EEF1F3]" />
                  </div>
                ))}
              {categories.map((c) =>
                c.pay ? (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => onPay(c.pay!)}
                    className={cardClass}
                  >
                    <CardBody c={c} />
                  </button>
                ) : (
                  <Link
                    key={c.slug}
                    href={`/categories/${c.slug}`}
                    className={cardClass}
                  >
                    <CardBody c={c} />
                  </Link>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <div
          aria-hidden="true"
          className="overflow-hidden bg-[#10202A] py-[22px] text-white"
        >
          <div className="lp-marquee flex w-max whitespace-nowrap text-[22px] font-semibold tracking-[-0.3px]">
            {[0, 1].map((copy) => (
              <span key={copy} className="pr-10">
                {categories.map((c) => (
                  <React.Fragment key={c.slug}>
                    {c.label}
                    <span className="px-[1.1em] text-[#EE6E2D]">•</span>
                  </React.Fragment>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
