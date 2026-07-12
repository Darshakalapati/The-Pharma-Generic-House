'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const Diagnostics3DBackground = dynamic(
  () => import('./diagnostics-3d-background'),
  { ssr: false, loading: () => null }
);

export function DiagnosticsBackground3D() {
  const [mounted, setMounted] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const handleReady = React.useCallback(() => setReady(true), []);

  React.useEffect(() => {
    const mount = () => setMounted(true);

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(mount, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = setTimeout(mount, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* CSS fallback — visible until 3D is ready */}
      <div
        aria-hidden
        className={cn(
          'fixed inset-0 pointer-events-none z-0 diagnostics-bg-fallback transition-opacity duration-700 ease-out',
          ready ? 'opacity-0' : 'opacity-100'
        )}
      />
      {mounted && (
        <div
          className={cn(
            'fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ease-out',
            ready ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Diagnostics3DBackground onReady={handleReady} />
        </div>
      )}
    </>
  );
}
