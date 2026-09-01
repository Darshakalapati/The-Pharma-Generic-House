'use client';

import * as React from 'react';
import type { Dictionary, Locale } from '@/lib/i18n/types';

interface LanguageValue {
  dict: Dictionary;
  locale: Locale;
}

const Ctx = React.createContext<LanguageValue | null>(null);

/**
 * Carries the server-read dictionary down to client components.
 *
 * Mounted once in the public layout, so the chosen dictionary crosses the
 * server/client boundary a single time as props. Client components call
 * `useT()` instead of importing the dictionaries themselves, which keeps both
 * languages out of every individual bundle.
 */
export function LanguageProvider({
  dict,
  locale,
  children,
}: LanguageValue & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ dict, locale }), [dict, locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT(): LanguageValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useT must be used within a LanguageProvider');
  return ctx;
}
