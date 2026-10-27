'use client';

import * as React from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { WhatsAppGlyph } from './whatsapp-glyph';
import { useT } from './i18n/language-provider';
import { useEnquiryCart } from './enquiry-cart-context';
import { useWhatsAppHelper } from './whatsapp-helper';
import { whatsappLink, cn } from '@/lib/utils';
import { DIRECTORY_CATEGORIES, SHOP_WHATSAPP } from '@/lib/constants';
import type { DirectoryProduct } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/types';

/** Digit-led and symbol-led names collect under one heading. */
const OTHER_KEY = '#';
/**
 * Rows mounted on first render.
 *
 * `content-visibility` spares the browser laying out and painting off-screen
 * groups, but React still has to CREATE every node, and the server still has to
 * serialise it: 4,046 rows is ~49,000 elements and a 7-second first paint. So
 * only the first groups are rendered up front and the rest mount as they come
 * near the viewport. Deliberately a row budget rather than a group count, so
 * one enormous letter cannot blow the budget on its own.
 */
const INITIAL_ROW_BUDGET = 150;
/** Mount a group this far before it reaches the viewport. */
const MOUNT_MARGIN = '800px';
/**
 * Rendered height of one row, measured — 53px at both 375px and 1440px, and
 * constant because names are truncated to a single line.
 *
 * This has to be right, not approximate: an unmounted group reserves
 * rows × this, so under-reserving makes the document grow as groups mount and
 * sends the letter-jump scroll to the wrong place.
 */
const ROW_HEIGHT = 53;
/** How far off the target may land before the jump corrects itself. */
const JUMP_TOLERANCE = 24;
/** Correction frames allowed after a jump. */
const JUMP_ATTEMPTS = 10;
/** Height of a group's sticky letter heading, measured. */
const HEADING_HEIGHT = 39;
const LETTERS = [OTHER_KEY, ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

/** Category chip labels come from the dictionary; values from constants. */
function categoryLabel(value: string, dict: Dictionary): string {
  switch (value) {
    case 'medicine': return dict.directory.medicine;
    case 'herbal': return dict.directory.herbal;
    case 'surgical': return dict.directory.surgical;
    case 'wellness': return dict.directory.wellness;
    case 'general': return dict.directory.general;
    default: return value;
  }
}

function groupKey(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return first >= 'A' && first <= 'Z' ? first : OTHER_KEY;
}

function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m));
}

/**
 * The salt-name directory: ~4,000 rows, searched in the browser.
 *
 * Everything is in memory and filtered synchronously on each keystroke. At
 * this size a lowercase `includes` over a pre-lowered array is well under a
 * frame, so there is no debounce and no request per keystroke — and no
 * virtualisation library either. What keeps the DOM affordable instead is
 * `content-visibility: auto` on each letter group (see `.dir-group` in
 * globals.css): the browser skips layout and paint for groups that are off
 * screen, while `contain-intrinsic-size` keeps the scrollbar honest.
 */
