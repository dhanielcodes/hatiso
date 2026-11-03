import ServiceDetailPage from '@/components/services/ServiceDetailPage';

export const instant = false;

export default async function CategoryDetailPage({
  params,
}: PageProps<'/categories/[slug]'>) {
  const { slug } = await params;

  return <ServiceDetailPage initialSlug={slug} />;
}
