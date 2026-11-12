/**
 * Hand-off from a landing widget (e.g. the home "Pay a bill" card or a hero input) to the real
 * service checkout. Kept in sessionStorage rather than the URL so phone/meter numbers never end
 * up in browser history, logs or analytics.
 */
const KEY = 'hatiso_service_prefill';

export type ServicePrefill = {
  slug: string;
  /** Phone, meter or smartcard number, digits only. */
  recipient?: string;
  amountMinor?: number;
  /** Provider name as shown on the card (e.g. "MTN", "Ikeja Electric"); matched to a biller loosely. */
  provider?: string;
};

export function saveServicePrefill(prefill: ServicePrefill) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(prefill));
  } catch {
    // Storage blocked: the checkout simply opens empty
  }
}

/** Reads and clears the hand-off, if it was meant for this service. */
export function takeServicePrefill(slug: string): ServicePrefill | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as ServicePrefill;
    return parsed?.slug === slug ? parsed : null;
  } catch {
    return null;
  }
}

/** Finds the biller whose name or code matches a provider label such as "MTN" or "Ikeja Electric". */
export function matchBiller<T extends { billerCode: string; billerName: string }>(billers: T[], provider?: string) {
  if (!provider) return undefined;
  const wanted = provider.toLowerCase().replace(/\s+electric(ity)?$/, '').trim();
  return billers.find((b) => {
    const name = `${b.billerName} ${b.billerCode}`.toLowerCase();
    return name.includes(wanted);
  });
}
