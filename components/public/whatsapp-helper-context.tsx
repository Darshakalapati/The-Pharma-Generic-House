'use client';

import * as React from 'react';

export interface HelperValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

/**
 * Separate module so the provider and the lazily loaded card can share the
 * context without importing one another.
 */
export const HelperCtx = React.createContext<HelperValue | null>(null);

/** Lets the float, the sticky bar and the dock tile all trigger the same card. */
export function useWhatsAppHelper(): HelperValue {
  const ctx = React.useContext(HelperCtx);
  if (!ctx) throw new Error('useWhatsAppHelper must be used within WhatsAppHelperProvider');
  return ctx;
}
