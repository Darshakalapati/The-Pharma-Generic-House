'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { CapsuleFallback } from './capsule-fallback';
import { cn } from '@/lib/utils';

const Hero3DCapsule = dynamic(() => import('./hero-3d-capsule'), {
  ssr: false,
  loading: () => null,
});

export function HeroCapsuleVisual({ className }: { className?: string }) {
  const [ready, setReady] = React.useState(false);
  const handleReady = React.useCallback(() => setReady(true), []);

  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/capsule-fallback.svg';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div
      className={cn(
        'relative w-full h-[380px] lg:h-auto lg:aspect-[6/5] flex items-center justify-center',
        className
      )}
    >
      {/* Static fallback — always present underneath */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-out px-8',
          ready ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        aria-hidden={ready}
      >
        <CapsuleFallback className="max-w-[280px] sm:max-w-[320px]" />
      </div>

      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-500 ease-out',
          ready ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Hero3DCapsule onReady={handleReady} />
      </div>
    </div>
  );
}
