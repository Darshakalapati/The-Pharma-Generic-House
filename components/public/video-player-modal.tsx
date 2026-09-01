'use client';

import * as React from 'react';
import { useT } from './i18n/language-provider';
import { X } from 'lucide-react';
import { cn, extractYouTubeId, youtubeEmbedUrl, instagramEmbedUrl } from '@/lib/utils';
import type { Video } from '@/lib/types';

interface Props {
  video: Video | null;
  onClose: () => void;
}

/**
 * Lightbox player. YouTube + Instagram render iframes; uploaded files use
 * the native HTML5 <video> element with controls.
 */
export function VideoPlayerModal({ video, onClose }: Props) {
  const { dict } = useT();
  const open = !!video;

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div
      onClick={onClose}
      className={cn(
        'fixed inset-0 z-[80] bg-ink/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 transition-opacity duration-200',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label={dict.videos.closeAria}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto"
      >
        {video && <PlayerInner video={video} />}
      </div>
    </div>
  );
}

function PlayerInner({ video }: { video: Video }) {
  if (video.video_source === 'youtube') {
    const id = extractYouTubeId(video.video_url);
    if (!id) return <FallbackLink video={video} />;
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-elevated">
        <iframe
          src={youtubeEmbedUrl(id)}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  if (video.video_source === 'instagram') {
    const embed = instagramEmbedUrl(video.video_url);
    return (
      <div className="aspect-[9/16] sm:aspect-[3/4] w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-black shadow-elevated">
        <iframe
          src={embed}
          title={video.title}
          scrolling="no"
          allow="encrypted-media"
          allowTransparency
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // Direct upload — HTML5 video
  return (
    <div className="aspect-[9/16] sm:aspect-auto sm:max-h-[80vh] w-full mx-auto rounded-2xl overflow-hidden bg-black shadow-elevated flex items-center justify-center">
      <video
        src={video.video_url}
        controls
        autoPlay
        playsInline
        poster={video.thumbnail_url ?? undefined}
        className="max-h-[80vh] w-full sm:w-auto"
      />
    </div>
  );
}

function FallbackLink({ video }: { video: Video }) {
  const { dict } = useT();
  return (
    <div className="rounded-2xl bg-bg-elevated p-8 text-center max-w-md mx-auto">
      <p className="text-ink-muted text-sm">{dict.videos.loadError}</p>
      <a
        href={video.video_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block link-plum link-underline text-[0.95rem]"
      >
        Open in a new tab →
      </a>
    </div>
  );
}
