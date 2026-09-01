'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { formatINR, formatTime12, formatSpecialty, formatDays } from '@/lib/utils';
import { resolveDoctorPhoto } from '@/lib/images';
import { DoctorAvailabilityBadge } from './doctor-availability-badge';
import { useT } from './i18n/language-provider';
import { DoctorSlots } from './doctor-slots';
import { useRouter } from 'next/navigation';
import type { Doctor } from '@/lib/types';

/** Matches the `gap-6` on the track. Used to compute one arrow-click step. */
const GAP_PX = 24;

/**
 * Horizontally scrolling list of practitioners.
 *
 * The scrolling is the browser's own — `overflow-x: auto` plus CSS scroll
 * snapping — so touch momentum, trackpads and keyboard all work for free. The
 * component only observes `scrollLeft` to decide whether the arrows and the
 * edge fades should show. Arrows appear on fine pointers only; on touch the
 * swipe is the affordance, helped along by the next card peeking in.
 */
export function DoctorsCarousel({ doctors }: { doctors: Doctor[] }) {
  const { dict } = useT();
  const router = useRouter();
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const [pointerFine, setPointerFine] = React.useState(false);
  const [canScroll, setCanScroll] = React.useState(false);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  React.useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setPointerFine(fine.matches);
    sync();
    fine.addEventListener('change', sync);
    return () => fine.removeEventListener('change', sync);
  }, []);

  const measure = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScroll(max > 1);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  // Re-measure when the track resizes — a viewport change can turn a
  // scrollable track into a fitting one, which hides the arrows and fades.
  React.useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, doctors.length]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-doctor-card]');
    const step = card ? card.offsetWidth + GAP_PX : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: reduced ? 'auto' : 'smooth' });
  };

  // Fade only on the side that still has content behind it.
  const maskImage = !canScroll
    ? undefined
    : atStart
      ? 'linear-gradient(to right, black 0%, black 92%, transparent 100%)'
      : atEnd
        ? 'linear-gradient(to right, transparent 0%, black 8%, black 100%)'
        : 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)';

  const showArrows = pointerFine && canScroll;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={measure}
        className="scrollbar-none flex gap-6 overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        {doctors.map((d) => {
          const photo = resolveDoctorPhoto(d.photo_url, d.name);
          return (
            <div
              key={d.id}
              data-doctor-card
              className="snap-start shrink-0 w-[85vw] max-w-[340px]"
            >
              <article className="card-soft tap-settle overflow-hidden flex flex-col group h-full">
                <div className="relative aspect-[4/3] md:aspect-[4/3] bg-sand overflow-hidden">
                  <DoctorAvailabilityBadge doctor={d} />
                  {photo && (
                    <Image
                      src={photo}
                      alt={d.name}
                      fill
                      sizes="(max-width: 640px) 85vw, 340px"
                      className="object-cover img-soft-color"
                    />
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="eyebrow eyebrow--teal">
                    {d.is_on_request ? dict.doctors.byRequest : formatSpecialty(d.specialty, dict)}
                  </span>
                  <h3 className="mt-2 font-serif font-medium text-[1.375rem] tracking-[-0.015em]">
                    {d.name}
                  </h3>
                  {d.qualifications?.trim() && (
                    <p className="mt-1 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-ink-muted">
                      {d.qualifications}
                    </p>
                  )}
                  {d.bio && (
                    <p className="mt-2 text-[0.9375rem] text-ink-muted leading-[1.6] line-clamp-2">
                      {d.bio}
                    </p>
                  )}

                  <div className="mt-4 space-y-1.5 text-[0.875rem] text-ink-muted">
                    {!d.is_on_request &&
                      d.available_days.length > 0 &&
                      d.available_time_start &&
                      d.available_time_end && (
                        <p>
                          <span className="text-ink">{formatDays(d.available_days, dict)}</span> ·{' '}
                          {formatTime12(d.available_time_start)} –{' '}
                          {formatTime12(d.available_time_end)}
                        </p>
                      )}
                    {d.consultation_fee != null && (
                      <p className="font-serif font-medium text-[1.0625rem] text-ink">
                        {formatINR(d.consultation_fee)}
                      </p>
                    )}
                  </div>

                  <DoctorSlots
                    doctor={d}
                    onPick={(slot) =>
                      router.push(
                        `/doctors?book=${d.id}&date=${slot.date}&time=${encodeURIComponent(slot.time)}`
                      )
                    }
                  />

                  <Link
                    href="/doctors"
                    className="mt-4 inline-flex items-center gap-1 text-[0.9375rem] font-medium text-plum hover:text-plum-deep self-start"
                  >
                    {d.is_on_request ? dict.doctors.request : dict.doctors.book}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            </div>
          );
        })}
      </div>

      {showArrows && !atStart && (
        <CarouselArrow
          direction="left"
          onClick={() => scrollByCard(-1)}
          labels={{ prev: dict.doctors.prevAria, next: dict.doctors.nextAria }}
        />
      )}
      {showArrows && !atEnd && (
        <CarouselArrow
          direction="right"
          onClick={() => scrollByCard(1)}
          labels={{ prev: dict.doctors.prevAria, next: dict.doctors.nextAria }}
        />
      )}
    </div>
  );
}

function CarouselArrow({
  direction,
  onClick,
  labels,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  labels: { prev: string; next: string };
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? labels.prev : labels.next}
      className={[
        'absolute top-1/2 -translate-y-1/2 z-10 hidden md:inline-flex h-10 w-10 items-center justify-center',
        'rounded-full border border-line bg-bg-elevated text-plum shadow-soft',
        'transition-colors hover:bg-plum hover:text-white hover:border-plum',
        direction === 'left' ? '-left-5' : '-right-5',
      ].join(' ')}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
