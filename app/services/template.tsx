import PageTransition from '@/components/motion/PageTransition';

/** Page transition between the services list and a service. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
