'use client';

import * as React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/lib/types';

const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Pure presentational view of the banner. Used by both the live public
 * banner and the admin live preview. Renders no localStorage / dismissal
 * logic itself.
 */
export function AnnouncementBannerView({
  announcement,
  onDismiss,
  showDismiss = true,
  innerRef,
}: {
  announcement: Pick<Announcement, 'text' | 'link_label' | 'link_url' | 'background_color'>;
  onDismiss?: () => void;
  showDismiss?: boolean;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  const bg =
    announcement.background_color === 'teal'
      ? 'bg-teal text-white'
      : 'bg-plum text-white';

  const hasLink = !!(announcement.link_label && announcement.link_url);

  return (
    <div
      ref={innerRef}
      role="region"
      aria-label="Site announcement"
      className={cn('w-full', bg)}
    >
      <div className="container-public flex items-center justify-center gap-3 py-2.5 sm:py-2 min-h-[44px] text-[0.8125rem] sm:text-[0.875rem] leading-snug">
        <div className="flex-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span className="font-medium">{announcement.text}</span>
          {hasLink && announcement.link_url && (
            <Link
              href={announcement.link_url}
              className="underline underline-offset-4 decoration-white/60 hover:decoration-white font-medium whitespace-nowrap"
            >
              {announcement.link_label}
            </Link>
          )}
        </div>
        {showDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss announcement"
            className="shrink-0 inline-flex h-11 w-11 md:h-7 md:w-7 items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Wrapper that handles localStorage dismissal (7-day TTL keyed by banner id),
 * banner-height tracking via a CSS variable so the sticky nav can offset
 * itself, and a fade-out animation on dismiss.
 */
export function AnnouncementBanner({ announcement }: { announcement: Announcement | null }) {
  const [hidden, setHidden] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  // On mount: check localStorage; if dismissed within TTL, hide right away.
  React.useEffect(() => {
    if (!announcement) return;
    try {
      const raw = localStorage.getItem(`banner_dismissed_${announcement.id}`);
      if (raw) {
        const ts = parseInt(raw, 10);
        if (!Number.isNaN(ts) && Date.now() - ts < DISMISS_TTL_MS) {
          setHidden(true);
        }
      }
    } catch {
      // ignore (localStorage may be blocked)
    }
  }, [announcement]);

  // Track banner height as a CSS variable so the sticky nav can sit below it.
  React.useEffect(() => {
    if (!announcement || hidden) {
      document.documentElement.style.setProperty('--banner-height', '0px');
      return;
    }
    const update = () => {
      const h = ref.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--banner-height', `${h}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    if (ref.current) observer.observe(ref.current);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [announcement, hidden, closing]);

  if (!announcement || hidden) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(`banner_dismissed_${announcement.id}`, String(Date.now()));
    } catch {
      // ignore
    }
    setClosing(true);
    // Match the duration of the collapse animation below.
    window.setTimeout(() => setHidden(true), 400);
  };

  return (
    <div
      className={cn(
        'sticky top-0 z-[60] w-full overflow-hidden transition-[max-height,opacity] duration-400 ease-out',
        closing ? 'max-h-0 opacity-0' : 'max-h-32 opacity-100'
      )}
    >
      <AnnouncementBannerView
        announcement={announcement}
        onDismiss={dismiss}
        innerRef={ref}
      />
    </div>
  );
}
