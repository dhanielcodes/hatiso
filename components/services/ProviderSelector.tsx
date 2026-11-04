'use client';

import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';

export interface ProviderItem {
  id: string;
  name: string;
  imageSrc?: string;
}

export type ProviderSelectorType = 'name' | 'image';

interface ProviderSelectorProps {
  label?: string;
  providers: ProviderItem[];
  selectedId: string;
  onSelect: (id: string, name: string) => void;
  type?: ProviderSelectorType;
}

export default function ProviderSelector({
  label = 'Select biller',
  providers,
  selectedId,
  onSelect,
  type = 'image',
}: ProviderSelectorProps) {
  return (
    <div className="w-full">
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </label>

      {/* Light ice-blue container matching the Figma mockup */}
      <div className="rounded-2xl bg-[#EEF7FB] p-3 sm:p-4">
        <div
          className={`grid items-center gap-2 sm:gap-3 ${providers.length === 5 ? 'grid-cols-5' : 'grid-cols-4'
            }`}
        >
          {providers.map((item) => {
            const isSelected = selectedId.toLowerCase() === item.id.toLowerCase();

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id, item.name)}
                className={`relative flex flex-col items-center justify-center transition-all duration-200 focus:outline-none ${isSelected
                  ? 'rounded-2xl border border-[#E95312] bg-[#FBF2ED] py-3 px-1.5 sm:px-2 shadow-xs'
                  : 'rounded-2xl border border-transparent py-3 px-1.5 sm:px-2 hover:bg-white/60'
                  }`}
              >
                {type === 'image' ? (
                  <>
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-xs font-bold text-[#204657] sm:h-12 sm:w-12">
                      {item.imageSrc ? (
                        <Image
                          src={item.imageSrc}
                          alt={`${item.name} provider`}
                          fill
                          sizes="48px"
                          className="object-contain transition-transform duration-200 hover:scale-105"
                        />
                      ) : (
                        item.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="mt-1.5 text-center text-[11px] font-bold text-[#102A36] line-clamp-1 sm:text-xs">
                      {item.name}
                    </span>
                  </>
                ) : (
                  <span className="flex min-h-12 items-center text-center text-xs font-bold leading-snug text-[#102A36] sm:text-sm">
                    {item.name}
                  </span>
                )}

                {/* Bottom Selection Checkmark or Equal-Height Spacer */}
                <div className="mt-1 flex h-4 w-4 items-center justify-center">
                  {isSelected ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E95312] text-white shadow-xs">
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

