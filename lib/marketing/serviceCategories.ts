import type { LpIconName } from '@/components/landing/LandingKit';
import type { PayBillService } from '@/components/marketplace/HeroSection';
import type { DigitalServiceBiller, DigitalServiceCategory, DigitalServiceProduct } from '@/lib/api/digitalServices';

/**
 * How the categories from `GET /digital-services/categories` show up on the public pages.
 *
 * One API category can give more than one service: TELCO holds both airtime (the "… Airtime VTU"
 * products) and data bundles, so it becomes an Airtime card and a Data card. Both fetch the TELCO
 * catalogue and `billersForService` keeps only the products that belong to each.
 * INTERNET_SERVICES (Smile, Spectranet, …) is its own service.
 */
export type ServiceCategoryMeta = {
  slug: string;
  label: string;
  icon: LpIconName;
  category: DigitalServiceCategory;
  /** The home payment card tab this service opens, when the card handles it. */
  pay?: PayBillService;
};

const SERVICES_BY_CATEGORY: Record<DigitalServiceCategory, Omit<ServiceCategoryMeta, 'category'>[]> = {
  TELCO: [
    { slug: 'airtime', label: 'Airtime', icon: 'phone', pay: 'airtime' },
    { slug: 'data', label: 'Data', icon: 'data', pay: 'data' },
  ],
  INTERNET_SERVICES: [{ slug: 'internet-services', label: 'Internet services', icon: 'wifi' }],
  DISCO: [{ slug: 'electricity', label: 'Electricity', icon: 'bolt', pay: 'electricity' }],
  CABLE: [{ slug: 'tv', label: 'TV', icon: 'tv', pay: 'tv' }],
  EDUCATION: [{ slug: 'education', label: 'Education', icon: 'edu' }],
  INSURANCE: [{ slug: 'insurance', label: 'Insurance', icon: 'shield' }],
  OTHER_SERVICES: [{ slug: 'other-services', label: 'Other services', icon: 'bag' }],
};

/** The services a category gives, with a readable fallback if the API adds a category we don't know yet. */
export function servicesForCategory(category: string): ServiceCategoryMeta[] {
  const known = SERVICES_BY_CATEGORY[category as DigitalServiceCategory];
  if (known) return known.map((s) => ({ ...s, category: category as DigitalServiceCategory }));
  const words = category.toLowerCase().split(/[_\s]+/).filter(Boolean);
  return [
    {
      slug: words.join('-'),
      label: words.map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' '),
      icon: 'bag',
      category: category as DigitalServiceCategory,
    },
  ];
}

/** URL slug → API category, for /services/[slug] and /categories/[slug]. */
export const CATEGORY_BY_SLUG: Record<string, DigitalServiceCategory> = Object.fromEntries(
  (Object.entries(SERVICES_BY_CATEGORY) as [DigitalServiceCategory, { slug: string }[]][]).flatMap(([category, services]) =>
    services.map((s) => [s.slug, category]),
  ),
);

/** Airtime products are the ones named "… Airtime VTU" (or "International Airtime"). */
export function isAirtimeProduct(product: Pick<DigitalServiceProduct, 'name'>) {
  return /\b(vtu|airtime)\b/i.test(product.name);
}

/** Services that buy one fixed product per biller, so the form picks it and hides the product dropdown. */
export const SINGLE_PRODUCT_SERVICES = new Set(['airtime']);

/**
 * Narrows a category's catalogue to one service: airtime keeps only the airtime products,
 * data keeps everything else. Billers left with no products are dropped.
 */
export function billersForService(slug: string, billers: DigitalServiceBiller[]): DigitalServiceBiller[] {
  const keep =
    slug === 'airtime' ? isAirtimeProduct : slug === 'data' ? (p: DigitalServiceProduct) => !isAirtimeProduct(p) : null;
  if (!keep) return billers;
  return billers
    .map((biller) => ({ ...biller, products: biller.products.filter(keep) }))
    .filter((biller) => biller.products.length > 0);
}
