import PageTransition from '@/components/motion/PageTransition';

/** Page transition between the sign-in, sign-up and recovery screens. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
