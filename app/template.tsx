import PageTransition from '@/components/motion/PageTransition';

/** Page transition between top-level routes (home, contact, banks, sign-in, dashboard…). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
