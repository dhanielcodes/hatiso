import PageTransition from '@/components/motion/PageTransition';

/** Page transition between dashboard pages. It sits inside the dashboard layout, so only the content area moves; the sidebar and top bar stay still. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
