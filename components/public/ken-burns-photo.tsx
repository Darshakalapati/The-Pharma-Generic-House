'use client';

import * as React from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface KenBurnsSlide {
  id: string;
  image_url: string;
  alt_text: string | null;
}

/** Crossfade length. Also padded onto the zoom so it spans a layer's whole life. */
const FADE_MS = 1400;

interface Props {
  slides: KenBurnsSlide[];
  /** How long each photo is on screen before the next one fades in. */
  cycleMs?: number;
  /** End scale of the zoom. Kept small — the zoom should be felt, not seen. */
  zoomScale?: number;
  /** Fallback alt when a slide has none. */
  fallbackAlt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * A slowly zooming photograph, optionally rotating through several.
 *
 * Each visible photo is a stacked layer running its own zoom; advancing pushes
 * a new layer that crossfades in over the one below, so a single photo loops
 * seamlessly and multiple photos dissolve into each other. Only the two most
 * recent layers are kept mounted.
 *
 * The zoom and fade are CSS animations (see `.kb-layer` in globals.css) rather
 * than framer-motion values: a 20–30 second transform belongs on the
 * compositor, where it stays at 60fps without per-frame JS. Under
 * `prefers-reduced-motion` the ticker never starts and CSS pins every layer
 * to its resting state.
 */
export function KenBurnsPhoto({
  slides,
  cycleMs = 12000,
  zoomScale = 1.08,
  fallbackAlt,
  sizes,
  priority = false,
  className,
}: Props) {
  const reduced = useReducedMotion();
  const [layers, setLayers] = React.useState<{ key: number; index: number }[]>([
    { key: 0, index: 0 },
  ]);

  // Restart the rotation when the photo set itself changes — e.g. an admin
  // adds a photo and router.refresh() feeds new props in.
  const slidesKey = slides.map((s) => s.id).join('|');
  React.useEffect(() => {
    setLayers([{ key: 0, index: 0 }]);
  }, [slidesKey]);

  const count = slides.length;
  React.useEffect(() => {
    if (reduced || count === 0) return;
    const timer = window.setInterval(() => {
      setLayers((prev) => {
        const last = prev[prev.length - 1];
        return [last, { key: last.key + 1, index: (last.index + 1) % count }];
      });
    }, cycleMs);
    return () => window.clearInterval(timer);
  }, [reduced, count, cycleMs, slidesKey]);

  if (count === 0) return null;

  return (
    <div className={cn('absolute inset-0', className)}>
      {layers.map((layer, i) => {
        const slide = slides[layer.index] ?? slides[0];
        return (
          <div
            key={layer.key}
            data-enter={i > 0 ? 'true' : 'false'}
            className="kb-layer"
            style={
              {
                '--kb-duration': `${cycleMs + FADE_MS}ms`,
                '--kb-fade': `${FADE_MS}ms`,
                '--kb-scale': zoomScale,
              } as React.CSSProperties
            }
          >
            <Image
              src={slide.image_url}
              alt={slide.alt_text?.trim() || fallbackAlt}
              fill
              sizes={sizes}
              priority={priority && layer.key === 0}
              className="h-full w-full object-cover object-center"
            />
          </div>
        );
      })}
    </div>
  );
}
