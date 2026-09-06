'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { SearchCtx, useSearch } from './search-context';

// Re-exported so the existing `import { useSearch } from './search-modal'`
// call sites keep working.
export { useSearch };

/**
 * The palette — its markup, the result ranking and the search index fetch —
 * is only needed once someone actually opens search, so it is split out of
 * the first-load bundle and fetched on the first open.
 *
 * `ssr: false` because it renders nothing until opened; there is no server
 * markup worth producing. No `loading` state either: the chunk lands in a
 * frame or two and a flashed spinner would read worse than the small delay.
 */
const SearchPalette = dynamic(
  () => import('./search-palette').then((m) => m.SearchPalette),
  { ssr: false, loading: () => null }
);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const value = React.useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  // Cmd/Ctrl+K from anywhere.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <SearchCtx.Provider value={value}>
      {children}
      {/* Mounting only while open is what keeps the chunk off first load;
          the palette already rendered null when closed, so nothing changes
          visually. */}
      {isOpen && <SearchPalette />}
    </SearchCtx.Provider>
  );
}
