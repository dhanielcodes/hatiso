"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import moment from "moment";
import { ArrowUpRight, Building2, ChevronRight, Landmark, Search } from "lucide-react";
import BankLogo from "@/components/banks/BankLogo";
import BankOpenDialog from "@/components/banks/BankOpenDialog";
import { useBanks } from "@/lib/queries/useBanks";
import type { Bank } from "@/lib/api/banks";
import { bankStatus, channelLabels, STATUS_DOT, STATUS_TEXT } from "@/lib/banks/bankDisplay";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * "Your banks" on the DashBanking board: the banks this person last opened. There is no API for it,
 * so it lives in this browser only.
 */
const RECENT_KEY = "hatiso_recent_banks";
type Recent = { id: string; at: number };

const listeners = new Set<() => void>();
function readRecentRaw() {
  try {
    return localStorage.getItem(RECENT_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function rememberBank(bank: Bank) {
  try {
    const list: Recent[] = JSON.parse(readRecentRaw());
    const next = [{ id: String(bank.id), at: Date.now() }, ...list.filter((r) => r.id !== String(bank.id))].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the list just stays empty
  }
  listeners.forEach((cb) => cb());
}

export default function BankingPage() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Bank | null>(null);
  const { data: banks = [], isLoading, isError, refetch } = useBanks();
  const recentRaw = useSyncExternalStore(subscribe, readRecentRaw, () => "[]");

  const recent = useMemo(() => {
    let list: Recent[] = [];
    try {
      list = JSON.parse(recentRaw);
    } catch {
      list = [];
    }
    return list.flatMap((r) => {
      const bank = banks.find((b) => String(b.id) === r.id);
      return bank ? [{ bank, at: r.at }] : [];
    });
  }, [recentRaw, banks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return banks.filter((b) => !q || `${b.name} ${channelLabels(b).join(" ")}`.toLowerCase().includes(q));
  }, [banks, query]);

  return (
    <div className="min-h-full bg-tone-44 text-tone-744">
      <div className="flex w-full flex-col gap-6 p-[clamp(20px,3vw,40px)]">
        <div className="hz-rise flex flex-col gap-1.5">
          <h1 className="text-[clamp(28px,3vw,36px)] leading-[1.1] font-semibold tracking-[-0.025em]">Banking</h1>
          <span className="text-[15px] text-tone-414">Open your bank&apos;s own app or internet banking. You sign in with your bank.</span>
        </div>

        <section className="hz-rise flex flex-col gap-3.5" style={{ "--d": 1 } as React.CSSProperties}>
          <h2 className="text-lg font-semibold">Your banks</h2>
          {recent.length ? (
            <div className="hz-stagger grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-3">
              {recent.map(({ bank, at }) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setPicked(bank)}
                  className="hz-lift flex items-center gap-3.5 rounded-[14px] border border-tone-100 bg-surface p-4 text-left"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-tone-100 bg-tone-44 p-1">
                    <BankLogo bank={bank} className="h-full w-full" textClassName="text-[15px]" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-base font-semibold">{bank.name}</span>
                    <span className="text-[13px] text-tone-414">Last opened {moment(at).fromNow()}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                    Open
                    <ArrowUpRight className="hz-arrow h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3.5 rounded-[14px] border border-dashed border-tone-100 bg-surface p-4 text-sm text-tone-414">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-tone-44 text-tone-744">
                <Landmark className="h-5 w-5" aria-hidden="true" />
              </span>
              Banks you open from Hatiso show up here, so you can get back to them in one tap.
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-start gap-4">
          <section className="hz-rise flex min-w-0 flex-[999_1_560px] flex-col gap-3.5" style={{ "--d": 2 } as React.CSSProperties}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">All partner banks</h2>
              <label className="flex min-h-11 flex-[0_1_300px] items-center gap-2.5 rounded-[10px] border border-tone-100 bg-surface px-3.5 focus-within:border-brand-305">
                <Search className="h-4 w-4 shrink-0 text-tone-414" aria-hidden="true" />
                <span className="sr-only">Search banks</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search banks"
                  className="min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-tone-414 focus:outline-none"
                />
              </label>
            </div>
            <div className="overflow-hidden rounded-[14px] border border-tone-100 bg-surface">
              {isLoading &&
                Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex items-center gap-3.5 border-b border-tone-44 px-[18px] py-3.5 last:border-b-0">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              {isError && (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <Building2 className="h-9 w-9 text-tone-414" aria-hidden="true" />
                  <p className="font-semibold">We couldn&apos;t load the banks</p>
                  <button type="button" onClick={() => refetch()} className="hz-press min-h-11 rounded-[10px] bg-brand-305 px-5 text-sm font-medium text-on-brand hover:bg-brand-361">
                    Try again
                  </button>
                </div>
              )}
              {!isLoading && !isError && !filtered.length && (
                <p className="p-10 text-center text-sm text-tone-414">No banks match “{query}”.</p>
              )}
              {filtered.map((bank) => {
                const status = bankStatus(bank);
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setPicked(bank)}
                    className="group flex w-full items-center gap-3.5 border-b border-tone-44 px-[18px] py-3.5 text-left transition-colors last:border-b-0 hover:bg-tone-44"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-tone-100 bg-tone-44 p-1">
                      <BankLogo bank={bank} className="h-full w-full" textClassName="text-[13px]" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-medium">{bank.name}</span>
                      <span className="truncate text-[13px] text-tone-414">{channelLabels(bank).join(" · ") || "Official website"}</span>
                    </span>
                    <span className={`hidden items-center gap-1.5 text-[13px] font-medium sm:inline-flex ${STATUS_TEXT[status.tone]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status.tone]}`} />
                      {status.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-tone-414 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="hz-rise flex min-w-0 flex-[1_1_300px] flex-col gap-4" style={{ "--d": 3 } as React.CSSProperties}>
            <div className="flex flex-col gap-3.5 rounded-[14px] bg-carbon p-[22px] text-cloud">
              <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-graphite">
                <Landmark className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[17px] font-semibold">How banking on Hatiso works</span>
              <ol className="flex list-decimal flex-col gap-2.5 pl-[18px] text-sm leading-normal text-silver">
                <li>Pick your bank.</li>
                <li>We open its official app or website.</li>
                <li>You sign in there. We never see your login, password or PIN.</li>
              </ol>
            </div>
            <div className="flex flex-col gap-1.5 rounded-[14px] border border-tone-100 bg-surface p-5">
              <span className="text-[15px] font-semibold">Bank not listed?</span>
              <span className="text-sm leading-normal text-tone-414">We&apos;re adding partner banks all the time.</span>
              <Link href="/dashboard/support" className="mt-1.5 self-start border-b border-tone-744 text-sm font-medium">
                Ask for your bank
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {picked && <BankOpenDialog bank={picked} onClose={() => setPicked(null)} onContinue={rememberBank} />}
    </div>
  );
}
