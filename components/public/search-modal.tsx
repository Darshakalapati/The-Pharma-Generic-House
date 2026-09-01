'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useT } from './i18n/language-provider';
import { useWhatsAppHelper } from './whatsapp-helper';
import { formatSpecialty, cn } from '@/lib/utils';
import type { SearchIndex } from '@/app/api/search-index/route';

interface SearchValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const Ctx = React.createContext<SearchValue | null>(null);

export function useSearch(): SearchValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}

interface Hit {
  group: 'products' | 'tests' | 'doctors';
  id: string;
  label: string;
  sub?: string;
  href: string;
}

const MAX_PER_GROUP = 5;

/**
 * Ranks a candidate against the query.
 *
 * Three tiers rather than a fuzzy score: an exact prefix is almost always what
 * someone meant, a word-start match is usually right, and a bare substring is
 * a fallback. Returns 0 for no match so callers can filter on truthiness.
 */
function score(name: string, query: string): number {
  const n = name.toLowerCase();
  if (n.startsWith(query)) return 3;
  if (n.split(/[\s(/,-]+/).some((w) => w.startsWith(query))) return 2;
  if (n.includes(query)) return 1;
  return 0;
}

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
    <Ctx.Provider value={value}>
      {children}
      <SearchPalette />
    </Ctx.Provider>
  );
}

function SearchPalette() {
  const { dict } = useT();
  const { isOpen, close } = useSearch();
  const { open: openHelper } = useWhatsAppHelper();
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [index, setIndex] = React.useState<SearchIndex | null>(null);
  const [query, setQuery] = React.useState('');
  const [cursor, setCursor] = React.useState(0);

  // Fetched once, the first time the palette is opened.
  React.useEffect(() => {
    if (!isOpen || index) return;
    let cancelled = false;
    fetch('/api/search-index')
      .then((r) => r.json())
      .then((d: SearchIndex) => {
        if (!cancelled) setIndex(d);
      })
      .catch(() => {
        if (!cancelled) setIndex({ products: [], tests: [], doctors: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, index]);

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCursor(0);
      // Focus after the element exists.
      const id = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  const hits: Hit[] = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !index) return [];
    const take = <T,>(rows: T[], name: (r: T) => string, make: (r: T) => Hit): Hit[] =>
      rows
        .map((r) => ({ r, s: score(name(r), q) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || name(a.r).length - name(b.r).length)
        .slice(0, MAX_PER_GROUP)
        .map((x) => make(x.r));

    return [
      ...take(index.products, (p) => p.name, (p) => ({
        group: 'products', id: p.id, label: p.name, href: `/products?item=${p.id}`,
      })),
      ...take(index.tests, (t) => t.name, (t) => ({
        group: 'tests', id: t.id, label: t.name, href: `/tests?book=${t.id}`,
      })),
      ...take(index.doctors, (d) => d.name, (d) => ({
        group: 'doctors', id: d.id, label: d.name,
        sub: formatSpecialty(d.specialty, dict), href: `/doctors?book=${d.id}`,
      })),
    ];
  }, [query, index, dict]);

  const go = React.useCallback(
    (hit: Hit) => {
      close();
      router.push(hit.href);
    },
    [close, router]
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, Math.max(0, hits.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === 'Enter' && hits[cursor]) {
        e.preventDefault();
        go(hits[cursor]);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, hits, cursor, close, go]);

  if (!isOpen) return null;

  const groups: { key: Hit['group']; label: string }[] = [
    { key: 'products', label: dict.search.products },
    { key: 'tests', label: dict.search.tests },
    { key: 'doctors', label: dict.search.doctors },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <div aria-hidden className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={close} />
      <div
        role="dialog"
        aria-label={dict.search.open}
        className={cn(
          'relative flex w-full flex-col overflow-hidden bg-bg-elevated',
          'h-full sm:mt-[10vh] sm:h-auto sm:max-h-[70vh] sm:w-[640px] sm:rounded-2xl',
          'border-line sm:border shadow-elevated'
        )}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder={dict.search.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[1.0625rem] text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="button"
            onClick={close}
            aria-label={dict.search.close}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-sand hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {query.trim() && hits.length === 0 && (
            <button
              type="button"
              onClick={() => {
                close();
                openHelper();
              }}
              className="w-full rounded-lg px-3 py-4 text-left text-[0.9375rem] text-plum hover:bg-plum-tint"
            >
              {dict.search.empty}
            </button>
          )}

          {groups.map((group) => {
            const rows = hits.filter((h) => h.group === group.key);
            if (rows.length === 0) return null;
            return (
              <div key={group.key} className="mb-2">
                <p className="eyebrow px-3 py-2 text-[0.625rem]">{group.label}</p>
                {rows.map((hit) => {
                  const i = hits.indexOf(hit);
                  return (
                    <button
                      key={`${hit.group}-${hit.id}`}
                      type="button"
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(hit)}
                      className={cn(
                        'flex w-full items-baseline gap-2 rounded-lg px-3 py-2.5 text-left',
                        i === cursor ? 'bg-plum-tint text-ink' : 'text-ink hover:bg-sand'
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate text-[0.9375rem]">{hit.label}</span>
                      {hit.sub && (
                        <span className="shrink-0 text-[0.75rem] text-ink-muted">{hit.sub}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
