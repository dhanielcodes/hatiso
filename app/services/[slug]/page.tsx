import ServiceDetailPage from '@/components/services/ServiceDetailPage';

export const instant = false;

export default async function ServicesSlugPage({
  params,
}: PageProps<'/services/[slug]'>) {
  const { slug } = await params;

  return <ServiceDetailPage initialSlug={slug} />;
}

