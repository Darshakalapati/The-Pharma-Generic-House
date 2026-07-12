'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

export function PublicMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) {
    return <main className="min-h-[60vh]">{children}</main>;
  }

  return (
    <motion.main
      key={pathname}
      className="min-h-[60vh]"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      {children}
    </motion.main>
  );
}
