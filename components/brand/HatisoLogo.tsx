import Image from 'next/image';
import Link from 'next/link';

/**
 * Brand colour of the wordmark (see public/brand/). Pick by background:
 * - `cloud` (#F1F2F4): on dark backgrounds (navbar, footer, sidebar, auth panel)
 * - `carbon` (#12151A): on light backgrounds
 * - `graphite` (#23272F): also fine on light
 * - `white` / `black`: single-colour use only
 */
export type HatisoLogoVariant = 'carbon' | 'graphite' | 'cloud' | 'white' | 'black';

/** The artwork is 4211 × 1196. */
const RATIO = 4211 / 1196;

export interface HatisoLogoProps {
  variant?: HatisoLogoVariant;
  /** Rendered height in px; width follows the artwork's ratio. */
  height?: number;
  /** Wrap in a link. Pass `null` for a plain image. */
  href?: string | null;
  className?: string;
  priority?: boolean;
}

export default function HatisoLogo({ variant = 'cloud', height = 32, href = '/', className = '', priority }: HatisoLogoProps) {
  const image = (
    <Image
      src={`/brand/hatiso-logo-${variant}.svg`}
      alt="Hatiso"
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      unoptimized
      className="block h-auto max-w-full"
      style={{ height, width: 'auto' }}
    />
  );

  if (href === null) return <span className={`inline-flex ${className}`}>{image}</span>;
  return (
    <Link href={href} aria-label="Hatiso home" className={`inline-flex ${className}`}>
      {image}
    </Link>
  );
}
