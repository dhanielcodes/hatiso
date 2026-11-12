'use client';

import React from 'react';
import Navbar from './Navbar';
import HeroSection, { focusPayCard, usePayBill } from './HeroSection';
import PopularCategories from './PopularCategories';
import BanksSection from './BanksSection';
import SolutionsSection from './SolutionsSection';
import CtaBanner from './CtaBanner';
import Footer from './Footer';
import { BentoTiles, DarkHero, FeatureRow, LandingPage } from '@/components/landing/LandingKit';
import { BANKS_DATA } from '@/lib/marketing/banks';

/** Home page (web redesign). The hero's "Pay a bill" card state lives here so the category grid can open it. */
export default function HomeLanding() {
  const bill = usePayBill();

  return (
    <LandingPage>
      <main className="flex-1">
        <DarkHero>
          <Navbar />
          <HeroSection bill={bill} />
          <FeatureRow
            items={[
              { icon: 'bolt', title: 'Instant delivery', body: 'Instant delivery, usually under few seconds' },
              { icon: 'shield', title: 'Guaranteed safety', body: 'Bank-grade encryption on every payment' },
              { icon: 'card', title: 'All in one app', body: 'Hatiso. Services, banking, and business. All in one place.' },
              { icon: 'pin', title: 'No account needed', body: 'No account required to start.' },
            ]}
          />
        </DarkHero>

        <PopularCategories
          onPay={(service) => {
            bill.pick(service);
            focusPayCard();
          }}
        />

        <BentoTiles
          tone="white"
          label="Pay for what you need, instantly"
          content={{
            hero: {
              title: 'Pay for what you need, instantly',
              body: 'Bills, airtime, transfers, and merchant payments settled in seconds, no extra apps required.',
              action: { label: 'Create your account now', href: '/auth/register' },
              cards: ['Airtime', 'Electricity', 'TV'],
            },
            orbit: {
              title: 'Bank-grade encryption on every payment',
              body: 'Instant delivery, usually under few seconds.',
              labels: ['MTN', 'Airtel', 'Glo', '9mobile', 'DStv', 'GOtv', 'Ikeja Electric'],
            },
            stats: [
              { tag: 'Banks', value: String(BANKS_DATA.length), caption: 'to choose from' },
              { tag: 'Cashback', value: '₦', caption: 'back on every top-up' },
            ],
          }}
        />

        <BanksSection />
        <SolutionsSection />
        <CtaBanner />
      </main>
      <Footer />
    </LandingPage>
  );
}
