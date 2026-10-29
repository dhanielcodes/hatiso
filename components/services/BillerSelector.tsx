'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export interface BillerOption {
  id: 'mtn' | 'airtel' | '9mobile' | 'glo' | string;
  name: string;
  imageSrc: string;
}

export const NETWORK_BILLERS: BillerOption[] = [
  {
    id: 'mtn',
    name: 'MTN',
    imageSrc: '/images/network_mtn.png',
  },
  {
    id: 'airtel',
    name: 'Airtel',
    imageSrc: '/images/network_airtel.png',
  },
  {
    id: '9mobile',
    name: '9mobile',
    imageSrc: '/images/network_9mobile.png',
  },
  {
    id: 'glo',
    name: 'Glo',
    imageSrc: '/images/network_glo.png',
  },
];

interface BillerSelectorProps {
  selectedBiller: string;
  onSelectBiller: (id: string, name: string) => void;
}

export default function BillerSelector({
  selectedBiller,
  onSelectBiller,
}: BillerSelectorProps) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        Select biller
      </label>

      {/* Light ice-blue container matching the Figma mockup */}
      <div className="rounded-2xl bg-[#EEF7FB] p-3 sm:p-4">
        <div className="grid grid-cols-4 items-center gap-2 sm:gap-3">
          {NETWORK_BILLERS.map((biller) => {
            const isSelected = selectedBiller.toLowerCase() === biller.id.toLowerCase();

            return (
              <button
                key={biller.id}
                type="button"
                onClick={() => onSelectBiller(biller.id, biller.name)}
                className={`relative flex flex-col items-center justify-center transition-all duration-200 focus:outline-none ${isSelected
                    ? 'rounded-2xl sm:rounded-3xl border border-[#FF6500] bg-[#FBF2ED] py-3.5 px-2 shadow-xs'
                    : 'rounded-2xl sm:rounded-3xl border border-transparent py-3.5 px-2 hover:bg-white/60'
                  }`}
              >
                {/* Circular Network Logo (Crisp HD 148px asset from mockup) */}
                <div className="relative h-11 w-11 sm:h-13 sm:w-13 overflow-hidden rounded-full flex-shrink-0">
                  <Image
                    src={biller.imageSrc}
                    alt={`${biller.name} network`}
                    fill
                    sizes="52px"
                    className="object-contain transition-transform duration-200 hover:scale-105"
                  />
                </div>

                {/* Network Name */}
                <span className="mt-2 text-xs sm:text-sm font-bold text-[#102A36]">
                  {biller.name}
                </span>

                {/* Bottom Selection Checkmark or Equal-Height Spacer */}
                <div className="mt-1.5 flex h-4 w-4 items-center justify-center">
                  {isSelected ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6500] text-white shadow-xs">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="h-4 w-4 opacity-0" aria-hidden="true" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

