import React from "react";
import Link from "next/link";

/**
 * Building blocks shared by the landing pages (home, service, banks, contact), taken from the
 * "Hatiso Web Redesign" file. Colours are the design's own:
 *   ink #0A1014 (hero) · navy #10202A (dark tiles) · slate #233C49 · orange #EE6E2D / #E2591A
 */

/** Outline icon paths straight from the design (24×24, stroke). */
export const LP_ICONS = {
  phone:
    "M8 2.5h8a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1zM11 18.5h2",
  data: "M5 19v-3M10 19v-6M15 19v-9M20 19V5",
  bolt: "M13 2.5 5.5 13.5H12l-1 8 7.5-11H12z",
  tv: "M4 6.5h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1zM8.5 2.5 12 6.5l3.5-4M9 22h6",
  dice: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01",
  edu: "M2.5 9.5 12 5l9.5 4.5L12 14zM6.5 11.5v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.5M21.5 9.5v5",
  gov: "M4 21V9h7v12M11 21V4h9v17M2.5 21h19M14 7.5h3M14 11h3M14 14.5h3M6.5 12.5h2M6.5 16h2",
  bag: "M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2",
  embassy:
    "M3 9.5 12 4l9 5.5zM5 9.5V18M9.5 9.5V18M14.5 9.5V18M19 9.5V18M3 21h18M3.5 18h17",
  bus: "M5 3.5h14a1 1 0 0 1 1 1v13H4v-13a1 1 0 0 1 1-1zM4 11h16M7.5 17.5V21M16.5 17.5V21M8 14.5h.01M16 14.5h.01",
  shield:
    "M12 2.5 4.5 5.5v6c0 4.5 3.2 8.4 7.5 10 4.3-1.6 7.5-5.5 7.5-10v-6zM9.5 12h5M12 9.5v5",
  card: "M4 6h16v12H4zM16 12h4M4 9h16",
  pin: "M12 21.5s-7-6.2-7-11.5a7 7 0 0 1 14 0c0 5.3-7 11.5-7 11.5zM12 7.5v5M9.5 10h5",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5",
  mail: "M3 5.5h18v13H3zM3.5 6l8.5 7 8.5-7",
  chat: "M4 5h16v11H9l-5 4z",
  call: "M5 3.5h4l1.5 4.5-2.5 1.5a11 11 0 0 0 6.5 6.5l1.5-2.5 4.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5A17 17 0 0 1 3.5 5 1.5 1.5 0 0 1 5 3.5z",
  location:
    "M12 21.5s-7-6.2-7-11.5a7 7 0 0 1 14 0c0 5.3-7 11.5-7 11.5zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  arrow: "M7 17 17 7M9 7h8v8",
  wifi: "M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0M12 19.5h.01",
} as const;

export type LpIconName = keyof typeof LP_ICONS;

export function LpIcon({
  name,
  size = 22,
  strokeWidth = 1.6,
  className = "",
}: {
  name: LpIconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      <path d={LP_ICONS[name]} />
    </svg>
  );
}

/** Page wrapper: landing font, tabular numbers, design's slate base colour. */
export function LandingPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#233C49] font-jakarta text-white tabular-nums selection:bg-[#EE6E2D] selection:text-[#14252E]">
      {children}
    </div>
  );
}

