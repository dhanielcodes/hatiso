'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroBadge, HeroHeadline, HeroLead, HeroPillInput, ProviderRow } from '@/components/landing/LandingKit';
import { saveServicePrefill } from '@/lib/marketing/servicePrefill';

export type PayBillService = 'airtime' | 'data' | 'electricity' | 'tv';

const CFG: Record<
  PayBillService,
  { label: string; provLabel: string; provs: string[]; numLabel: string; numPh: string; amts: number[]; verb: string; kind: 'phone' | 'meter' | 'smartcard' }
> = {
  airtime: { label: 'Airtime', provLabel: 'Network', provs: ['MTN', 'Airtel', 'Glo', '9mobile'], numLabel: 'Phone number', numPh: '0803 000 0000', amts: [200, 500, 1000, 2000], verb: 'Buy airtime', kind: 'phone' },
  data: { label: 'Data', provLabel: 'Network', provs: ['MTN', 'Airtel', 'Glo', '9mobile'], numLabel: 'Phone number', numPh: '0803 000 0000', amts: [500, 1000, 2000, 5000], verb: 'Buy data', kind: 'phone' },
  electricity: { label: 'Electricity', provLabel: 'Distribution company', provs: ['Ikeja Electric', 'Eko Electric', 'Abuja Electric'], numLabel: 'Meter number', numPh: 'Enter meter number', amts: [2000, 5000, 10000, 20000], verb: 'Buy token', kind: 'meter' },
  tv: { label: 'TV', provLabel: 'TV provider', provs: ['DStv', 'GOtv', 'StarTimes'], numLabel: 'Smartcard number', numPh: 'Enter smartcard number', amts: [5000, 10000, 15000, 25000], verb: 'Renew TV', kind: 'smartcard' },
};

const SERVICES: PayBillService[] = ['airtime', 'data', 'electricity', 'tv'];

const DOTS: Record<string, string> = {
  MTN: '#FFCB05', Airtel: '#E40000', Glo: '#50B848', '9mobile': '#00693E',
  'Ikeja Electric': '#E2591A', 'Eko Electric': '#1F6FB2', 'Abuja Electric': '#2B8A57',
  DStv: '#0A8FD8', GOtv: '#3BA935', StarTimes: '#E8A317',
};

const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

function isValidNumber(kind: 'phone' | 'meter' | 'smartcard', digits: string) {
  if (kind === 'phone') return /^0[789]\d{9}$/.test(digits) || /^[789]\d{9}$/.test(digits) || /^234[789]\d{9}$/.test(digits);
  if (kind === 'meter') return digits.length >= 11 && digits.length <= 13;
  return digits.length >= 10 && digits.length <= 12;
}

/** State for the home "Pay a bill" card, lifted so the category grid can open a tab. */
export function usePayBill() {
  const [svc, setSvc] = useState<PayBillService>('airtime');
  const [prov, setProv] = useState(CFG.airtime.provs[0]);
  const [amt, setAmt] = useState(CFG.airtime.amts[1]);
  const [num, setNum] = useState('');

  const pick = (next: PayBillService) => {
    setSvc(next);
    setProv(CFG[next].provs[0]);
    setAmt(CFG[next].amts[1]);
  };

  return { svc, prov, amt, num, setProv, setAmt, setNum, pick };
}

export type PayBillState = ReturnType<typeof usePayBill>;

export function focusPayCard() {
  document.getElementById('try')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => document.getElementById('hnum')?.focus({ preventScroll: true }), 450);
}

