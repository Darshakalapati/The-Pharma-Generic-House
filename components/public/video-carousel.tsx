'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn, extractYouTubeId, youtubeThumbnailUrl, formatTitle } from '@/lib/utils';
import dynamic from 'next/dynamic';

/**
 * Split out of the first-load bundle. Left permanently rendered rather than
 * gated on `active`: the modal fades itself out on close, and unmounting it
 * would replace that with a hard cut.
 */
const VideoPlayerModal = dynamic(
  () => import('./video-player-modal').then((m) => m.VideoPlayerModal),
  { ssr: false, loading: () => null }
);
import { useT } from './i18n/language-provider';
import { StaggerGrid, StaggerGridItem } from '@/components/public/motion/scroll-reveal';
import type { Video } from '@/lib/types';

const STATIC_GRID_THRESHOLD = 4;

/** Plain-language label for the stored video_type. */


export function VideoCarousel({ videos }: { videos: Video[] }) {
  const { dict } = useT();
  const [active, setActive] = React.useState<Video | null>(null);
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const useStaticGrid = videos.length < STATIC_GRID_THRESHOLD;

  const updateScrollState = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    if (useStaticGrid) return;
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, useStaticGrid, videos.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Move by ~80% of viewport so the user sees fresh cards each click.
    const delta = el.clientWidth * 0.8 * dir;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  if (useStaticGrid) {
    return (
      <>
        <StaggerGrid
          className={cn(
            'grid gap-5',
            videos.length === 1 && 'grid-cols-1 sm:max-w-sm',
            videos.length === 2 && 'grid-cols-1 sm:grid-cols-2 sm:max-w-2xl',
            videos.length === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
          stagger={0.08}
        >
          {videos.map((v) => (
            <StaggerGridItem key={v.id}>
              <VideoCard video={v} onPlay={() => setActive(v)} />
            </StaggerGridItem>
          ))}
        </StaggerGrid>
        <VideoPlayerModal video={active} onClose={() => setActive(null)} />
      </>
    );
  }

  return (
    <div className="relative">
      {/* Desktop arrows */}
      <button
        type="button"
        aria-label={dict.doctors.scrollLeft}
        onClick={() => scrollBy(-1)}
        disabled={!canScrollLeft}
        className={cn(
          'hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(100%+0.5rem)] z-10 h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elevated shadow-soft transition-all',
          canScrollLeft
            ? 'opacity-100 hover:border-plum hover:text-plum'
            : 'opacity-0 pointer-events-none'
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={dict.doctors.scrollRight}
        onClick={() => scrollBy(1)}
        disabled={!canScrollRight}
        className={cn(
          'hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+0.5rem)] z-10 h-10 w-10 items-center justify-center rounded-full border border-line bg-bg-elevated shadow-soft transition-all',
          canScrollRight
            ? 'opacity-100 hover:border-plum hover:text-plum'
            : 'opacity-0 pointer-events-none'
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <StaggerGrid
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}
        stagger={0.08}
      >
        {videos.map((v) => (
          <StaggerGridItem
            key={v.id}
            className="snap-start shrink-0 w-[78vw] xs:w-[260px] sm:w-[280px] lg:w-[300px] last:pr-1"
          >
            <VideoCard video={v} onPlay={() => setActive(v)} />
          </StaggerGridItem>
        ))}
      </StaggerGrid>

      <VideoPlayerModal video={active} onClose={() => setActive(null)} />
    </div>
  );
}

function VideoCard({ video, onPlay }: { video: Video; onPlay: () => void }) {
  const { dict } = useT();
  const thumb = resolveThumbnail(video);
  return (
    <article className="card-soft overflow-hidden flex flex-col h-full">
      <button
        type="button"
        onClick={onPlay}
        aria-label={`${dict.videos.playAria}: ${video.title}`}
        className="group relative aspect-[9/16] bg-ink overflow-hidden block"
      >
        {thumb ? (
          // Use plain img so any host (Supabase Storage, YouTube, picsum, etc) works.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={video.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-white/40">
            <Play className="h-10 w-10" />
          </div>
        )}
        {/* The only thing allowed over an image anywhere on the site: the play
            control. No gradient, no text — just a 44px target in the centre. */}
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-plum text-white shadow-elevated transition-transform duration-200 group-hover:scale-110">
            <Play className="h-4 w-4 translate-x-[1px]" fill="currentColor" />
          </span>
        </span>
      </button>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-teal-deep">
          {video.video_type === 'testimonial'
            ? dict.videos.customerStory
            : video.video_type === 'review'
              ? dict.videos.product
              : dict.videos.shopUpdate}
        </span>
        {video.customer_name && (
          <p className="font-serif font-medium text-[1.0625rem] tracking-[-0.005em] leading-tight">
            {formatTitle(video.customer_name)}
          </p>
        )}
        {!video.customer_name && (
          <p className="font-serif font-medium text-[1.0625rem] tracking-[-0.005em] leading-tight">
            {formatTitle(video.title)}
          </p>
        )}
        {video.description && (
          <p className="text-[0.875rem] text-ink-muted leading-snug line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </article>
  );
}

function resolveThumbnail(v: Video): string | null {
  if (v.thumbnail_url) return v.thumbnail_url;
  if (v.video_source === 'youtube') {
    const id = extractYouTubeId(v.video_url);
    if (id) return youtubeThumbnailUrl(id);
  }
  return null;
}
