'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

/**
 * Brand lockup: the shop's logo image followed by the wordmark in plain
 * Fraunces. The wordmark is hidden on mobile so the mark alone carries the
 * brand in the narrow nav.
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
        className={cn('inline-flex items-center gap-3 text-ink', className)}
      >
        <Image
          src="/logo.png"
          alt="The Pharma Generic House"
          width={512}
          height={512}
          priority
          className="h-8 w-auto sm:h-10"
        />
        <span className="hidden sm:inline font-serif text-[1.0625rem] font-medium tracking-[-0.015em] text-ink">
          The Pharma Generic House
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
