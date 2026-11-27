import React from 'react';
import Navbar from '@/components/marketplace/Navbar';
import HeroSection from '@/components/marketplace/HeroSection';
import PopularCategories from '@/components/marketplace/PopularCategories';
import BanksSection from '@/components/marketplace/BanksSection';
import SolutionsSection from '@/components/marketplace/SolutionsSection';
import CtaBanner from '@/components/marketplace/CtaBanner';
import Footer from '@/components/marketplace/Footer';
import PageSection from '@/components/marketplace/PageSection';

export const metadata = {
  title: 'QAPP by Hatiso - One platform. Every service you need.',
  description:
    'Discover digital services from trusted providers, manage your banking, and get things done. All from one place.',
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-ink-662 text-white flex flex-col justify-between selection:bg-brand-361 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area. Sections other than the hero show only when GET /api/public/marketplace/page-configuration has them visible (SolutionsSection handles AUDIENCE and BUSINESS itself). */}
      <main className="flex-1">
        {/* Hero Section with Headline & 3D Coverflow Carousel */}
        <HeroSection />

        {/* Popular Categories Grid & Instant Pay Card */}
        <PageSection id="FEATURED_DIGITAL_SERVICES">
          <PopularCategories />
        </PageSection>

        {/* Banks Section: Bank the way you already do */}
        <PageSection id="FEATURED_BANKS">
          <BanksSection />
        </PageSection>

        {/* Personal & Business Solutions Section */}
        <SolutionsSection />

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
