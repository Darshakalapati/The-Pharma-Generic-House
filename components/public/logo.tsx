'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  /** Show the "Vijayawada · Est. 2018" line under the wordmark. Public nav
   *  only — the admin sidebar renders the lockup without it. */
  tagline?: boolean;
  /** Show the wordmark on phones too. Public nav only, so the admin sidebar's
   *  compact mobile bar is left exactly as it was. */
  mobileWordmark?: boolean;
}

/**
 * Brand lockup: the shop's logo image followed by the wordmark in plain
 * Fraunces. The wordmark is hidden on mobile so the mark alone carries the
 * brand in the narrow nav.
 */
export function Logo({ className, tagline = false, mobileWordmark = false }: LogoProps) {
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
          'inline-flex items-center text-ink',
          mobileWordmark ? 'gap-2 sm:gap-3' : 'gap-3',
          className
        )}
      >
        <Image
          src="/logo.png"
          alt="The Pharma Generic House"
          width={491}
          height={498}
          priority
          className={cn('w-auto', mobileWordmark ? 'h-7 sm:h-10' : 'h-8 sm:h-10')}
        />
        <span className={cn('flex-col', mobileWordmark ? 'flex' : 'hidden sm:flex')}>
          {/* Steps down below 360px so the name always clears the hamburger. */}
          <span
            className={cn(
              'font-serif font-medium tracking-[-0.015em] leading-[1.2] text-ink whitespace-nowrap',
              mobileWordmark
                ? 'text-[0.875rem] min-[360px]:text-[0.9375rem] sm:text-[1.0625rem]'
                : 'text-[1.0625rem]'
            )}
          >
            The Pharma Generic House
          </span>
          {tagline && (
            <span className="hidden sm:block mt-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.14em] leading-[1.1] text-ink-muted">
              Vijayawada · Est. 2018
            </span>
          )}
        </span>
      </Link>
    </motion.div>
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
