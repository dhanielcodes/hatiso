import type { BentoContent, Feature, LpIconName } from '@/components/landing/LandingKit';

/** Landing copy for each service page (/services/[slug] and /categories/[slug]). */
export type ServiceLanding = {
  badge: string;
  lines: { text: string; accent?: boolean }[];
  body: string;
  input: { icon: LpIconName; placeholder: string; label: string; type: 'tel' | 'text' };
  providerLabel: string;
  providers: string[];
  features: Feature[];
  bento: Omit<BentoContent, 'hero'> & { hero: Omit<BentoContent['hero'], 'action'> & { actionLabel: string } };
};

const SAFETY: Feature = { icon: 'shield', title: 'Guaranteed safety', body: 'Bank-grade encryption on every payment' };
const NO_ACCOUNT: Feature = { icon: 'pin', title: 'No account needed', body: "Enter a number, pick an amount and you're done." };

const LANDING: Record<string, ServiceLanding> = {
  airtime: {
    badge: 'Airtime for any Nigerian network',
    lines: [{ text: 'Airtime,', accent: true }, { text: 'instantly' }],
    body: "Recharge any Nigerian network in seconds, whether it's your own line or a loved one's. Enter the number, pick an amount from ₦100 upwards, and the credit lands straight away. You also earn cashback on every top-up, so staying in touch gives something back.",
    input: { icon: 'phone', placeholder: 'Enter the number to top up', label: 'Phone number to top up', type: 'tel' },
    providerLabel: 'Top up',
    providers: ['MTN', 'Airtel', 'Glo', '9mobile'],
    features: [
      { icon: 'bolt', title: 'Instant delivery', body: 'Instant delivery, usually under few seconds' },
      SAFETY,
      { icon: 'card', title: 'Cashback', body: 'You also earn cashback on every top-up' },
      NO_ACCOUNT,
    ],
    bento: {
      hero: { title: 'Top up in seconds', body: "Enter a number, pick an amount and you're done. No account needed.", actionLabel: 'Buy airtime', cards: ['MTN', 'Airtel', 'Glo'] },
      orbit: { title: 'Any Nigerian network', body: "Recharge your own line or a loved one's.", labels: ['MTN', 'Airtel', '9mobile', 'Glo', '₦100+'] },
      stats: [
        { tag: 'From', value: '₦100', caption: 'minimum top-up' },
        { tag: 'Cashback', value: '₦', caption: 'back on every top-up' },
      ],
    },
  },
  data: {
    badge: 'Data bundles for every network',
    lines: [{ text: 'Stay connected', accent: true }, { text: 'for less' }],
    body: 'Choose from daily, weekly and monthly data bundles for MTN, Airtel, Glo and 9mobile, all at clear, upfront prices. Pick the plan that fits how you browse, stream or work, and it activates within moments.',
    input: { icon: 'phone', placeholder: 'Enter the number to top up', label: 'Phone number for the bundle', type: 'tel' },
    providerLabel: 'Bundles for',
    providers: ['MTN', 'Airtel', 'Glo', '9mobile'],
    features: [
      { icon: 'bolt', title: 'Instant activation', body: 'Your bundle is live within moments' },
      SAFETY,
      { icon: 'data', title: 'Clear prices', body: 'Upfront prices, no hidden charges' },
      NO_ACCOUNT,
    ],
    bento: {
      hero: { title: 'Bundles that fit how you browse', body: 'Daily, weekly and monthly plans for every network, without dialling codes.', actionLabel: 'Buy data', cards: ['MTN', 'Airtel', 'Glo'] },
      orbit: { title: 'Every network, every plan', body: 'Pick a bundle for your own line or a loved one’s.', labels: ['MTN', 'Daily', 'Airtel', 'Weekly', 'Glo', 'Monthly', '9mobile'] },
      stats: [
        { tag: 'Networks', value: '4', caption: 'supported' },
        { tag: 'Cashback', value: '₦', caption: 'back on every bundle' },
      ],
    },
  },
  electricity: {
    badge: 'Prepaid and postpaid electricity',
    lines: [{ text: 'Keep the' }, { text: 'lights on', accent: true }],
    body: 'Buy prepaid tokens or pay postpaid bills for your distribution company without queuing or travelling. Enter your meter number, confirm the name on the account, and get your token instantly on screen and by email.',
    input: { icon: 'bolt', placeholder: 'Enter your meter number', label: 'Meter number', type: 'text' },
    providerLabel: 'Pay',
    providers: ['Ikeja', 'Eko', 'Ibadan', 'Jos', 'Kaduna'],
    features: [
      { icon: 'bolt', title: 'Token on screen', body: 'Your token shows instantly and lands in your email' },
      SAFETY,
      { icon: 'card', title: 'Any hour', body: 'Pay at night, on weekends and on holidays' },
      { icon: 'pin', title: 'No queues', body: 'No trips to the office, no extra apps' },
    ],
    bento: {
      hero: { title: 'Pay any bill, anytime', body: 'Prepaid tokens and postpaid bills, settled instantly without queues.', actionLabel: 'Buy a token', cards: ['Prepaid', 'Postpaid', 'Token'] },
      orbit: { title: 'Every distribution company', body: 'Enter your meter number and we confirm the account name first.', labels: ['Ikeja', 'Eko', 'Ibadan', 'Jos', 'Kaduna'] },
      stats: [
        { tag: 'Token', value: 'Now', caption: 'on screen and by email' },
        { tag: 'Open', value: '24/7', caption: 'even on holidays' },
      ],
    },
  },
  tv: {
    badge: 'DStv, GOtv and StarTimes',
    lines: [{ text: 'Never miss', accent: true }, { text: 'your show' }],
    body: 'Renew or change your DStv, GOtv or StarTimes package in a few taps. Enter your smartcard or IUC number, choose a plan, and your subscription is refreshed right away. No blank screens on match day or finale night.',
    input: { icon: 'tv', placeholder: 'Enter your smartcard or IUC number', label: 'Smartcard or IUC number', type: 'text' },
    providerLabel: 'Renew',
    providers: ['DStv', 'GOtv', 'StarTimes', 'Showmax'],
    features: [
      { icon: 'bolt', title: 'Instant renewal', body: 'Your package is refreshed right after payment' },
      SAFETY,
      { icon: 'tv', title: 'Change packages', body: 'Upgrade or switch plans in the same flow' },
      { icon: 'pin', title: 'No account needed', body: 'Enter your smartcard number and pay' },
    ],
    bento: {
      hero: { title: 'No blank screens on match day', body: 'Renew in seconds, from anywhere, at any hour.', actionLabel: 'Renew TV', cards: ['DStv', 'GOtv', 'StarTimes'] },
      orbit: { title: 'Every package', body: 'Renew, upgrade or switch with your smartcard number.', labels: ['DStv', 'Renew', 'GOtv', 'Upgrade', 'StarTimes', 'Showmax'] },
      stats: [
        { tag: 'Renewal', value: 'Now', caption: 'right after payment' },
        { tag: 'Cashback', value: '₦', caption: 'back on every renewal' },
      ],
    },
  },
  betting: {
    badge: 'Fund your betting wallet',
    lines: [{ text: 'Fund', accent: true }, { text: 'your wallet fast' }],
    body: 'Add money to your betting account in seconds, with no bank trips or delays. Your payment is encrypted and credited straight to your wallet. Please bet responsibly and only stake what you can afford to lose.',
    input: { icon: 'dice', placeholder: 'Enter your customer ID', label: 'Betting customer ID', type: 'text' },
    providerLabel: 'Fund',
    providers: ['Bet9ja', 'SportyBet', 'Betway', 'MerryBet'],
    features: [
      { icon: 'bolt', title: 'Instant funding', body: 'Your wallet is credited right away' },
      SAFETY,
      { icon: 'card', title: 'All in one app', body: 'Hatiso. Services, banking, and business. All in one place.' },
      { icon: 'pin', title: 'Bet responsibly', body: 'Only stake what you can afford to lose' },
    ],
    bento: {
      hero: { title: 'Fund in seconds', body: 'No bank trips, no delays.', actionLabel: 'Fund wallet', cards: ['Bet9ja', 'SportyBet', 'Betway'] },
      orbit: { title: 'Your favourite platforms', body: 'Credited straight to your wallet.', labels: ['Bet9ja', 'SportyBet', 'Betway', 'MerryBet'] },
      stats: [
        { tag: 'Funding', value: 'Now', caption: 'straight to your wallet' },
        { tag: 'Secure', value: '100%', caption: 'encrypted payments' },
      ],
    },
  },
};

