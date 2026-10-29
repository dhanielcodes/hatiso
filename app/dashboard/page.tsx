'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Zap,
  Smartphone,
  Wifi,
  Lightbulb,
  Tv,
  Dices,
  LogOut,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

const MOCK_TRANSACTIONS = [
  {
    id: 'TXN-98412',
    category: 'Electricity',
    desc: 'Ikeja Electric Prepaid Token',
    amount: -5000,
    date: 'Today, 11:20 AM',
    status: 'Completed',
  },
  {
    id: 'TXN-98411',
    category: 'Airtime',
    desc: 'MTN VTU 08031234567',
    amount: -1500,
    date: 'Yesterday, 04:15 PM',
    status: 'Completed',
  },
  {
    id: 'TXN-98410',
    category: 'Wallet Deposit',
    desc: 'Instant Bank Transfer from GTBank',
    amount: 50000,
    date: '25 Oct, 09:00 AM',
    status: 'Completed',
  },
  {
    id: 'TXN-98409',
    category: 'Cable TV',
    desc: 'DStv Compact Plus Renewal',
    amount: -19800,
    date: '22 Oct, 02:40 PM',
    status: 'Completed',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [balance, setBalance] = useState(user?.balance || 148500.5);

  const displayName = user?.name || 'Valued User';

  return (
    <div className="min-h-screen bg-[#1B3C4A] text-white flex flex-col justify-between selection:bg-[#FF6500] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-700/60 bg-[#0E2028] px-4 py-4 sm:px-8 lg:px-14">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#183541]">
                <Zap className="h-5 w-5 text-[#FF6500]" />
              </div>
              <span className="text-xl font-black tracking-widest text-white">
                X<span className="text-[#FF6500]">NETT</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-5 sm:flex text-xs font-semibold">
              <Link href="/dashboard" className="text-[#FF6500]">
                Dashboard
              </Link>
              <Link href="/" className="text-slate-300 hover:text-white">
                Marketplace
              </Link>
              <Link href="/categories/electricity" className="text-slate-300 hover:text-white">
                Bill Payment
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6500] font-bold text-white text-sm shadow">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white">{displayName}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Verified Tier 2</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              title="Sign Out"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-[#162F3B] text-slate-400 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-14 flex-1 w-full space-y-8">
        {/* Welcome & Wallet Stats Card */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Balance Card (8 cols) */}
          <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#183946] via-[#122A34] to-[#0D1F26] p-7 shadow-2xl lg:col-span-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-[#FF6500]/10 blur-3xl" />

            <div className="flex flex-col justify-between h-full gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Total Available Balance
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white sm:text-4xl">
                      ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                  <Wallet className="h-6 w-6 text-[#FF6500]" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setBalance((prev) => prev + 10000)}
                  className="flex items-center gap-2 rounded-xl bg-[#FF6500] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF6500]/20 hover:bg-[#E84D15] active:scale-95 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Fund Wallet</span>
                </button>
                <Link
                  href="/categories/airtime"
                  className="flex items-center gap-2 rounded-xl border border-slate-600 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 active:scale-95 transition"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Transfer / Pay</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-transparent px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition"
                >
                  <span>Explore Marketplace</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats / Monthly Summary (4 cols) */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-700/80 bg-[#162F3A] p-6 shadow-xl lg:col-span-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  This Month's Activity
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#0F222A] p-3 text-xs">
                  <span className="text-slate-400">Bills & Utilities Paid</span>
                  <span className="font-bold text-white">₦26,300.00</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#0F222A] p-3 text-xs">
                  <span className="text-slate-400">Cashback Earned</span>
                  <span className="font-bold text-emerald-400">+₦1,420.00</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#0F222A] p-3 text-xs">
                  <span className="text-slate-400">Total Transactions</span>
                  <span className="font-bold text-white">18</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Insured by NDIC & Central Bank of Nigeria standard</span>
            </div>
          </div>
        </div>

        {/* Instant Marketplace Quick Actions */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Quick Service Shortcuts</h2>
            <Link href="/" className="text-xs font-semibold text-[#FF6500] hover:underline">
              View all 10 categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            <Link
              href="/categories/airtime"
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/80 bg-[#152E3A] p-4 text-center transition hover:-translate-y-1 hover:border-[#FF6500] hover:bg-[#183745]"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6500]/15 text-[#FF6500]">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Buy Airtime</span>
            </Link>

            <Link
              href="/categories/data"
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/80 bg-[#152E3A] p-4 text-center transition hover:-translate-y-1 hover:border-[#FF6500] hover:bg-[#183745]"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                <Wifi className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Data Bundle</span>
            </Link>

            <Link
              href="/categories/electricity"
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/80 bg-[#152E3A] p-4 text-center transition hover:-translate-y-1 hover:border-[#FF6500] hover:bg-[#183745]"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                <Lightbulb className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Electricity</span>
            </Link>

            <Link
              href="/categories/tv"
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/80 bg-[#152E3A] p-4 text-center transition hover:-translate-y-1 hover:border-[#FF6500] hover:bg-[#183745]"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                <Tv className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Cable TV</span>
            </Link>

            <Link
              href="/categories/betting"
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-700/80 bg-[#152E3A] p-4 text-center transition hover:-translate-y-1 hover:border-[#FF6500] hover:bg-[#183745]"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Dices className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-white">Betting Topup</span>
            </Link>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="rounded-3xl border border-slate-700/80 bg-[#162F3A] p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Transactions</h2>
            <span className="text-xs font-medium text-slate-400">Filtered by latest</span>
          </div>

          <div className="divide-y divide-slate-700/50">
            {MOCK_TRANSACTIONS.map((txn) => {
              const isPositive = txn.amount > 0;
              return (
                <div
                  key={txn.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${isPositive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-[#FF6500]/20 text-[#FF6500]'
                        }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{txn.desc}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{txn.category}</span>
                        <span>•</span>
                        <span>{txn.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-white'
                        }`}
                    >
                      {isPositive ? '+' : ''}₦{Math.abs(txn.amount).toLocaleString()}.00
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> {txn.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0E2028] py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} XNETT Dashboard. Safe & Encrypted.
      </footer>
    </div>
  );
}
