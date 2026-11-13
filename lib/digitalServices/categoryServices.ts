import type { DigitalServiceBiller, DigitalServiceCategory, DigitalServiceProduct } from '@/lib/api/digitalServices';

/**
 * How the categories from `GET /digital-services/categories` show up as services.
 *
 * One API category can give more than one service: TELCO holds both airtime (the "… Airtime VTU"
 * products) and data bundles, so it becomes an Airtime service and a Data service. Both fetch the
 * TELCO catalogue and `billersForService` keeps only the products that belong to each.
 * INTERNET_SERVICES (Smile, Spectranet, …) is its own service.
 */
export type CategoryService = {
  slug: string;
  label: string;
  category: DigitalServiceCategory;
  /** Which of the existing card/tab icons to use. */
  visualSlug: string;
};

const SERVICES_BY_CATEGORY: Record<DigitalServiceCategory, Omit<CategoryService, 'category'>[]> = {
  TELCO: [
    { slug: 'airtime', label: 'Airtime', visualSlug: 'airtime' },
    { slug: 'data', label: 'Data', visualSlug: 'data' },
  ],
  INTERNET_SERVICES: [{ slug: 'internet-services', label: 'Internet Services', visualSlug: 'data' }],
  DISCO: [{ slug: 'electricity', label: 'Electricity', visualSlug: 'electricity' }],
  CABLE: [{ slug: 'tv', label: 'Cable TV', visualSlug: 'tv' }],
  EDUCATION: [{ slug: 'education', label: 'Education', visualSlug: 'education' }],
  INSURANCE: [{ slug: 'insurance', label: 'Insurance', visualSlug: 'government-services' }],
  OTHER_SERVICES: [{ slug: 'other-services', label: 'Other Services', visualSlug: 'shopping' }],
};

/** The services a category gives (none for a category we don't know yet). */
export function servicesForCategory(category: DigitalServiceCategory): CategoryService[] {
  return (SERVICES_BY_CATEGORY[category] ?? []).map((service) => ({ ...service, category }));
}

/** URL slug → API category, for /services/[slug] and /categories/[slug]. */
export const CATEGORY_BY_SLUG: Record<string, DigitalServiceCategory> = Object.fromEntries(
  (Object.entries(SERVICES_BY_CATEGORY) as [DigitalServiceCategory, { slug: string }[]][]).flatMap(([category, services]) =>
    services.map((service) => [service.slug, category])
  )
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
    slug === 'airtime' ? isAirtimeProduct : slug === 'data' ? (product: DigitalServiceProduct) => !isAirtimeProduct(product) : null;
  if (!keep) return billers;
  return billers
    .map((biller) => ({ ...biller, products: biller.products.filter(keep) }))
    .filter((biller) => biller.products.length > 0);
}

/** URL slug → display name (e.g. "airtime" → "Airtime"). */
export const SERVICE_LABEL_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.values(SERVICES_BY_CATEGORY).flatMap((services) => services.map((service) => [service.slug, service.label]))
);
