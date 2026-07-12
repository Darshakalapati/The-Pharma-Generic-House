'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

/**
 * Wordmark with the "G" of "Generic" tinted in plum, evoking the shop's logo.
 * A small teal cross dot above the G ties to the logo's medical cross mark.
 */
export function Logo({ className }: LogoProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      className="inline-flex"
    >
    <Link
      href="/"
      aria-label="The Pharma Generic House — home"
      className={cn(
        'inline-flex items-baseline gap-1 font-serif text-ink',
        className
      )}
    >
      <span className="text-[1.0625rem] sm:text-[1.125rem] font-medium tracking-[-0.015em]">
        The Pharma{' '}
        <span className="relative inline-block text-plum">
          <span aria-hidden className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-[2px]">
            <Cross />
          </span>
          G
        </span>
        eneric House
      </span>
    </Link>
    </motion.div>
  );
}

/** Tiny medical-cross dot (teal) — used above the G in the wordmark. */
function Cross() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3.5 0.5h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3z" fill="#2A9B8E" />
    </svg>
  );
}

/** Larger wordmark for footer. */
export function FooterWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-serif font-medium text-[clamp(1.5rem,3.4vw,2rem)] tracking-[-0.02em] block',
        className
      )}
    >
      The Pharma{' '}
      <span className="text-plum-soft">Generic</span> House
    </span>
  );
}