/** The near-black block that holds the navbar, hero and features row. */
export function DarkHero({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-[#0A1014] text-white">
      {children}
    </div>
  );
}

export const lpContainer = "mx-auto w-full max-w-[1280px] px-4 sm:px-6";

/** Display heading font size used by every hero. */
export const lpHeroTitle =
  "m-0 text-[36px] font-semibold leading-[1.15] tracking-[-1.2px] sm:text-[46px] lg:text-[54px] lg:tracking-[-1.6px]";

export const lpSectionTitle =
  "m-0 text-[30px] font-semibold leading-[1.15] tracking-[-1px] sm:text-[38px] sm:tracking-[-1.2px]";

/** Light pill used above section titles. */
export function SectionPill({
  children,
  dot = false,
  className = "bg-white",
}: {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-[#E3E8EB] px-3.5 py-[7px] text-[13px] font-semibold text-[#4A5B64] ${className}`}
    >
      {dot && (
        <span className="lp-ping h-[7px] w-[7px] rounded-full bg-[#3FAE70]" />
      )}
      {children}
    </div>
  );
}

/** Staggered hero headline: each line rises in turn; `accent` lines are orange. */
export function HeroHeadline({
  lines,
}: {
  lines: { text: string; accent?: boolean }[];
}) {
  return (
    <h1 className={lpHeroTitle}>
      {lines.map((line, i) => (
        <span
          key={line.text}
          className="lp-rise block"
          style={{ "--d": `${0.12 + i * 0.1}s` } as React.CSSProperties}
        >
          {line.accent ? (
            <span className="text-[#EE6E2D]">{line.text}</span>
          ) : (
            line.text
          )}
        </span>
      ))}
    </h1>
  );
}

export function HeroLead({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`lp-rise mt-7 max-w-[540px] ${className} text-base leading-[1.65] text-[#9AA8B0] sm:mt-[34px] sm:text-[19px]`}
      style={{ "--d": "0.44s" } as React.CSSProperties}
    >
      {children}
    </p>
  );
}

/** White pill with an icon, an input and an orange action — the hero's main control. */
export function HeroPillInput({
  icon,
  label,
  action,
  onAction,
  inputProps,
  className = "",
}: {
  className?: string;
  icon: LpIconName;
  label: string;
  action: string;
  onAction: () => void;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <form
      className={`lp-rise mt-9 flex max-w-[560px] ${className} items-center gap-2.5 rounded-full bg-[#EEF1F3] py-[7px] pl-5 pr-[7px] text-[#10202A] sm:pl-[22px]`}
      style={{ "--d": "0.56s" } as React.CSSProperties}
      onSubmit={(e) => {
        e.preventDefault();
        onAction();
      }}
    >
      <LpIcon name={icon} className="text-[#5D6F78]" />
      <label className="sr-only" htmlFor={inputProps.id}>
        {label}
      </label>
      <input
        {...inputProps}
        className="min-w-0 flex-1 bg-transparent py-3.5 text-base text-[#10202A] outline-none placeholder:text-[#5D6F78] sm:text-[17px]"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-[#EE6E2D] px-5 py-4 text-[15px] font-extrabold text-[#14252E] transition hover:bg-[#F48245] active:scale-[0.98] sm:px-[30px] sm:py-[17px] sm:text-[17px]"
      >
        {action}
      </button>
    </form>
  );
}

/** "Pay  MTN  Airtel …" line under the hero input. */
export function ProviderRow({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div
      className="lp-rise mt-12 max-w-[600px] border-t border-[#1E2A31] pt-[22px]"
      style={{ "--d": "0.68s" } as React.CSSProperties}
    >
      <div className="flex flex-wrap items-center gap-x-[26px] gap-y-2.5">
        <span className="text-sm text-[#9AA8B0]">{label}</span>
        {items.map((item) => (
          <span key={item} className="text-[17px] font-semibold text-[#DCE3E7]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export type Feature = { icon: LpIconName; title: string; body: string };

/** Four-up "why Hatiso" row that closes the dark hero. */
export function FeatureRow({ items }: { items: Feature[] }) {
  return (
    <section
      aria-label="Why Hatiso"
      className={`${lpContainer} relative grid gap-8 border-t border-[#1E2A31] pb-[88px] pt-8 sm:grid-cols-2 lg:grid-cols-4`}
    >
      {items.map((f) => (
        <div key={f.title} className="lp-reveal flex min-w-0 gap-4">
          <LpIcon name={f.icon} size={34} className="text-[#EE6E2D]" />
          <div>
            <div className="text-[19px] font-bold">{f.title}</div>
            <p className="mt-1.5 text-[15px] leading-[1.55] text-[#9AA8B0]">
              {f.body}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

/** Tilted gradient cards; `variant` picks the design's blue, orange or peach card. */
const CARD_STYLES = [
  {
    bg: "linear-gradient(150deg, #2F6A93 0%, #233C49 55%, #10202A 100%)",
    fg: "#FFFFFF",
  },
  {
    bg: "linear-gradient(150deg, #FFB27A 0%, #EE6E2D 50%, #B84A16 100%)",
    fg: "#14252E",
  },
  {
    bg: "linear-gradient(150deg, #FFF3E8 0%, #F6C9A6 60%, #EE9A62 100%)",
    fg: "#14252E",
  },
];

const FAN = [
  { left: "4%", bottom: "-60px", r: "-7deg", d: "0.2s", f: "6s" },
  { left: "33%", bottom: "-20px", r: "-1deg", d: "0.35s", f: "7s" },
  { left: "60%", bottom: "-80px", r: "6.5deg", d: "0.5s", f: "8s" },
];

export function FannedCards({ labels }: { labels: [string, string, string] }) {
  return (
    <>
      {labels.map((label, i) => (
        <div
          key={label}
          aria-hidden="true"
          className="lp-card absolute flex aspect-[0.66] w-[34%] max-w-[250px] flex-col justify-between rounded-[26px] p-[22px]"
          style={
            {
              left: FAN[i].left,
              bottom: FAN[i].bottom,
              background: CARD_STYLES[i].bg,
              color: CARD_STYLES[i].fg,
              "--r": FAN[i].r,
              "--d": FAN[i].d,
              "--f": FAN[i].f,
            } as React.CSSProperties
          }
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-base font-bold leading-[1.1] sm:text-xl">
              {label}
            </span>
            <span className="h-[26px] w-[34px] shrink-0 rounded-md border-[1.5px] border-current opacity-55" />
          </div>
          <span className="text-[17px] font-bold opacity-85">Hatiso</span>
        </div>
      ))}
    </>
  );
}

/** Ring of labels slowly orbiting a tilted Hatiso card. Labels are spaced evenly from the top. */
export function Orbit({ labels }: { labels: string[] }) {
  return (
    <div aria-hidden="true" className="relative mt-2.5 h-[300px]">
      <div className="lp-orbit absolute left-1/2 top-1/2 -ml-[150px] -mt-[150px] h-[300px] w-[300px] rounded-full border border-[#D5DCE0]">
        {labels.map((label, i) => {
          const angle = (i / labels.length) * Math.PI * 2;
          return (
            <span
              key={label}
              className="absolute whitespace-nowrap rounded-full border border-[#E3E8EB] bg-white px-3 py-2 text-xs font-bold text-[#233C49]"
              style={{
                left: `${(50 + 44 * Math.sin(angle)).toFixed(1)}%`,
                top: `${(50 - 44 * Math.cos(angle)).toFixed(1)}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
      <div
        className="lp-card absolute left-1/2 top-1/2 -ml-[110px] -mt-[68px] flex h-[136px] w-[220px] flex-col justify-between rounded-[18px] p-4 text-white"
        style={
          {
            background:
              "linear-gradient(135deg, #233C49 0%, #3A6A88 55%, #EE6E2D 130%)",
            "--r": "-7deg",
            "--d": "0.3s",
            "--f": "7s",
          } as React.CSSProperties
        }
      >
        <span className="text-sm font-extrabold">Hatiso</span>
        <span className="text-xs tracking-[1.5px] opacity-85">
          •••• •••• 2026
        </span>
      </div>
    </div>
  );
}

export type BentoAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export function OrangePill({
  action,
  className = "",
}: {
  action: BentoAction;
  className?: string;
}) {
  const cls = `inline-block rounded-full bg-[#EE6E2D] px-7 py-4 text-base font-bold text-[#14252E] transition hover:bg-[#F48245] active:scale-[0.98] ${className}`;
  if (action.href) {
    return (
      <Link href={action.href} className={cls}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={cls}>
      {action.label}
    </button>
  );
}

export type BentoContent = {
  hero: {
    title: string;
    body: string;
    action: BentoAction;
    cards: [string, string, string];
  };
  orbit: { title: string; body: string; labels: string[] };
  stats: [
    { tag: string; value: string; caption: string },
    { tag: string; value: string; caption: string },
  ];
};

/**
 * The bento grid: a tall dark tile with fanned cards, a wide orbit tile and two stat tiles.
 * `tone` is the section background (white on home, light grey elsewhere).
 */
export function BentoTiles({
  content,
  tone = "grey",
  label,
}: {
  content: BentoContent;
  tone?: "white" | "grey";
  label: string;
}) {
  const { hero, orbit, stats } = content;
  return (
    <section
      aria-label={label}
      className={tone === "white" ? "bg-white" : "bg-[#F3F4F5]"}
    >
      <div
        className={`${lpContainer} grid gap-4 py-16 sm:py-[88px] lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.5fr)_minmax(0,0.5fr)]`}
      >
        <div className="lp-reveal relative min-h-[520px] overflow-hidden rounded-[32px] bg-[#10202A] px-7 pt-10 text-white sm:min-h-[620px] sm:px-12 sm:pt-12 lg:row-span-2">
          <h2 className={`${lpSectionTitle} max-w-[560px]`}>{hero.title}</h2>
          <p className="mt-4 max-w-[460px] text-[17px] leading-[1.6] text-[#B9C6CD]">
            {hero.body}
          </p>
          <OrangePill action={hero.action} className="mt-7" />
          <FannedCards labels={hero.cards} />
        </div>

        <div className="lp-reveal overflow-hidden rounded-[32px] bg-[#EEF1F3] px-7 pb-5 pt-9 text-[#10202A] sm:px-9 lg:col-span-2">
          <h3 className="m-0 text-[26px] font-bold tracking-[-1px] sm:text-[32px]">
            {orbit.title}
          </h3>
          <p className="mt-2.5 text-base leading-[1.55] text-[#4A5B64]">
            {orbit.body}
          </p>
          <Orbit labels={orbit.labels} />
        </div>

        <div className="lp-reveal flex min-h-[240px] flex-col justify-between rounded-[32px] bg-[#EEF1F3] p-7 text-[#10202A]">
          <span className="self-start rounded-full bg-white px-3.5 py-2 text-sm font-semibold">
            {stats[0].tag}
          </span>
          <div>
            <span className="text-[52px] font-bold leading-none tracking-[-2.5px] sm:text-[60px]">
              {stats[0].value}
            </span>{" "}
            <span className="text-[15px] text-[#4A5B64]">
              {stats[0].caption}
            </span>
          </div>
        </div>

        <div className="lp-reveal flex min-h-[240px] flex-col justify-between rounded-[32px] bg-[#10202A] p-7 text-white">
          <span className="self-start rounded-full bg-[#2C4856] px-3.5 py-2 text-sm font-semibold">
            {stats[1].tag}
          </span>
          <div>
            <span className="text-[48px] font-bold leading-none tracking-[-2px] sm:text-[56px]">
              {stats[1].value}
            </span>{" "}
            <span className="text-[15px] opacity-80">{stats[1].caption}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
