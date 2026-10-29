'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ServiceDetailPage from '@/components/services/ServiceDetailPage';

export default function ServicesSlugPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'airtime';

  return <ServiceDetailPage initialSlug={slug} />;
}