export function MedicineDirectory({
  items,
  onOpenItem,
}: {
  items: DirectoryProduct[];
  /** Hands the row to the shared quick-view, which copes with no image. */
  onOpenItem: (item: DirectoryProduct) => void;
}) {
  const { dict } = useT();
  const { items: cartItems, add } = useEnquiryCart();
  const { open: openHelper } = useWhatsAppHelper();
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('all');

  // Autofocus on desktop only: stealing focus on a phone throws up the
  // keyboard and hides the list the visitor came to look at.
  React.useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      inputRef.current?.focus();
    }
  }, []);

  /** Lowercased once, not per keystroke. */
  const searchable = React.useMemo(
    () => items.map((p) => ({ p, lower: p.name.toLowerCase() })),
    [items]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return searchable
      .filter(({ p, lower }) => {
        if (category !== 'all' && p.category !== category) return false;
        return q === '' || lower.includes(q);
      })
      .map(({ p }) => p);
  }, [searchable, query, category]);

  /** Letter groups, in A–Z order with `#` first. */
  const groups = React.useMemo(() => {
    const map = new Map<string, DirectoryProduct[]>();
    for (const p of filtered) {
      const k = groupKey(p.name);
      const bucket = map.get(k);
      if (bucket) bucket.push(p);
      else map.set(k, [p]);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.name.localeCompare(b.name));
    }
    return LETTERS.filter((l) => map.has(l)).map((l) => ({ letter: l, rows: map.get(l)! }));
  }, [filtered]);

  const present = React.useMemo(() => new Set(groups.map((g) => g.letter)), [groups]);

  /**
   * The letters whose rows are actually in the DOM.
   *
   * Seeded from the row budget — a pure function of the data, so the server and
   * the client agree and hydration is clean.
   */
  const initialMounted = React.useMemo(() => {
    const out = new Set<string>();
    let budget = INITIAL_ROW_BUDGET;
    for (const g of groups) {
      out.add(g.letter);
      budget -= g.rows.length;
      if (budget <= 0) break;
    }
    return out;
  }, [groups]);

  const [mounted, setMounted] = React.useState<Set<string>>(initialMounted);

  // A new filter is a new list: start again from its own budget. When the
  // result set is small enough there is nothing to defer, and `initialMounted`
  // already covers all of it.
  React.useEffect(() => {
    setMounted(initialMounted);
  }, [initialMounted]);

  const mountLetter = React.useCallback((letter: string) => {
    setMounted((prev) => (prev.has(letter) ? prev : new Set(prev).add(letter)));
  }, []);

  // One observer for every group shell. Shells are cheap (a heading and a
  // reserved-height div), so they all render; only their rows are deferred.
  const shellRefs = React.useRef(new Map<string, HTMLElement>());
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const letter = (entry.target as HTMLElement).dataset.letter;
          if (letter) mountLetter(letter);
        }
      },
      { rootMargin: MOUNT_MARGIN }
    );
    for (const node of shellRefs.current.values()) observer.observe(node);
    return () => observer.disconnect();
  }, [groups, mountLetter]);

  const registerShell = React.useCallback((letter: string, node: HTMLElement | null) => {
    if (node) shellRefs.current.set(letter, node);
    else shellRefs.current.delete(letter);
  }, []);
  const inCart = React.useCallback(
    (id: string) => cartItems.some((i) => i.product_id === id),
    [cartItems]
  );

  /**
   * Jump to a letter, then settle onto it.
   *
   * Deliberately NOT a smooth scroll. The list is ~215,000px tall and every
   * group is `content-visibility: auto`, so the browser resolves real heights
   * for sections as they pass the viewport — an animation travelling that far
   * is chasing a document that is still changing size underneath it, and
   * lands thousands of pixels out. An instant jump plus a few correction
   * frames converges instead.
   */
  const jumpTo = (letter: string) => {
    mountLetter(letter);
    const id = `dir-letter-${letter === OTHER_KEY ? 'other' : letter}`;
    let attempts = 0;
    const settle = () => {
      const node = document.getElementById(id);
      if (!node) return;
      const top = node.getBoundingClientRect().top;
      if (Math.abs(top) <= JUMP_TOLERANCE) return;
      node.scrollIntoView({ behavior: 'auto', block: 'start' });
      attempts += 1;
      if (attempts < JUMP_ATTEMPTS) requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
  };

  const countLine =
    query.trim() || category !== 'all'
      ? fill(dict.directory.countFiltered, { n: filtered.length, total: items.length })
      : fill(dict.directory.count, { n: items.length });

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.directory.searchPlaceholder}
          aria-label={dict.directory.searchPlaceholder}
          className="input-field h-14 pl-12 text-[1.0625rem]"
        />
      </div>

      {/* Category chips */}
      <div className="mt-4 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {[{ value: 'all', label: dict.directory.all }, ...DIRECTORY_CATEGORIES.map((c) => ({
            value: c.value,
            label: categoryLabel(c.value, dict),
          }))].map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              aria-pressed={category === c.value}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-[0.875rem] font-medium transition-colors',
                category === c.value
                  ? 'border-plum bg-plum text-white'
                  : 'border-line text-ink-muted hover:border-plum hover:text-plum'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* A–Z jump bar */}
      <div
        className="mt-3 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0"
        role="group"
        aria-label={dict.directory.letterJump}
      >
        <div className="flex w-max gap-1">
          {LETTERS.map((l) => {
            const has = present.has(l);
            return (
              <button
                key={l}
                type="button"
                disabled={!has}
                onClick={() => jumpTo(l)}
                aria-label={`${dict.directory.letterJump}: ${l}`}
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-md text-[0.8125rem] font-medium tabular-nums transition-colors',
                  has
                    ? 'text-ink-muted hover:bg-plum-tint hover:text-plum'
                    : 'text-ink-faint/40 cursor-default'
                )}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-[0.875rem] text-ink-muted tabular-nums">{countLine}</p>

      {/* List */}
      {groups.length === 0 ? (
        <button
          type="button"
          onClick={openHelper}
          className="mt-6 w-full rounded-xl border border-line bg-bg-elevated px-5 py-8 text-center text-[0.9375rem] font-medium text-plum hover:border-plum"
        >
          {dict.directory.empty}
        </button>
      ) : (
        <div className="mt-2">
          {groups.map((g) => {
            const isMounted = mounted.has(g.letter);
            return (
              <section
                key={g.letter}
                id={`dir-letter-${g.letter === OTHER_KEY ? 'other' : g.letter}`}
                data-letter={g.letter}
                ref={(node) => registerShell(g.letter, node)}
                /* Off-screen groups cost nothing to lay out — see the class. */
                className="dir-group scroll-mt-24"
                style={{
                  // Include the heading, or every skipped group is 39px short
                  // and the scrollbar drifts across the whole alphabet.
                  containIntrinsicSize: `auto ${g.rows.length * ROW_HEIGHT + HEADING_HEIGHT}px`,
                }}
              >
                <h3 className="sticky top-0 z-10 border-b border-line bg-bg/95 py-2 font-serif text-[1.125rem] font-medium text-plum backdrop-blur-sm">
                  {g.letter}
                </h3>
                {isMounted ? (
                  <ul>
                    {g.rows.map((row) => (
                      <DirectoryRow
                        key={row.id}
                        row={row}
                        dict={dict}
                        added={inCart(row.id)}
                        onOpen={() => onOpenItem(row)}
                        onAdd={() => add({ product_id: row.id, product_name: row.name })}
                      />
                    ))}
                  </ul>
                ) : (
                  /* Holds the right amount of space so the scrollbar is honest
                     and the letter bar lands where the rows will be. */
                  <div
                    aria-hidden
                    style={{ height: g.rows.length * ROW_HEIGHT }}
                  />
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * One row. Memoised because a keystroke re-renders the list, and the rows that
 * survive the filter are overwhelmingly unchanged.
 */
const DirectoryRow = React.memo(function DirectoryRow({
  row,
  dict,
  added,
  onOpen,
  onAdd,
}: {
  row: DirectoryProduct;
  dict: Dictionary;
  added: boolean;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const ask = whatsappLink(
    SHOP_WHATSAPP,
    dict.products.askMessage.replace('{product}', row.name)
  );
  const disabled = !row.in_stock || added;

  return (
    <li className="flex items-center gap-3 border-b border-line py-2.5">
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left text-[0.9375rem] text-ink hover:text-plum transition-colors"
      >
        <span className="block truncate">{row.name}</span>
      </button>

      <span className="hidden shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.6875rem] text-ink-muted sm:inline">
        {categoryLabel(row.category, dict)}
      </span>

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        aria-label={
          added ? `${row.name} ${dict.directory.added}` : `${dict.directory.add} ${row.name}`
        }
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[0.8125rem] font-medium transition-colors',
          added
            ? 'bg-teal-tint text-teal-deep cursor-not-allowed'
            : 'text-plum hover:bg-plum-tint disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent'
        )}
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{dict.directory.added}</span>
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{dict.directory.add}</span>
          </>
        )}
      </button>

      <a
        href={ask}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={dict.directory.askAria.replace('{name}', row.name)}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-teal-deep hover:bg-teal-tint"
      >
        <WhatsAppGlyph className="h-4 w-4" />
      </a>
    </li>
  );
});
