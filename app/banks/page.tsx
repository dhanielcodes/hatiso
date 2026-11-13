"use client";

import React, { useMemo, useRef, useState } from "react";
import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";
import CtaBanner from "@/components/marketplace/CtaBanner";
import {
  BentoTiles,
  DarkHero,
  FeatureRow,
  HeroHeadline,
  HeroLead,
  HeroPillInput,
  LandingPage,
  LpIcon,
  ProviderRow,
} from "@/components/landing/LandingKit";
import {
  ALL_SERVICES,
  ALL_STATUSES,
  BANKS_DATA,
  STATUS_DOT,
  STATUS_PILL,
  bankMono,
  countByStatus,
  type BankStatus,
} from "@/lib/marketing/banks";

const STATUS_COLORS: Record<BankStatus, string> = {
  Online: "#3FAE70",
  Degraded: "#E5A93A",
  Down: "#E0573F",
};

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border px-[18px] py-[11px] text-sm font-semibold transition-colors ${
        on ? "border-[#10202A] bg-[#10202A] text-white" : "border-[#DDE3E6] bg-white text-[#10202A] hover:border-[#B9C6CD]"
      }`}
    >
      {label}
    </button>
  );
}

export default function BanksPage() {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<BankStatus[]>([]);
  const countRef = useRef<HTMLHeadingElement>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BANKS_DATA.filter((bank) => {
      if (q && !bank.name.toLowerCase().includes(q)) return false;
      if (statuses.length && !statuses.includes(bank.status)) return false;
      return services.every((s) => bank.services.includes(s));
    });
  }, [query, services, statuses]);

  const filtered = !!(query.trim() || services.length || statuses.length);
  const featuring = BANKS_DATA.slice(0, 4).map((b) => b.name.replace(/\s+MFB$/i, ""));

  const showList = () => {
    countRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => countRef.current?.focus({ preventScroll: true }), 450);
  };

  const clear = () => {
    setQuery("");
    setServices([]);
    setStatuses([]);
  };

  return (
    <LandingPage>
      <main className="flex-1">
        <DarkHero>
          <Navbar />
          <section className="relative mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-14 px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
            <div className="min-w-0 flex-[1_1_560px]">
              <HeroHeadline
                lines={[{ text: "Every bank.", accent: true }, { text: "One place to" }, { text: "choose from." }]}
              />
              <HeroLead>
                Discover digital services from trusted providers, manage your banking. Browse banks and fintechs, then
                tap any one to visit its official website. Hatiso takes you straight to the bank&apos;s own domain.
              </HeroLead>
              <HeroPillInput
                icon="search"
                label="Search banks"
                action={`Show ${rows.length} bank${rows.length === 1 ? "" : "s"}`}
                onAction={showList}
                inputProps={{
                  id: "hq",
                  type: "search",
                  placeholder: "Type your bank's name",
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                }}
              />
              <ProviderRow label="Featuring" items={featuring} />
            </div>

            <div className="relative min-w-0 flex-[1_1_420px]">
              <div className="lp-phone relative z-[1] rounded-[32px] border border-[#2A3740] bg-[#10202A] p-[26px]">
                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-bold">Bank status right now</span>
                  <span className="lp-ping h-[9px] w-[9px] rounded-full bg-[#3FAE70]" />
                </div>
                <div className="mt-[18px] grid grid-cols-3 gap-2.5">
                  {ALL_STATUSES.map((status) => (
                    <div key={status} className="rounded-[22px] bg-[#1A2329] p-4 sm:p-[22px]">
                      <div className="text-[36px] font-bold sm:text-[44px]">{countByStatus(BANKS_DATA, status)}</div>
                      <div className="mt-1.5 flex items-center gap-2 text-sm text-[#B9C6CD]">
                        <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                        {status}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={showList}
                  className="mt-4 block w-full rounded-full bg-[#EE6E2D] p-[15px] text-center font-extrabold text-[#14252E] transition hover:bg-[#F48245]"
                >
                  Choose a bank
                </button>
              </div>
            </div>
          </section>
          <FeatureRow
            items={[
              { icon: "pin", title: "Direct to your bank", body: "Hatiso takes you straight to the bank's own domain." },
              { icon: "search", title: "Filter before you tap", body: "Filter by service supported, status and reliability." },
              { icon: "bolt", title: "Live status", body: "See which banks are online, degraded or down." },
              { icon: "card", title: "All in one place", body: "Bank the way you already do, just in one place." },
            ]}
          />
        </DarkHero>

        <BentoTiles
          label="Bank the way you already do, just in one place"
          content={{
            hero: {
              title: "Bank the way you already do, just in one place",
              body: "Select your bank to go straight to your app or internet banking.",
              action: { label: "Choose a bank", onClick: showList },
              cards: [
                BANKS_DATA[0]?.name ?? "IBILE MFB",
                BANKS_DATA[1]?.name ?? "Koins MFB",
                BANKS_DATA[2]?.name ?? "Bowen MFB",
              ],
            },
            orbit: {
              title: "Filter before you tap",
              body: "Filter by service supported, status and reliability before you tap to visit its official website",
              labels: ALL_SERVICES,
            },
            stats: [
              { tag: "Live", value: String(countByStatus(BANKS_DATA, "Online")), caption: "banks online now" },
              { tag: "Direct", value: "Own", caption: "domain, every time" },
            ],
          }}
        />

        <section className="bg-[#F3F4F5] text-[#10202A]">
          <div className="mx-auto max-w-[1280px] px-4 pb-[110px] pt-20 sm:px-6 sm:pt-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="m-0 text-[34px] font-semibold leading-[1.1] tracking-[-1.4px] sm:text-[46px]">
                  Choose a <span className="text-[#E2591A]">bank</span>
                </h2>
                <p className="mt-[22px] max-w-[560px] text-[17px] leading-[1.6] text-[#4A5B64]">
                  Filter by service supported, status and reliability before you tap to visit its official website
                </p>
              </div>
              <div className="flex w-full max-w-[380px] items-center gap-2.5 rounded-full border border-[#DDE3E6] bg-white px-5 focus-within:border-[#EE6E2D]">
                <LpIcon name="search" size={18} strokeWidth={1.8} className="text-[#5D6F78]" />
                <label htmlFor="q" className="sr-only">
                  Search banks
                </label>
                <input
                  id="q"
                  type="search"
                  placeholder="Search banks"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent py-[15px] text-base text-[#10202A] outline-none placeholder:text-[#5D6F78]"
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-3.5 rounded-[28px] border border-[#E3E8EB] bg-white p-[22px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-full text-[13px] font-bold text-[#4A5B64] sm:w-[130px]">Service Supported</span>
                {ALL_SERVICES.map((s) => (
                  <FilterChip key={s} label={s} on={services.includes(s)} onClick={() => setServices((l) => toggle(l, s))} />
                ))}
              </div>
              <div className="h-px bg-[#EEF1F3]" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-full text-[13px] font-bold text-[#4A5B64] sm:w-[130px]">Bank Status</span>
                {ALL_STATUSES.map((s) => (
                  <FilterChip key={s} label={s} on={statuses.includes(s)} onClick={() => setStatuses((l) => toggle(l, s))} />
                ))}
                {filtered && (
                  <button
                    type="button"
                    onClick={clear}
                    className="ml-auto px-[18px] py-[11px] text-sm font-bold text-[#C2531C] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <h3
              id="count"
              ref={countRef}
              tabIndex={-1}
              aria-live="polite"
              className="mb-[18px] mt-10 scroll-mt-6 text-xl font-bold outline-none"
            >
              {rows.length} Bank{rows.length === 1 ? "" : "s"}
            </h3>

            {rows.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#C9D0D4] bg-white px-6 py-14 text-center text-base text-[#4A5B64]">
                No banks match these filters.
                <button type="button" onClick={clear} className="ml-2 font-bold text-[#C2531C] hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {rows.map((bank) => (
                  <article
                    key={bank.id}
                    className="lp-reveal flex flex-col gap-[18px] rounded-[28px] border border-[#E3E8EB] bg-white p-6"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#10202A] text-sm font-extrabold text-white">
                        {bankMono(bank)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="m-0 truncate text-lg font-bold">{bank.name}</h4>
                        <span
                          className="mt-1.5 inline-flex items-center gap-[7px] rounded-full px-[11px] py-[5px] text-xs font-bold text-[#10202A]"
                          style={{ background: STATUS_PILL[bank.status] }}
                        >
                          <span className="h-[7px] w-[7px] rounded-full" style={{ background: STATUS_DOT[bank.status] }} />
                          {bank.status}
                        </span>
                      </div>
                    </div>
                    {bank.description && <p className="m-0 text-sm leading-[1.55] text-[#4A5B64]">{bank.description}</p>}
                    <div className="flex flex-wrap gap-1.5">
                      {bank.services.map((s) => (
                        <span key={s} className="rounded-full bg-[#F3F4F5] px-[11px] py-1.5 text-xs font-semibold text-[#233C49]">
                          {s}
                        </span>
                      ))}
                    </div>
                    <a
                      href={bank.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${bank.name} website (opens in a new tab)`}
                      className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[#10202A] p-3.5 text-[15px] font-bold text-white transition hover:bg-[#233C49]"
                    >
                      Visit website
                      <LpIcon name="arrow" size={14} strokeWidth={2.4} className="text-[#EE6E2D]" />
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <CtaBanner />
      </main>
      <Footer />
    </LandingPage>
  );
}
