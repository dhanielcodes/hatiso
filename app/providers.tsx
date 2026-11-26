'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { AlertTriangle, Check, Info, Loader2, X } from 'lucide-react';

/** States board "Messages": Carbon card, status colour in a small circle, title and muted description. */
const dot = (bg: string, icon: React.ReactNode) => (
  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${bg}`}>{icon}</span>
);
const TOAST_ICONS = {
  success: dot('bg-status-success', <Check className="h-3.5 w-3.5" strokeWidth={3} />),
  warning: dot('bg-status-warning', <AlertTriangle className="h-3.5 w-3.5" />),
  error: dot('bg-status-error', <X className="h-3.5 w-3.5" strokeWidth={3} />),
  info: dot('bg-grey-700', <Info className="h-3.5 w-3.5" />),
  loading: dot('bg-grey-700', <Loader2 className="h-3.5 w-3.5 animate-spin" />),
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Retry once, except on 429: retrying straight away only uses up more of the API's rate limit.
            retry: (failureCount, error) => (error as { statusCode?: number } | null)?.statusCode !== 429 && failureCount < 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        closeButton
        icons={TOAST_ICONS}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'flex w-[356px] max-w-[calc(100vw-32px)] items-start gap-3 rounded-[10px] bg-carbon px-4 py-3.5 font-[inherit] text-cloud shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]',
            icon: 'mt-px shrink-0',
            content: 'flex min-w-0 flex-1 flex-col gap-0.5',
            title: 'text-sm font-semibold',
            description: 'text-[13px] text-silver',
            closeButton:
              'order-last ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-grey-400 hover:text-cloud [&>svg]:h-3.5 [&>svg]:w-3.5',
            actionButton: 'rounded-md bg-cloud px-2.5 py-1 text-xs font-medium text-carbon',
          },
        }}
      />
    </QueryClientProvider>
  );
}
