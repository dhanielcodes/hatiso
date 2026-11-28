import { ViewTransition } from 'react';

/**
 * Page transition: the old page fades out and the new one fades in with a small rise (`.hz-page` in globals.css).
 * Used by the route templates (app/template.tsx and the nested ones). A template remounts whenever the segment
 * under it changes, so its <ViewTransition> exits and enters; `default="none"` keeps it still for everything else.
 * A template only sees changes below its own segment, so route groups whose pages share a parent segment
 * (/auth/*, /services/*, /categories/*, /dashboard/*, /dashboard/transactions/*, /dashboard/support/*) each have one.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="hz-page" exit="hz-page" default="none">
      {children}
    </ViewTransition>
  );
}
