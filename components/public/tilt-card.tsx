'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Gentle bend toward the cursor — a lean, not a wobble. */
const MAX_ROTATE_Y = 8; // deg, left/right
const MAX_ROTATE_X = 6; // deg, up/down
const LIFT_PX = -4;
const HOVER_SCALE = 1.015;
const RETURN_MS = 400;

const REST_TRANSFORM =
  'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';

/**
 * A card that tilts in 3D toward the pointer.
 *
 * While tracking, the transform is written straight to the node inside a
 * requestAnimationFrame with `transition: none` — going through React state on
 * every mousemove is what makes this kind of effect jitter. The eased
 * transition is switched on only for the journey back to flat, which is what
 * gives it the settle rather than a snap.
 *
 * Gated on `(hover: hover) and (pointer: fine)`, so a touch device never tilts
 * and taps fall through to the links untouched. Under `prefers-reduced-motion`
 * the tilt is skipped entirely and only the background lift remains.
 */
export function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const [pointerFine, setPointerFine] = React.useState(false);
  const [tiltAllowed, setTiltAllowed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setPointerFine(fine.matches);
      setTiltAllowed(fine.matches && !reduced.matches);
    };
    sync();
    fine.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltAllowed) return;
    const node = ref.current;
    if (!node) return;

    const { left, top, width, height } = node.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    // -1 at the left/top edge, +1 at the right/bottom edge.
    const dx = ((e.clientX - left) / width) * 2 - 1;
    const dy = ((e.clientY - top) / height) * 2 - 1;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      node.style.transition = 'none';
      node.style.transform =
        `perspective(900px) rotateX(${(-dy * MAX_ROTATE_X).toFixed(2)}deg) ` +
        `rotateY(${(dx * MAX_ROTATE_Y).toFixed(2)}deg) ` +
        `translateY(${LIFT_PX}px) scale(${HOVER_SCALE})`;
    });
  };

  const handleLeave = () => {
    setHovered(false);
    const node = ref.current;
    if (!node) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    node.style.transition = `transform ${RETURN_MS}ms cubic-bezier(0, 0, 0.2, 1)`;
    node.style.transform = REST_TRANSFORM;
  };

  return (
    <div
      ref={ref}
      onMouseEnter={pointerFine ? () => setHovered(true) : undefined}
      onMouseMove={handleMove}
      onMouseLeave={pointerFine ? handleLeave : undefined}
      style={{
        transform: REST_TRANSFORM,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={cn(
        'transition-colors duration-200',
        // One background utility at a time — never two competing arbitrary
        // values whose winner would depend on stylesheet order.
        hovered
          ? 'bg-white/[0.04] shadow-[0_12px_32px_rgba(0,0,0,0.35)]'
          : 'bg-white/[0.02]',
        className
      )}
    >
      {children}
    </div>
  );
}
