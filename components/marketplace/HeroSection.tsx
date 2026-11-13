"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HeroHeadline,
  HeroLead,
  HeroPillInput,
  LpIcon,
} from "@/components/landing/LandingKit";
import { saveServicePrefill } from "@/lib/marketing/servicePrefill";

export type PayBillService = "airtime" | "data" | "electricity" | "tv";

const CFG: Record<
  PayBillService,
  {
    label: string;
    provLabel: string;
    provs: string[];
    numLabel: string;
    numPh: string;
    amts: number[];
    verb: string;
    kind: "phone" | "meter" | "smartcard";
  }
> = {
  airtime: {
    label: "Airtime",
    provLabel: "Network",
    provs: ["MTN", "Airtel", "Glo", "9mobile"],
    numLabel: "Phone number",
    numPh: "0803 000 0000",
    amts: [200, 500, 1000, 2000],
    verb: "Buy airtime",
    kind: "phone",
  },
  data: {
    label: "Data",
    provLabel: "Network",
    provs: ["MTN", "Airtel", "Glo", "9mobile"],
    numLabel: "Phone number",
    numPh: "0803 000 0000",
    amts: [500, 1000, 2000, 5000],
    verb: "Buy data",
    kind: "phone",
  },
  electricity: {
    label: "Electricity",
    provLabel: "Distribution company",
    provs: ["Ikeja Electric", "Eko Electric", "Abuja Electric"],
    numLabel: "Meter number",
    numPh: "Enter meter number",
    amts: [2000, 5000, 10000, 20000],
    verb: "Buy token",
    kind: "meter",
  },
  tv: {
    label: "TV",
    provLabel: "TV provider",
    provs: ["DStv", "GOtv", "StarTimes"],
    numLabel: "Smartcard number",
    numPh: "Enter smartcard number",
    amts: [5000, 10000, 15000, 25000],
    verb: "Renew TV",
    kind: "smartcard",
  },
};

const SERVICES: PayBillService[] = ["airtime", "data", "electricity", "tv"];

const DOTS: Record<string, string> = {
  MTN: "#FFCB05",
  Airtel: "#E40000",
  Glo: "#50B848",
  "9mobile": "#00693E",
  "Ikeja Electric": "#E2591A",
  "Eko Electric": "#1F6FB2",
  "Abuja Electric": "#2B8A57",
  DStv: "#0A8FD8",
  GOtv: "#3BA935",
  StarTimes: "#E8A317",
};

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

function isValidNumber(kind: "phone" | "meter" | "smartcard", digits: string) {
  if (kind === "phone")
    return (
      /^0[789]\d{9}$/.test(digits) ||
      /^[789]\d{9}$/.test(digits) ||
      /^234[789]\d{9}$/.test(digits)
    );
  if (kind === "meter") return digits.length >= 11 && digits.length <= 13;
  return digits.length >= 10 && digits.length <= 12;
}

/** State for the home "Pay a bill" card, lifted so the category grid can open a tab. */
export function usePayBill() {
  const [svc, setSvc] = useState<PayBillService>("airtime");
  const [prov, setProv] = useState(CFG.airtime.provs[0]);
  const [amt, setAmt] = useState(CFG.airtime.amts[1]);
  const [num, setNum] = useState("");

  const pick = (next: PayBillService) => {
    setSvc(next);
    setProv(CFG[next].provs[0]);
    setAmt(CFG[next].amts[1]);
  };

  return { svc, prov, amt, num, setProv, setAmt, setNum, pick };
}

export type PayBillState = ReturnType<typeof usePayBill>;

export function focusPayCard() {
  document
    .getElementById("try")
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(
    () => document.getElementById("hnum")?.focus({ preventScroll: true }),
    450,
  );
}

