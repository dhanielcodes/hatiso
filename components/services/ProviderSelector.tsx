'use client';

import React, { useState } from 'react';
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

/** Up to three letters for a provider without a logo ("MTN", "9M", "AT"). */
export function providerShort(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Local logos for providers the API sends without a `logoUrl`, keyed by biller code. */
const LOCAL_PROVIDER_LOGOS: Record<string, string> = {
  mtn: '/images/network_mtn.png',
  airtel: '/images/network_airtel.png',
  glo: '/images/network_glo.png',
  '9mobile': '/images/network_9mobile.png',
  dstv: '/images/tv_dstv.png',
  gotv: '/images/tv_gotv.png',
  startimes: '/images/tv_startimes.png',
  showmax: '/images/tv_showmax.png',
  ikeja: '/images/elec_ikeja.png',
  'ikeja-electric': '/images/elec_ikeja.png',
  ibedc: '/images/elec_ibedc.png',
  'ibadan-electric': '/images/elec_ibedc.png',
  ekedc: '/images/elec_ekedc.png',
  'eko-electric': '/images/elec_ekedc.png',
  jos: '/images/elec_jos.png',
  'jos-electric': '/images/elec_jos.png',
  kaduna: '/images/elec_kaduna.png',
  'kaduna-electric': '/images/elec_kaduna.png',
};

/** The provider's logo: the API's `logoUrl` first, then a local image, otherwise nothing (show initials). */
export function providerLogoSrc(biller: { billerCode: string; logoUrl?: string }) {
  return biller.logoUrl || LOCAL_PROVIDER_LOGOS[biller.billerCode.toLowerCase()];
}

/**
 * A provider's logo inside its square tile, falling back to its initials when there's no logo
 * or the image fails to load. `unoptimized` because the logos come from the provider's CDN.
 */
export function ProviderLogo({ name, src, sizes = '44px' }: { name: string; src?: string; sizes?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <>{providerShort(name)}</>;
  return <Image src={src} alt="" fill sizes={sizes} unoptimized className="object-contain" onError={() => setFailed(src)} />;
}

/** Service board "Network" picker: white cards with a logo square, a check when picked, and the name. */
export default function ProviderSelector({
  label = 'Select biller',
  providers,
  selectedId,
  onSelect,
  type = 'image',
}: ProviderSelectorProps) {
  return (
    <fieldset className="flex w-full flex-col gap-3">
      <legend className="mb-3 text-sm font-medium text-tone-744">{label}</legend>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(120px,100%),1fr))] gap-2.5">
        {providers.map((item) => {
          const isSelected = selectedId.toLowerCase() === item.id.toLowerCase();
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(item.id, item.name)}
              className={`hz-press flex flex-col items-start gap-3.5 rounded-lg bg-surface p-3.5 text-left text-tone-744 transition-colors ${
                isSelected ? 'border-2 border-brand-305 p-[13px]' : 'border border-tone-100 hover:border-tone-414'
              }`}
            >
              <span className="flex w-full items-start justify-between">
                <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-tone-44 text-xs font-bold text-tone-714">
                  {type === 'image' ? <ProviderLogo name={item.name} src={item.imageSrc} sizes="36px" /> : providerShort(item.name)}
                </span>
                {isSelected && (
                  <span className="hz-pop flex h-[22px] w-[22px] items-center justify-center rounded-full bg-brand-305 text-on-brand">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
              </span>
              <span className="line-clamp-1 text-[15px] font-medium">{item.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
