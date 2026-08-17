'use client';

import * as React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const IN_MS = 250;
const HOLD_MS = 80;
const OUT_MS = 250;
const TOTAL_MS = IN_MS + HOLD_MS + OUT_MS; // 580 — inside the 600ms budget
const REDUCED_MS = 200;

/**
 * Branded transition between public routes: a plum panel sweeps in from the
 * left, holds just long enough to show the mark, then sweeps off to the right.
 *
 * It is a pure overlay — it never gates rendering of the page underneath, so a
 * slow route can't leave the visitor staring at a blocked screen. The panel
 * simply covers the swap.
 *
 * Deliberately absent on first paint: a wipe over content the visitor has not
 * seen yet reads as a loading screen. The ref below skips the initial
 * pathname, so only real navigations animate.
 *
 * Sits at z-45: over page content and the mobile action bar (z-30), under
 * every dialog and drawer (z-50) and the announcement banner (z-60).
 */
export function PageWipe() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  const previousPath = React.useRef<string | null>(null);
  const [runId, setRunId] = React.useState(0);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    // First pathname seen is the initial load — record it and stay quiet.
    if (previousPath.current === null) {
      previousPath.current = pathname;
      return;
    }
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    // A fresh key restarts the sweep, so navigating again mid-wipe replaces
    // the run in flight rather than queueing a second one.
    setRunId((n) => n + 1);
    setRunning(true);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {running && (
        <motion.div
          key={runId}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[45] flex items-center justify-center bg-plum"
          initial={reduced ? { opacity: 0 } : { x: '-100%' }}
          animate={
            reduced
              ? { opacity: [0, 1, 0] }
              : { x: ['-100%', '0%', '0%', '100%'] }
          }
          transition={
            reduced
              ? { duration: REDUCED_MS / 1000, times: [0, 0.5, 1], ease: 'easeInOut' }
              : {
                  duration: TOTAL_MS / 1000,
                  times: [0, IN_MS / TOTAL_MS, (IN_MS + HOLD_MS) / TOTAL_MS, 1],
                  ease: ['easeIn', 'linear', 'easeOut'],
                }
          }
          onAnimationComplete={() => setRunning(false)}
        >
          {!reduced && (
            <motion.span
              className="block"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.9, 0] }}
              transition={{
                duration: TOTAL_MS / 1000,
                times: [0, IN_MS / TOTAL_MS, (IN_MS + HOLD_MS) / TOTAL_MS, 1],
                ease: 'linear',
              }}
            >
              <Image
                src="/logo.png"
                alt=""
                width={491}
                height={498}
                priority={false}
                className="h-12 w-auto"
              />
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