/** White card with stacked orange/slate layers behind it. Paying opens the real checkout, prefilled. */
function PayBillCard({ bill }: { bill: PayBillState }) {
  const router = useRouter();
  const cfg = CFG[bill.svc];
  const digits = bill.num.replace(/\D/g, '');
  const ok = isValidNumber(cfg.kind, digits);

  const pay = () => {
    if (!ok) return;
    saveServicePrefill({ slug: bill.svc, recipient: digits, amountMinor: bill.amt * 100, provider: bill.prov });
    router.push(`/services/${bill.svc}`);
  };

  return (
    <div id="try" className="relative flex min-w-0 flex-[1_1_440px] justify-center pb-12 pr-7 pt-5 max-sm:pr-4">
      <div className="lp-phone relative z-[1] w-full max-w-[480px]">
        <div aria-hidden="true" className="absolute inset-[18px_-18px_-18px_18px] rotate-[4deg] rounded-[32px] bg-[#EE6E2D] max-sm:inset-[12px_-12px_-12px_12px]" />
        <div aria-hidden="true" className="absolute inset-[9px_-9px_-9px_9px] rotate-[2deg] rounded-[32px] bg-[#233C49] max-sm:inset-[6px_-6px_-6px_6px]" />
        <div className="relative overflow-hidden rounded-[32px] bg-white text-[#10202A]">
          <div className="flex items-start justify-between gap-3 px-6 pt-7 sm:px-7">
            <div>
              <div className="text-[22px] font-extrabold tracking-[-0.5px]">Pay a bill</div>
              <div className="mt-[3px] text-sm text-[#5D6F78]">No account required</div>
            </div>
            <span className="inline-flex items-center gap-[7px] rounded-full bg-[#E6F4EC] px-3 py-[7px] text-xs font-bold text-[#2B7A50]">
              <span className="lp-ping h-[7px] w-[7px] rounded-full bg-[#3FAE70]" />
              Live
            </span>
          </div>

          <div role="tablist" aria-label="Services" className="mx-6 mt-[22px] grid grid-cols-4 gap-0.5 rounded-full bg-[#F1F3F4] p-1 sm:mx-7">
            {SERVICES.map((id) => {
              const on = bill.svc === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => bill.pick(id)}
                  className={`rounded-full py-[11px] text-[13px] font-bold transition-colors sm:text-sm ${on ? 'bg-[#10202A] text-white' : 'text-[#4A5B64] hover:text-[#10202A]'}`}
                >
                  {CFG[id].label}
                </button>
              );
            })}
          </div>

          <form
            className="flex flex-col gap-5 px-6 pb-7 pt-6 sm:px-7"
            onSubmit={(e) => {
              e.preventDefault();
              pay();
            }}
          >
            <fieldset>
              <legend className="mb-[9px] text-[13px] font-bold text-[#4A5B64]">{cfg.provLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {cfg.provs.map((name) => {
                  const on = bill.prov === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={on}
                      onClick={() => bill.setProv(name)}
                      className={`inline-flex items-center gap-2 rounded-full border py-2.5 pl-3 pr-[15px] text-sm font-bold transition-colors ${on ? 'border-[#10202A] bg-[#10202A] text-white' : 'border-[#DDE3E6] bg-white text-[#10202A] hover:border-[#B9C6CD]'}`}
                    >
                      <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full" style={{ background: DOTS[name] ?? '#36637F' }} />
                      {name}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="hnum" className="mb-[9px] block text-[13px] font-bold text-[#4A5B64]">
                {cfg.numLabel}
              </label>
              <input
                id="hnum"
                type="tel"
                inputMode="numeric"
                autoComplete={cfg.kind === 'phone' ? 'tel-national' : 'off'}
                placeholder={cfg.numPh}
                value={bill.num}
                onChange={(e) => bill.setNum(e.target.value)}
                className="w-full rounded-2xl border border-[#DDE3E6] bg-white px-[18px] py-[15px] text-[17px] font-semibold text-[#10202A] outline-none transition placeholder:font-normal placeholder:text-[#8A989F] focus:border-[#EE6E2D] focus:ring-2 focus:ring-[#EE6E2D]/20"
              />
            </div>

            <fieldset>
              <legend className="mb-[9px] text-[13px] font-bold text-[#4A5B64]">Amount</legend>
              <div className="grid grid-cols-4 gap-2">
                {cfg.amts.map((v) => {
                  const on = bill.amt === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => bill.setAmt(v)}
                      className={`rounded-[14px] border px-0.5 py-[13px] text-[13px] font-bold text-[#10202A] transition-colors sm:text-sm ${on ? 'border-[#EE6E2D] bg-[#FFF3E8]' : 'border-[#DDE3E6] bg-white hover:border-[#B9C6CD]'}`}
                    >
                      {naira(v)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-[#EEF1F3] pt-[18px]">
              <div>
                <div className="text-[13px] text-[#5D6F78]">Total</div>
                <div className="text-[26px] font-extrabold tracking-[-0.8px]">{naira(bill.amt)}.00</div>
              </div>
              <button
                type="submit"
                disabled={!ok}
                className={`flex-[1_1_200px] rounded-full px-5 py-[17px] text-base font-extrabold transition ${ok ? 'bg-[#EE6E2D] text-[#14252E] hover:bg-[#F48245] active:scale-[0.99]' : 'cursor-not-allowed bg-[#E4EAED] text-[#5D6F78]'}`}
              >
                {ok ? `${cfg.verb} for ${naira(bill.amt)}` : `Enter a valid ${cfg.numLabel.toLowerCase()}`}
              </button>
            </div>
            <p className="-mt-2 text-center text-xs text-[#8A989F]">You&apos;ll review everything before you pay.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Home hero: headline, quick top-up input synced with the card, and the "Pay a bill" card. */
export default function HeroSection({ bill }: { bill: PayBillState }) {
  const router = useRouter();

  const quickBuy = () => {
    const digits = bill.num.replace(/\D/g, '');
    if (bill.svc !== 'airtime') bill.pick('airtime');
    if (isValidNumber('phone', digits)) {
      const amt = bill.svc === 'airtime' ? bill.amt : CFG.airtime.amts[1];
      const prov = bill.svc === 'airtime' ? bill.prov : CFG.airtime.provs[0];
      saveServicePrefill({ slug: 'airtime', recipient: digits, amountMinor: amt * 100, provider: prov });
      router.push('/services/airtime');
    } else {
      focusPayCard();
    }
  };

  return (
    <section className="relative mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-10 px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
      <div className="min-w-0 flex-[1_1_560px]">
        <HeroBadge>No account required to start</HeroBadge>
        <HeroHeadline lines={[{ text: 'One platform.' }, { text: 'Every service' }, { text: 'you need.', accent: true }]} />
        <HeroLead>
          Discover digital services from trusted providers, manage your banking, and get things done. All from one place.
        </HeroLead>
        <HeroPillInput
          icon="phone"
          label="Phone number to top up"
          action="Buy airtime"
          onAction={quickBuy}
          inputProps={{
            id: 'qnum',
            type: 'tel',
            inputMode: 'numeric',
            autoComplete: 'tel-national',
            placeholder: 'Enter a phone number to top up',
            value: bill.num,
            onChange: (e) => bill.setNum(e.target.value),
          }}
        />
        <ProviderRow label="Pay" items={['MTN', 'Airtel', 'Glo', '9mobile', 'DStv', 'GOtv']} />
      </div>
      <PayBillCard bill={bill} />
    </section>
  );
}