function titleCase(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function serviceLanding(slug: string): ServiceLanding {
  const known = LANDING[slug];
  if (known) return known;
  const name = titleCase(slug);
  return {
    badge: 'Pay securely with Hatiso',
    lines: [{ text: `${name},`, accent: true }, { text: 'instantly' }],
    body: 'Fulfil digital transactions instantly and securely across top providers in Nigeria.',
    input: { icon: 'card', placeholder: 'Enter your customer or account number', label: 'Customer number', type: 'text' },
    providerLabel: 'Pay',
    providers: [],
    features: [
      { icon: 'bolt', title: 'Instant delivery', body: 'Instant delivery, usually under few seconds' },
      SAFETY,
      { icon: 'card', title: 'All in one app', body: 'Hatiso. Services, banking, and business. All in one place.' },
      { icon: 'pin', title: 'No account needed', body: 'No account required to start.' },
    ],
    bento: {
      hero: { title: 'Pay for what you need, instantly', body: 'Bills, airtime, transfers, and merchant payments settled in seconds, no extra apps required.', actionLabel: 'Pay now', cards: ['Airtime', 'Electricity', 'TV'] },
      orbit: { title: 'Bank-grade encryption on every payment', body: 'Instant delivery, usually under few seconds.', labels: ['MTN', 'Airtel', 'Glo', '9mobile', 'DStv', 'GOtv'] },
      stats: [
        { tag: 'Secure', value: '100%', caption: 'encrypted payments' },
        { tag: 'Cashback', value: '₦', caption: 'back on every top-up' },
      ],
    },
  };
}
