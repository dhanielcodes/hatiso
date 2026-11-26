import React from 'react';
import Navbar from '@/components/marketplace/Navbar';
import HeroSection from '@/components/marketplace/HeroSection';
import PopularCategories from '@/components/marketplace/PopularCategories';
import BanksSection from '@/components/marketplace/BanksSection';
import HowItWorks from '@/components/marketplace/HowItWorks';
import BusinessSection from '@/components/marketplace/BusinessSection';
import CtaBanner from '@/components/marketplace/CtaBanner';
import Footer from '@/components/marketplace/Footer';

export const metadata = {
  title: 'QAPP by Hatiso - One platform. Every service you need.',
  description:
    'Discover digital services from trusted providers, manage your banking, and get things done. All from one place.',
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-carbon text-cloud flex flex-col justify-between selection:bg-silver selection:text-carbon">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section with Headline & 3D Coverflow Carousel */}
        <HeroSection />

        {/* Popular Categories Grid & Instant Pay Card */}
        <PopularCategories />

        {/* How it works: three steps */}
        <HowItWorks />

        {/* Banks Section: your bank, one tap away */}
        <BanksSection />

        {/* For business */}
        <BusinessSection />

        {/* Ready to Get Started CTA Banner */}
        <CtaBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
