'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** How far outside the button the cursor still pulls it, in px. */
const PROXIMITY = 40;
/** Maximum lean. Deliberately tiny — it should read as weight, not movement. */
const MAX_SHIFT = 3;

/**
 * Wraps a call-to-action so it leans a few pixels toward a nearby cursor and
 * springs back when the pointer leaves.
 *
 * Only ever active on a fine pointer: touch devices have no hover, and a
 * transform that fires on tap would fight the tap itself. The mousemove
 * listener does nothing but schedule a frame, and all the geometry runs inside
 * that frame, so rapid movement costs one rect read per repaint rather than
 * one per event.
 */
export function Magnetic({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const frame = React.useRef<number | null>(null);
  const reduced = useReducedMotion();
  const [pointerFine, setPointerFine] = React.useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  React.useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setPointerFine(fine.matches);
    sync();
    fine.addEventListener('change', sync);
    return () => fine.removeEventListener('change', sync);
  }, []);

  const active = pointerFine && !reduced;

  React.useEffect(() => {
    if (!active) {
      x.set(0);
      y.set(0);
      return;
    }

    const onMove = (event: MouseEvent) => {
      // Throttle to one measurement per animation frame.
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);

        // Distance from the button's edge, not its centre, so big and small
        // buttons both start pulling at the same visual gap.
        const gapX = Math.max(0, Math.abs(dx) - rect.width / 2);
        const gapY = Math.max(0, Math.abs(dy) - rect.height / 2);
        const gap = Math.hypot(gapX, gapY);

        if (gap > PROXIMITY) {
          x.set(0);
          y.set(0);
          return;
        }

        const falloff = 1 - gap / PROXIMITY;
        const length = Math.hypot(dx, dy) || 1;
        x.set((dx / length) * MAX_SHIFT * falloff);
        y.set((dy / length) * MAX_SHIFT * falloff);
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [active, x, y]);

  return (
    <motion.span
      ref={ref}
      style={active ? { x: springX, y: springY } : undefined}
      className={cn('inline-flex', className)}
    >
      {children}
    </motion.span>
  );
}
