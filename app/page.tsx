import React from 'react';
import Navbar from '@/components/marketplace/Navbar';
import HeroSection from '@/components/marketplace/HeroSection';
import PopularCategories from '@/components/marketplace/PopularCategories';
import BanksSection from '@/components/marketplace/BanksSection';
import SolutionsSection from '@/components/marketplace/SolutionsSection';
import CtaBanner from '@/components/marketplace/CtaBanner';
import Footer from '@/components/marketplace/Footer';

export const metadata = {
  title: 'XNETT - One platform. Every service you need.',
  description:
    'Discover digital services from trusted providers, manage your banking, and get things done. All from one place.',
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#1B3C4A] text-white flex flex-col justify-between selection:bg-[#FF6500] selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section with Headline & 3D Coverflow Carousel */}
        <HeroSection />

        {/* Popular Categories Grid & Instant Pay Card */}
        <PopularCategories />

        {/* Banks Section: Bank the way you already do */}
        <BanksSection />

        {/* Personal & Business Solutions Section */}
        <SolutionsSection />

        {/* Ready to Get Started CTA Banner */}
        <CtaBanner />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
