"use client";

import React, { useMemo, useState } from "react";
import { ArrowUpRight, Building2, Lock, Search, X } from "lucide-react";
import Navbar from "@/components/marketplace/Navbar";
import Footer from "@/components/marketplace/Footer";
import BankLogo from "@/components/banks/BankLogo";
import BankOpenDialog from "@/components/banks/BankOpenDialog";
import { useBanks } from "@/lib/queries/useBanks";
import type { Bank } from "@/lib/api/banks";
import { bankInitials, bankStatus, channelLabels, STATUS_DOT } from "@/lib/banks/bankDisplay";

const rise = (d: number) => ({ "--d": d }) as React.CSSProperties;

/** Banks board: dark hero with search and the secure hand-off visual, then filters and partner bank tiles. */
export default function BanksPage() {
  const [query, setQuery] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [picked, setPicked] = useState<Bank | null>(null);
  const { data: banks = [], isLoading, isError, refetch } = useBanks();

  const allChannels = useMemo(() => Array.from(new Set(banks.flatMap(channelLabels))), [banks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return banks.filter((bank) => {
      if (q && !bank.name.toLowerCase().includes(q)) return false;
      if (channels.length && !channels.every((c) => channelLabels(bank).includes(c))) return false;
      if (onlineOnly && bankStatus(bank).tone !== "online") return false;
      return true;
    });
  }, [banks, query, channels, onlineOnly]);

  const hasFilters = !!query || channels.length > 0 || onlineOnly;
  const clear = () => {
    setQuery("");
    setChannels([]);
    setOnlineOnly(false);
  };
  const toggleChannel = (c: string) =>
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const [heroA, heroB, heroC] = [banks[0], banks[1], banks[2]];
  const heroChannel = (bank?: Bank) => (bank ? channelLabels(bank)[0] ?? "Official website" : "Mobile app");

  return (
    <div className="flex min-h-screen flex-col bg-cloud text-carbon selection:bg-silver selection:text-carbon">
      <Navbar />

      {/* Hero */}
      <section className="bg-carbon text-cloud">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-[clamp(40px,6vw,80px)] px-[clamp(16px,4vw,56px)] pt-[clamp(48px,7vw,96px)] pb-[clamp(48px,6vw,80px)]">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-6">
            <p className="hz-rise hz-eyebrow text-grey-400" style={rise(0)}>Banks</p>
            <h1
              className="hz-rise max-w-[820px] text-[clamp(38px,5.5vw,68px)] leading-[1.04] font-semibold tracking-[-0.035em] text-balance"
              style={rise(1)}
            >
              Your bank&apos;s own app, <span className="text-highlight">one tap away.</span>
            </h1>
            <p className="hz-rise max-w-[580px] text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-silver" style={rise(2)}>
              Choose your bank and we open its official app or internet banking. You sign in with your bank, so Hatiso
              never sees your login.
            </p>
            <label
              className="hz-rise mt-2 flex min-h-14 max-w-[560px] items-center gap-3 rounded-[10px] border border-grey-800 bg-graphite px-5 transition-colors focus-within:border-grey-500"
              style={rise(3)}
            >
              <Search className="h-5 w-5 shrink-0 text-grey-400" aria-hidden="true" />
              <span className="sr-only">Search banks</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && document.getElementById("partner-banks")?.scrollIntoView({ behavior: "smooth" })}
                placeholder="Search for your bank"
                className="min-w-0 flex-1 bg-transparent text-base text-cloud placeholder:text-grey-500 focus:outline-none"
              />
            </label>
          </div>

          {/* Partner banks fanned out (monochrome), with the secure hand-off */}
          <div
            aria-hidden="true"
            className="hz-rise relative h-[400px] max-w-[520px] min-w-0 flex-[1_1_400px] overflow-hidden rounded-2xl bg-graphite bg-[radial-gradient(var(--color-grey-800)_1px,transparent_1px)] bg-[length:22px_22px]"
            style={rise(2)}
          >
            <div className="absolute top-14 left-1/2 -ml-[125px] flex h-[156px] w-[250px] -translate-x-16 -rotate-12 flex-col justify-between rounded-xl bg-grey-700 p-[18px] text-cloud shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)]">
              <span className="text-[15px] font-bold">{heroC ? bankInitials(heroC.name) : "FB"}</span>
              <span className="text-[13px] text-grey-400">{heroChannel(heroC)}</span>
            </div>
            <div className="absolute top-[72px] left-1/2 -ml-[125px] flex h-[156px] w-[250px] -rotate-2 flex-col justify-between rounded-xl border border-grey-800 bg-carbon p-[18px] text-cloud shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)]">
              <span className="text-[15px] font-bold">{heroB ? bankInitials(heroB.name) : "GT"}</span>
              <span className="text-[13px] text-grey-400">{heroChannel(heroB)}</span>
            </div>
            <div className="absolute top-[92px] left-1/2 -ml-[125px] flex h-[156px] w-[250px] translate-x-16 rotate-[9deg] flex-col justify-between rounded-xl bg-cloud p-[18px] text-carbon shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)]">
              <span className="flex items-center justify-between">
                <span className="text-[15px] font-bold">{heroA ? bankInitials(heroA.name) : "AB"}</span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-grey-100 bg-white px-2 py-0.5 text-[11px] font-medium text-status-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                  Online
                </span>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="truncate text-base font-semibold">{heroA?.name ?? "Your bank"}</span>
                <span className="text-[13px] text-grey-600">{heroChannel(heroA)}</span>
              </span>
            </div>

            <div className="hz-card absolute right-6 bottom-6 left-6 flex max-w-[340px] flex-col gap-3 rounded-[10px] bg-cloud p-4 text-carbon shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-carbon text-cloud">
                  <Lock className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold">Opening {heroA?.name ?? "your bank"}</span>
                  <span className="text-xs text-grey-600">Official app · verified by Hatiso</span>
                </span>
              </span>
              <span className="block h-1 overflow-hidden rounded-full bg-grey-100">
                <span className="hz-fill block h-full rounded-full bg-carbon" style={{ "--fill-ms": "2600ms" } as React.CSSProperties} />
              </span>
            </div>

            <div className="absolute top-5 right-5 inline-flex items-center gap-2 rounded-md border border-grey-800 bg-carbon px-3.5 py-2 text-xs font-medium text-cloud">
              <span className="hz-ping h-1.5 w-1.5 rounded-full bg-highlight text-highlight" />
              Your login stays with your bank
            </div>
          </div>
        </div>
      </section>

      {/* List */}
      <section id="partner-banks" className="flex-1 scroll-mt-4 bg-cloud">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-8 px-[clamp(16px,4vw,56px)] pt-[clamp(40px,6vw,72px)] pb-[clamp(64px,8vw,112px)]">
          <aside
            aria-label="Filters"
            className="hz-rise flex max-w-full flex-[1_1_240px] flex-col gap-7 rounded-xl border border-grey-100 bg-white p-6 lg:sticky lg:top-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-semibold">Filters</span>
              <button
                type="button"
                onClick={clear}
                disabled={!hasFilters}
                className="py-2 text-sm font-medium text-grey-600 hover:text-carbon disabled:opacity-50"
              >
                Clear
              </button>
            </div>
            {allChannels.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium tracking-[0.14em] text-grey-600 uppercase">Channel</p>
                <div className="flex flex-wrap gap-2">
                  {allChannels.map((c) => {
                    const on = channels.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleChannel(c)}
                        className={`hz-press min-h-10 rounded-[10px] border px-4 text-sm font-medium transition-colors ${
                          on ? "border-carbon bg-carbon text-cloud" : "border-grey-150 bg-white text-carbon hover:border-grey-400"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="h-px bg-grey-100" />
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium tracking-[0.14em] text-grey-600 uppercase">Status</p>
              <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
                <input
                  type="checkbox"
                  checked={onlineOnly}
                  onChange={(e) => setOnlineOnly(e.target.checked)}
                  className="h-[18px] w-[18px] accent-carbon"
                />
                Online now
              </label>
            </div>
          </aside>

          <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">Partner banks</h2>
              <span className="text-sm text-grey-600" aria-live="polite">
                {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "bank" : "banks"}`}
              </span>
            </div>

            {isLoading ? (
              <div aria-busy="true" className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-[214px] animate-pulse rounded-xl border border-grey-100 bg-white" />
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-grey-150 bg-white p-12 text-center">
                <Building2 className="h-10 w-10 text-grey-400" aria-hidden="true" />
                <h3 className="text-lg font-semibold">We couldn&apos;t load the banks</h3>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="hz-press mt-1 inline-flex min-h-11 items-center rounded-[10px] bg-carbon px-5 text-sm font-medium text-cloud hover:bg-graphite"
                >
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-grey-150 bg-white p-12 text-center">
                <Building2 className="h-10 w-10 text-grey-400" aria-hidden="true" />
                <h3 className="mt-2 text-lg font-semibold">No matching banks</h3>
                <p className="text-sm text-grey-600">Try another name or clear the filters.</p>
                <button
                  type="button"
                  onClick={clear}
                  className="hz-press mt-3 inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-carbon px-5 text-sm font-medium text-cloud hover:bg-graphite"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="hz-stagger grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-4">
                {filtered.map((bank) => {
                  const status = bankStatus(bank);
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setPicked(bank)}
                      className="hz-lift flex flex-col gap-5 rounded-xl border border-grey-100 bg-white p-5 text-left text-carbon"
                    >
                      <span className="flex w-full items-start justify-between">
                        <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-grey-100 bg-cloud p-1.5">
                          <BankLogo bank={bank} className="h-full w-full" textClassName="text-[17px]" />
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-cloud px-2.5 py-1 text-xs font-medium text-grey-800">
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status.tone]}`} />
                          {status.label}
                        </span>
                      </span>
                      <span className="flex flex-col gap-1.5">
                        <span className="text-[17px] font-semibold">{bank.name}</span>
                        <span className="text-sm text-grey-600">{channelLabels(bank).join(" · ") || "Official website"}</span>
                      </span>
                      <span className="flex w-full items-center justify-between border-t border-grey-100 pt-3.5 text-sm font-medium">
                        Open bank
                        <ArrowUpRight className="hz-arrow h-4 w-4" aria-hidden="true" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {picked && <BankOpenDialog bank={picked} onClose={() => setPicked(null)} />}

      <Footer />
    </div>
  );
}
