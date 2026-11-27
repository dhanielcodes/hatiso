import React from 'react';
import Navbar from '@/components/marketplace/Navbar';
import HeroSection from '@/components/marketplace/HeroSection';
import PopularCategories from '@/components/marketplace/PopularCategories';
import BanksSection from '@/components/marketplace/BanksSection';
import HowItWorks from '@/components/marketplace/HowItWorks';
import BusinessSection from '@/components/marketplace/BusinessSection';
import CtaBanner from '@/components/marketplace/CtaBanner';
import Footer from '@/components/marketplace/Footer';
import PageSection from '@/components/marketplace/PageSection';
import HomePageLoader from '@/components/marketplace/HomePageLoader';

export const metadata = {
  title: 'QAPP by Hatiso - One platform. Every service you need.',
  description:
    'Discover digital services from trusted providers, manage your banking, and get things done. All from one place.',
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-carbon text-cloud flex flex-col justify-between selection:bg-silver selection:text-carbon">
      {/* Covers the page until the page configuration loads, so sections don't pop in or out */}
      <HomePageLoader />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area. Sections other than the hero show only when GET /api/public/marketplace/page-configuration has them visible. */}
      <main className="flex-1">
        {/* Hero Section with Headline & 3D Coverflow Carousel */}
        <HeroSection />

        {/* Popular Categories Grid & Instant Pay Card */}
        <PageSection id="FEATURED_DIGITAL_SERVICES">
          <PopularCategories />
        </PageSection>

        {/* How it works: three steps */}
        <PageSection id="AUDIENCE">
          <HowItWorks />
        </PageSection>

        {/* Banks Section: your bank, one tap away */}
        <PageSection id="FEATURED_BANKS">
          <BanksSection />
        </PageSection>

        {/* For business */}
        <PageSection id="BUSINESS">
          <BusinessSection />
        </PageSection>

        {/* Ready to Get Started CTA Banner */}
        <PageSection id="CTA">
          <CtaBanner />
        </PageSection>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