/** The "Pay a bill" form. Paying opens the real checkout, prefilled. */
function PayBillForm({ bill }: { bill: PayBillState }) {
  const router = useRouter();
  const cfg = CFG[bill.svc];
  const digits = bill.num.replace(/\D/g, "");
  const ok = isValidNumber(cfg.kind, digits);

  const pay = () => {
    if (!ok) return;
    saveServicePrefill({
      slug: bill.svc,
      recipient: digits,
      amountMinor: bill.amt * 100,
      provider: bill.prov,
    });
    router.push(`/services/${bill.svc}`);
  };

  return (
    <div
      id="try"
      className="relative min-w-0 overflow-hidden rounded-[26px] bg-white text-[#10202A] shadow-[0_24px_60px_-30px_rgba(16,32,42,0.6)]"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-6 sm:px-6">
        <div>
          <div className="text-[20px] font-extrabold tracking-[-0.5px]">
            Pay a bill
          </div>
          <div className="mt-[3px] text-sm text-[#5D6F78]">
            No account required
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Services"
        className="mx-5 mt-5 grid grid-cols-4 gap-0.5 rounded-full bg-[#F1F3F4] p-1 sm:mx-6"
      >
        {SERVICES.map((id) => {
          const on = bill.svc === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => bill.pick(id)}
              className={`rounded-full py-[10px] text-[13px] font-bold transition-colors ${on ? "bg-[#10202A] text-white" : "text-[#4A5B64] hover:text-[#10202A]"}`}
            >
              {CFG[id].label}
            </button>
          );
        })}
      </div>

      <form
        className="flex flex-col gap-[18px] px-5 pb-6 pt-5 sm:px-6"
        onSubmit={(e) => {
          e.preventDefault();
          pay();
        }}
      >
        <fieldset>
          <legend className="mb-[9px] text-[13px] font-bold text-[#4A5B64]">
            {cfg.provLabel}
          </legend>
          <div className="flex flex-wrap gap-2">
            {cfg.provs.map((name) => {
              const on = bill.prov === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => bill.setProv(name)}
                  className={`inline-flex items-center gap-2 rounded-full border py-2 pl-3 pr-[14px] text-[13px] font-bold transition-colors ${on ? "border-[#10202A] bg-[#10202A] text-white" : "border-[#DDE3E6] bg-white text-[#10202A] hover:border-[#B9C6CD]"}`}
                >
                  <span
                    aria-hidden="true"
                    className="h-[9px] w-[9px] rounded-full"
                    style={{ background: DOTS[name] ?? "#36637F" }}
                  />
                  {name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="hnum"
            className="mb-[9px] block text-[13px] font-bold text-[#4A5B64]"
          >
            {cfg.numLabel}
          </label>
          <input
            id="hnum"
            type="tel"
            inputMode="numeric"
            autoComplete={cfg.kind === "phone" ? "tel-national" : "off"}
            placeholder={cfg.numPh}
            value={bill.num}
            onChange={(e) => bill.setNum(e.target.value)}
            className="w-full rounded-2xl border border-[#DDE3E6] bg-white px-4 py-[13px] text-base font-semibold text-[#10202A] outline-none transition placeholder:font-normal placeholder:text-[#8A989F] focus:border-[#EE6E2D] focus:ring-2 focus:ring-[#EE6E2D]/20"
          />
        </div>

        <fieldset>
          <legend className="mb-[9px] text-[13px] font-bold text-[#4A5B64]">
            Amount
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {cfg.amts.map((v) => {
              const on = bill.amt === v;
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={on}
                  onClick={() => bill.setAmt(v)}
                  className={`rounded-[14px] border px-0.5 py-3 text-[13px] font-bold text-[#10202A] transition-colors ${on ? "border-[#EE6E2D] bg-[#FFF3E8]" : "border-[#DDE3E6] bg-white hover:border-[#B9C6CD]"}`}
                >
                  {naira(v)}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!ok}
          className={`mt-1 w-full rounded-full px-5 py-4 text-[15px] font-extrabold transition ${ok ? "bg-[#10202A] text-white hover:bg-[#233C49] active:scale-[0.99]" : "cursor-not-allowed bg-[#E4EAED] text-[#5D6F78]"}`}
        >
          {ok
            ? `${cfg.verb} for ${naira(bill.amt)}`
            : `Enter a valid ${cfg.numLabel.toLowerCase()}`}
        </button>
        <p className="-mt-2 text-center text-xs text-[#8A989F]">
          You&apos;ll review everything before you pay.
        </p>
      </form>
    </div>
  );
}

/** Side card shell: a thin outer frame around a navy card. */
function FramedCard({
  delay,
  className = "",
  children,
}: {
  delay: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`lp-rise flex min-w-0 rounded-[34px] border border-[#1E2A31] bg-[#0D171D] p-2 ${className}`}
      style={{ "--d": delay } as React.CSSProperties}
    >
      <div className="flex w-full flex-col overflow-hidden rounded-[28px] bg-[#10202A]">
        {children}
      </div>
    </div>
  );
}

/** Left card: a live summary of what the form is about to pay. */
function SummaryCard({
  bill,
  className,
}: {
  bill: PayBillState;
  className?: string;
}) {
  const cfg = CFG[bill.svc];
  const shown = bill.num.trim() || cfg.numPh;
  return (
    <FramedCard delay="0.72s" className={className}>
      <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-6 pt-7">
        <div className="text-sm text-[#9AA8B0]">You pay</div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[32px] font-semibold tracking-[-1px]">
            {naira(bill.amt)}.00
          </span>
          <LpIcon name="card" size={20} className="text-[#5D6F78]" />
        </div>

        <div aria-hidden="true" className="relative my-5 h-12">
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#1E2A31]" />
          <span className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFD9BD_0%,#F48245_40%,#C2531C_100%)] shadow-[0_10px_30px_-6px_rgba(238,110,45,0.7)]" />
        </div>

        <div className="text-sm text-[#9AA8B0]">
          {bill.prov} {cfg.label.toLowerCase()} to
        </div>
        <div
          className={`truncate text-[22px] font-semibold tracking-[-0.5px] ${bill.num.trim() ? "text-white" : "text-[#5D6F78]"}`}
        >
          {shown}
        </div>
      </div>
      <div className="border-t border-[#1E2A31] bg-[#0F1C24] px-6 py-4 text-center">
        <div className="text-xs text-[#7F8E96]">Usually delivered in</div>
        <div className="mt-0.5 text-[15px] font-bold">a few seconds</div>
      </div>
    </FramedCard>
  );
}

const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

/** Right card: an illustrative spending chart (decorative). */
function SpendCard({ className }: { className?: string }) {
  return (
    <FramedCard delay="0.8s" className={className}>
      <div aria-hidden="true" className="flex flex-1 flex-col px-6 pb-6 pt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="whitespace-nowrap rounded-full bg-[#162A35] px-3 py-1.5 text-xs font-semibold text-[#9AA8B0]">
            Monthly spend
          </span>
          <span className="flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F5] text-[#10202A]">
              <LpIcon name="phone" size={16} strokeWidth={2} />
            </span>
            <span className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#EE6E2D] text-[#14252E] ring-2 ring-[#10202A]">
              <LpIcon name="bolt" size={16} strokeWidth={2} />
            </span>
          </span>
        </div>
        <div className="mt-5 text-[32px] font-semibold tracking-[-1px]">
          ₦18,450
        </div>
        <div className="mt-1 flex gap-3 text-xs">
          <span className="font-bold text-[#3FAE70]">▲ 4.2%</span>
          <span className="text-[#7F8E96]">vs last month</span>
        </div>

        <svg viewBox="0 0 240 120" className="mt-auto w-full pt-6" fill="none">
          {[20, 60, 100, 140, 180, 220].map((x) => (
            <line
              key={x}
              x1={x}
              x2={x}
              y1="8"
              y2="112"
              stroke="#1E2A31"
              strokeWidth="1"
            />
          ))}
          <line
            x1="0"
            x2="240"
            y1="70"
            y2="70"
            stroke="#1E2A31"
            strokeWidth="1"
          />
          <line
            x1="60"
            x2="60"
            y1="22"
            y2="112"
            stroke="#5D6F78"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d="M0 74 C 14 74, 20 88, 34 86 S 50 58, 60 62 S 80 92, 96 84 S 116 64, 128 74 S 146 96, 160 82 S 178 22, 194 24 S 220 48, 240 40"
            stroke="#EE6E2D"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {[
            [0, 74],
            [34, 86],
            [60, 62],
            [96, 84],
            [160, 82],
            [194, 24],
            [226, 46],
          ].map(([x, y]) => (
            <circle
              key={x}
              cx={x}
              cy={y}
              r="3"
              fill="#10202A"
              stroke="#EE6E2D"
              strokeWidth="1.6"
            />
          ))}
          <rect x="34" y="4" width="52" height="18" rx="9" fill="#F3F4F5" />
          <text
            x="60"
            y="16.5"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#10202A"
          >
            ₦2,400
          </text>
        </svg>
        <div className="mt-2 flex justify-between px-1 text-[11px] text-[#5D6F78]">
          {MONTHS.map((m) => (
            <span key={m} className={m === "Oct" ? "font-bold text-white" : ""}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </FramedCard>
  );
}

/** Home hero: centred headline and quick top-up, then the summary / pay-a-bill / spend cards. */
export default function HeroSection({ bill }: { bill: PayBillState }) {
  const router = useRouter();

  const quickBuy = () => {
    const digits = bill.num.replace(/\D/g, "");
    if (bill.svc !== "airtime") bill.pick("airtime");
    if (isValidNumber("phone", digits)) {
      const amt = bill.svc === "airtime" ? bill.amt : CFG.airtime.amts[1];
      const prov = bill.svc === "airtime" ? bill.prov : CFG.airtime.provs[0];
      saveServicePrefill({
        slug: "airtime",
        recipient: digits,
        amountMinor: amt * 100,
        provider: prov,
      });
      router.push("/services/airtime");
    } else {
      focusPayCard();
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-[1280px] px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      {/* Soft orange glow behind the cards */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[52%] h-[420px] w-[760px] max-w-full -translate-x-1/2 rounded-full bg-[#EE6E2D] opacity-[0.12] blur-[120px]"
      />

      <div className="relative mx-auto flex max-w-[860px] flex-col items-center text-center">
        <HeroHeadline
          lines={[
            { text: "One platform." },
            { text: "Every service you need.", accent: true },
          ]}
        />
        <HeroLead className="mx-auto">
          Discover digital services from trusted providers, manage your banking,
          and get things done. All from one place.
        </HeroLead>
        <HeroPillInput
          className="w-full mx-auto"
          icon="phone"
          label="Phone number to top up"
          action="Buy airtime"
          onAction={quickBuy}
          inputProps={{
            id: "qnum",
            type: "tel",
            inputMode: "numeric",
            autoComplete: "tel-national",
            placeholder: "Enter a phone number to top up",
            value: bill.num,
            onChange: (e) => bill.setNum(e.target.value),
          }}
        />
      </div>

      <div className="relative mt-14 grid items-stretch gap-4 sm:mt-16 md:grid-cols-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,2.7fr)_minmax(0,0.9fr)]">
        {/* Centre: orange card holding the form. First on smaller screens. */}
        <div
          className="lp-rise relative min-w-0 overflow-hidden rounded-[34px] p-5 text-[#14252E] sm:p-7 md:col-span-2 xl:order-2 xl:col-span-1"
          style={
            {
              "--d": "0.64s",
              background:
                "radial-gradient(110% 80% at 90% 0%, rgba(255,222,196,0.55) 0%, rgba(255,222,196,0) 55%), radial-gradient(90% 80% at 0% 100%, rgba(184,74,22,0.55) 0%, rgba(184,74,22,0) 60%), linear-gradient(135deg, #F48245 0%, #EE6E2D 50%, #D9601F 100%)",
            } as React.CSSProperties
          }
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,390px)] lg:gap-7">
            <div className="flex min-w-0 flex-col justify-between gap-6 py-1 lg:py-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#14252E]/75">
                  <LpIcon name="bolt" size={17} strokeWidth={2} />
                  Bills and top-ups
                </div>
                <h2 className="m-0 mt-4 text-[34px] font-semibold leading-[1.08] tracking-[-1.2px] sm:text-[40px]">
                  Pay.
                  <br />
                  Top up.
                  <br />
                  Renew.
                </h2>
              </div>
              <p className="m-0 max-w-[340px] text-[15px] leading-[1.6] text-[#14252E]/80 sm:text-base">
                Airtime, data, electricity and TV, paid in seconds. Pick a
                service, enter the number and you&apos;re done.
              </p>
            </div>
            <PayBillForm bill={bill} />
          </div>
        </div>

        <SummaryCard bill={bill} className="xl:order-1" />
        <SpendCard className="xl:order-3" />
      </div>
    </section>
  );
}
