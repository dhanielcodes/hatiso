'use client';

import { useMemo, useSyncExternalStore } from 'react';
import type { Bank } from '@/lib/api/banks';

/**
 * "Your banks": the banks this person last opened from Hatiso (newest first, up to four).
 * There is no API for it, so it lives in this browser only. Used by the Banking page and the
 * dashboard's banking spotlight.
 */
const RECENT_KEY = 'hatiso_recent_banks';
type Recent = { id: string; at: number };

const listeners = new Set<() => void>();

function readRecentRaw() {
  try {
    return localStorage.getItem(RECENT_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

/** Records that the person opened this bank (call when they continue to it). */
export function rememberBank(bank: Bank) {
  try {
    const list: Recent[] = JSON.parse(readRecentRaw());
    const next = [{ id: String(bank.id), at: Date.now() }, ...list.filter((r) => r.id !== String(bank.id))].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the list just stays empty.
  }
  listeners.forEach((cb) => cb());
}

/** The recently opened banks that are still in `banks`, with when each was opened. */
export function useRecentBanks(banks: Bank[]) {
  const raw = useSyncExternalStore(subscribe, readRecentRaw, () => '[]');
  return useMemo(() => {
    let list: Recent[] = [];
    try {
      list = JSON.parse(raw);
    } catch {
      list = [];
    }
    return list.flatMap((r) => {
      const bank = banks.find((b) => String(b.id) === r.id);
      return bank ? [{ bank, at: r.at }] : [];
    });
  }, [raw, banks]);
}
