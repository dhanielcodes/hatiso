import PageTransition from '@/components/motion/PageTransition';

/** Page transition between Support and a ticket. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
