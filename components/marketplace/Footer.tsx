'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1B3C4A] px-6 pt-16 pb-12 sm:px-12 lg:px-20 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Top Section: Brand Info + Navigation Columns */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Brand Column (5 cols) */}
          <div className="space-y-5 lg:col-span-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <svg
                viewBox="0 0 44 38"
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Geometric woven X mark in brand orange */}
                <path d="M4 8L16 20L24 12L12 0L4 8Z" fill="#FF6500" />
                <path d="M36 8L24 20L32 28L44 16L36 8Z" fill="#FF6500" />
                <path d="M12 38L24 26L16 18L4 30L12 38Z" fill="#FF7844" />
                <path d="M44 22L32 10L24 18L36 30L44 22Z" fill="#E84D15" />
                <path d="M20 14L28 22L24 26L16 18L20 14Z" fill="#FF6500" />
              </svg>
              <span className="text-2xl font-black tracking-widest text-white">
                NETT
              </span>
            </Link>

            {/* Tagline */}
            <p className="max-w-xs text-sm sm:text-base leading-relaxed text-slate-300/80 font-normal">
              Hatīso. Services, banking, and
              <br />
              business. All in one place.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/70 bg-white/[0.03] text-slate-300 transition-all duration-200 hover:border-white hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.63 1.63 0 1 0 0-3.26 1.63 1.63 0 0 0 0 3.26m1.4 9.74V9.93H5.06v8.57h2.8z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/70 bg-white/[0.03] text-slate-300 transition-all duration-200 hover:border-white hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/70 bg-white/[0.03] text-slate-300 transition-all duration-200 hover:border-white hover:bg-white/10 hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/70 bg-white/[0.03] text-slate-300 transition-all duration-200 hover:border-white hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Navigation Columns (7 cols) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Column 1: Digital Services */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Digital Services
              </h3>
              <ul className="space-y-3 text-sm text-slate-300/80">
                <li>
                  <Link
                    href="/categories/airtime"
                    className="transition-colors hover:text-white"
                  >
                    Airtime
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/data"
                    className="transition-colors hover:text-white"
                  >
                    Data
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/electricity"
                    className="transition-colors hover:text-white"
                  >
                    Electricity
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/betting"
                    className="transition-colors hover:text-white"
                  >
                    Betting
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/tv"
                    className="transition-colors hover:text-white"
                  >
                    TV
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Business */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Business
              </h3>
              <ul className="space-y-3 text-sm text-slate-300/80">
                <li>
                  <Link
                    href="/banks"
                    className="transition-colors hover:text-white"
                  >
                    Banks
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Company
              </h3>
              <ul className="space-y-3 text-sm text-slate-300/80">
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-white"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-slate-700/50 sm:my-12" />

        {/* Bottom Bar: Copyright & Legal */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs sm:text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 text-[10px] font-medium leading-none">
              c
            </span>
            <span>2026 Xnett. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              Terms of use
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
