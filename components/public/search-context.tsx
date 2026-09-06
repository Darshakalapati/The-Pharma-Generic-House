'use client';

import * as React from 'react';

export interface SearchValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

/**
 * Lives in its own module so the provider and the (lazily loaded) palette can
 * both reach the context without importing each other.
 */
export const SearchCtx = React.createContext<SearchValue | null>(null);

export function useSearch(): SearchValue {
  const ctx = React.useContext(SearchCtx);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
