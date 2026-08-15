'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PromoBannerCard } from './promo-banner-card';
import type { PromoBanner } from '@/lib/types';

const ROTATE_MS = 7000;
const TRANSITION_MS = 400;
const SWIPE_THRESHOLD = 50;

export function PromoBannerCarousel({ banners }: { banners: PromoBanner[] }) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);
  const count = banners.length;

  // Auto-advance
  React.useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  const goTo = React.useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );
  const next = React.useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = React.useCallback(() => goTo(index - 1), [goTo, index]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) next();
      else prev();
    }
    // Resume auto-advance after a short grace period so users aren't
    // immediately yanked to the next slide.
    window.setTimeout(() => setPaused(false), 1500);
  };

  // Single banner: render statically with no carousel chrome.
  if (count === 1) {
    return (
      <div className="container-public">
        <PromoBannerCard banner={banners[0]} />
      </div>
    );
  }

  if (count === 0) return null;

  return (
    <div className="container-public">
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Track. On phones each slide is 88% wide so the next one peeks in
            from the right and the carousel reads as swipeable; from md up it
            goes back to one full-width slide at a time. `--slide-step` keeps
            the transform and the slide width in step at both sizes. */}
        <div className="overflow-hidden rounded-2xl [--slide-step:calc(88%_+_0.75rem)] md:[--slide-step:100%]">
          <div
            className="flex gap-3 md:gap-0"
            style={{
              transform: `translateX(calc(-${index} * var(--slide-step)))`,
              transition: `transform ${TRANSITION_MS}ms cubic-bezier(0, 0, 0.2, 1)`,
            }}
          >
            {banners.map((b) => (
              <div key={b.id} className="w-[88%] md:w-full shrink-0">
                <PromoBannerCard banner={b} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop arrows */}
        <button
          type="button"
          aria-label="Previous banner"
          onClick={prev}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elevated shadow-soft hover:border-plum hover:text-plum transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next banner"
          onClick={next}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elevated shadow-soft hover:border-plum hover:text-plum transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Pagination dots */}
      <div
        className="mt-5 flex items-center justify-center gap-2"
        role="tablist"
        aria-label="Banner navigation"
      >
        {banners.map((b, i) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to banner ${i + 1}`}
            onClick={() => goTo(i)}
            className={cn(
              'h-2 rounded-full transition-all duration-200',
              i === index ? 'w-6 bg-plum' : 'w-2 bg-line hover:bg-ink-faint'
            )}
          />
        ))}
      </div>
    </div>
  );
}
