import PageTransition from '@/components/motion/PageTransition';

/** Page transition between the transactions list and a transaction. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
