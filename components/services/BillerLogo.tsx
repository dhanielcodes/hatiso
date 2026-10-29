'use client';

import React, { useState } from 'react';

interface BillerLogoProps {
  id: 'mtn' | 'airtel' | '9mobile' | 'glo' | string;
  className?: string;
}

export default function BillerLogo({ id, className = 'h-10 w-10' }: BillerLogoProps) {
  const [imgError, setImgError] = useState(false);

  // Exact image source extracted from the official design mockup
  const imgSrc = `/images/biller_${id.toLowerCase()}_hq.png`;

  if (!imgError) {
    return (
      <img
        src={imgSrc}
        alt={`${id} logo`}
        className={`${className} rounded-full object-cover shadow-sm transition-transform duration-200 group-hover:scale-105`}
        onError={() => setImgError(true)}
      />
    );
  }

  // High-fidelity vector SVG fallback
  switch (id.toLowerCase()) {
    case 'mtn':
      return (
        <div className={`${className} flex items-center justify-center rounded-full bg-[#FFCC00] shadow-sm`}>
          <div className="flex h-5 w-8 items-center justify-center rounded-full border border-black/80">
            <span className="text-[9px] font-black italic tracking-tighter text-black">MTN</span>
          </div>
        </div>
      );
    case 'airtel':
      return (
        <div className={`${className} flex items-center justify-center rounded-full bg-[#ED1C24] shadow-sm`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
            <path d="M12 4C7.58 4 4 7.58 4 12c0 3.31 2.02 6.16 4.9 7.37.14-.3.26-.64.38-1.01-1.92-1.07-3.28-3.08-3.28-5.36 0-3.31 2.69-6 6-6s6 2.69 6 6c0 2.28-1.36 4.29-3.28 5.36.12.37.24.71.38 1.01C17.98 18.16 20 15.31 20 12c0-4.42-3.58-8-8-8z" />
          </svg>
        </div>
      );
    case '9mobile':
      return (
        <div className={`${className} flex items-center justify-center rounded-full bg-[#005934] shadow-sm`}>
          <div className="flex items-center gap-0.5">
            <span className="text-[13px] font-black text-[#84BD00] leading-none">9</span>
            <div className="h-2 w-2 rounded-full bg-[#84BD00]" />
          </div>
        </div>
      );
    case 'glo':
      return (
        <div className={`${className} flex items-center justify-center rounded-full bg-[#28B446] shadow-sm`}>
          <span className="text-[11px] font-black tracking-tight text-white leading-none">glo</span>
        </div>
      );
    default:
      return (
        <div className={`${className} flex items-center justify-center rounded-full bg-slate-700 text-white text-xs font-bold`}>
          {id.slice(0, 2).toUpperCase()}
        </div>
      );
  }
}

