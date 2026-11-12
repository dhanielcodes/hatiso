/**
 * Banks and fintechs shown on the landing pages (home banks block and /banks).
 * Static until a banks API exists; status counts and filters are derived from this list.
 */
export type BankStatus = "Online" | "Degraded" | "Down";

export interface BankItem {
  id: string;
  name: string;
  logo: string;
  status: BankStatus;
  /** Short initials for the avatar; defaults to the first letters of the name. */
  mono?: string;
  services: string[];
  websiteUrl: string;
  description?: string;
}

export const BANKS_DATA: BankItem[] = [
  {
    id: "tm30",
    status: "Online",
    name: "TM30 MFB",
    services: [
      "Transfer",
      "Bills",
      "Airtime & data",
      "Card",
      "USSD",
      "Virtual account",
    ],
    logo: "/images/bank_ab_mfb_hq.png",
    websiteUrl: "https://tm-30-bank.vercel.app/",
    description:
      "Licensed by the Central Bank of Nigeria to deliver innovative microfinance and retail banking services.",
  },
  {
    id: "tm302",
    status: "Online",
    name: "TM30 MFB 2",
    services: [
      "Transfer",
      "Bills",
      "Airtime & data",
      "Card",
      "USSD",
      "Virtual account",
    ],
    logo: "/images/bank_ab_mfb_hq.png",
    websiteUrl: "https://tm-30-bank.vercel.app/",
    description:
      "Licensed by the Central Bank of Nigeria to deliver innovative microfinance and retail banking services.",
  },
  /* {
    id: 'ibile',
    name: 'IBILE MFB',
    logo: '/images/bank_ibile_hq.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'],
    websiteUrl: 'https://ibilemfb.com',
    description: 'Licensed by the Central Bank of Nigeria to deliver innovative microfinance and retail banking services.',
  },
  {
    id: 'ab_mfb',
    name: 'AB MFB',
    logo: '/images/bank_ab_mfb_hq.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD'],
    websiteUrl: 'https://ab-mfb.com',
    description: 'Providing accessible financial solutions, digital transfers, and business credit across Nigeria.',
  },
  {
    id: 'moneytrust',
    name: 'Moneytrust MFB',
    logo: '/images/bank_moneytrust.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'USSD', 'Virtual account'],
    websiteUrl: 'https://moneytrustmfb.com',
    description: 'Secure, modern digital banking tailored for individuals and emerging commercial enterprises.',
  },
  {
    id: 'fastcredit',
    name: 'Fast Credit',
    logo: '/images/bank_fastcredit.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Virtual account', 'Card', 'USSD'],
    websiteUrl: 'https://fastcredit-ng.com',
    description: 'Fast digital lending, account top-ups, and frictionless bill settlement solutions.',
  },
  {
    id: 'fastcredit_degraded',
    name: 'Fast Credit',
    logo: '/images/bank_fastcredit_degraded.png',
    status: 'Degraded',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'],
    websiteUrl: 'https://fastcredit-ng.com',
    description: 'Secondary settlement gateway experiencing occasional network latency.',
  },
  {
    id: 'koins',
    name: 'Koins MFB',
    logo: '/images/bank_koins.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'],
    websiteUrl: 'https://koinsmfb.com',
    description: 'Next-generation digital microfinance platform supporting smart savings, cards, and daily transactions.',
  },
  {
    id: 'hasal',
    name: 'Hasal MFB',
    logo: '/images/bank_hasal.png',
    status: 'Degraded',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'USSD', 'Virtual account'],
    websiteUrl: 'https://hasalmfb.com',
    description: 'Serving businesses and households with tailored deposit accounts and instant merchant settlement.',
  },
  {
    id: 'alert_group',
    name: 'Alert Group',
    logo: '/images/bank_alert_group.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'USSD', 'Virtual account'],
    websiteUrl: 'https://alertgroup.com.ng',
    description: 'Specialized retail micro-lending and automated virtual account management services.',
  },
  {
    id: 'ajo_card',
    name: 'Ajo Card',
    logo: '/images/bank_ajo_card.png',
    status: 'Down',
    services: ['Transfer', 'Bills', 'Airtime & data', 'Card', 'Virtual account'],
    websiteUrl: 'https://ajocard.com',
    description: 'Scheduled maintenance currently in progress on gateway endpoints.',
  },
  {
    id: 'bowen',
    name: 'Bowen MFB',
    logo: '/images/bank_bowen.png',
    status: 'Online',
    services: ['Transfer', 'Bills', 'Airtime & data', 'USSD', 'Virtual account'],
    websiteUrl: 'https://bowenmicrofinancebank.com',
    description: 'Pioneering community-first commercial microfinance and student educational financial services.',
  }, */
];

export const ALL_SERVICES = [
  "Transfer",
  "Bills",
  "Airtime & data",
  "Card",
  "USSD",
  "Virtual account",
];
export const ALL_STATUSES: BankStatus[] = [
  "Online",
  "Degraded",
  "Down",
];

export const STATUS_DOT: Record<BankStatus, string> = {
  Online: "#2B8A57",
  Degraded: "#D99A1E",
  Down: "#C8412C",
};

export const STATUS_PILL: Record<BankStatus, string> = {
  Online: "#E6F4EC",
  Degraded: "#FBF0DA",
  Down: "#FBE5E1",
};

export function bankMono(bank: BankItem) {
  if (bank.mono) return bank.mono;
  const words = bank.name.split(/\s+/).filter((w) => !/^(MFB|BANK)$/i.test(w));
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2)).toUpperCase();
}

export function countByStatus(banks: BankItem[], status: BankStatus) {
  return banks.filter((bank) => bank.status === status).length;
}
