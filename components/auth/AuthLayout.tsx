import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import HatisoLogo from "@/components/brand/HatisoLogo";

/**
 * Two-column frame for every auth screen: the Carbon brand panel on the left (desktop) and the form on Cloud.
 * `aside` is the line in the top-right corner ("New to Hatiso? Create an account"); `width` caps the form column.
 */
export default function AuthLayout({
  children,
  aside,
  back,
  width = 420,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
  /** Top-left "Back" link from the boards: a URL, or a handler for in-page steps. */
  back?: { label?: string; href?: string; onClick?: () => void };
  width?: number;
}) {
  const backClass =
    "hz-press inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grey-800 hover:text-carbon";
  const backContent = back ? (
    <>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {back.label ?? "Back"}
    </>
  ) : null;
  return (
    <div className="grid min-h-screen bg-cloud text-carbon lg:grid-cols-2">
      <AuthBrandPanel />
      <main className="flex min-h-screen min-w-0 flex-col bg-cloud px-5 py-8 sm:px-10 lg:px-[clamp(20px,5vw,72px)]">
        <div className="flex min-h-11 items-center justify-between gap-4">
          {back ? (
            back.href ? (
              <Link href={back.href} className={backClass}>
                {backContent}
              </Link>
            ) : (
              <button type="button" onClick={back.onClick} className={backClass}>
                {backContent}
              </button>
            )
          ) : (
            <span className="lg:hidden">
              <HatisoLogo variant="carbon" height={26} />
            </span>
          )}
          {aside ? (
            <div className="ml-auto text-sm text-grey-600">{aside}</div>
          ) : null}
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <div
            className="hz-stagger flex w-full flex-col gap-8"
            style={{ maxWidth: width }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Heading block used at the top of each auth screen. */
export function AuthHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {eyebrow ? <p className="hz-eyebrow text-grey-600">{eyebrow}</p> : null}
      <h1 className="text-[clamp(32px,4vw,40px)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">
        {title}
      </h1>
      {children ? (
        <p className="text-base leading-relaxed text-grey-600">{children}</p>
      ) : null}
    </div>
  );
}

/** Shared class strings for auth buttons and links. */
export const AUTH_PRIMARY =
  "hz-press flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-carbon text-[15px] font-medium text-cloud hover:bg-graphite disabled:opacity-50";
export const AUTH_SECONDARY =
  "hz-press flex min-h-13 w-full items-center justify-center gap-2 rounded-xl border border-grey-150 bg-white text-[15px] font-medium text-carbon hover:border-grey-400 disabled:opacity-50";
export const AUTH_LINK =
  "font-medium text-carbon underline decoration-carbon underline-offset-4 hover:decoration-grey-400";
export const AUTH_ERROR =
  "rounded-lg border border-status-error/30 bg-status-error/8 px-3.5 py-3 text-sm text-status-error";
