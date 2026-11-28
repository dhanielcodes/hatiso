import PageTransition from '@/components/motion/PageTransition';

/** Page transition between categories. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
