'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { ProductGrid } from './product-grid';
import { MedicineDirectory } from './medicine-directory';
import { useT } from './i18n/language-provider';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { DirectoryProduct, ListingType, Product } from '@/lib/types';

/**
 * The directory hands rows to the same quick-view the shelf uses, so it loads
 * on first open rather than with the page.
 */
const ProductQuickView = dynamic(
  () => import('./product-quick-view').then((m) => m.ProductQuickView),
  { ssr: false, loading: () => null }
);

/**
 * Widen a slim directory row into the shape the quick-view expects.
 *
 * The list query selects four columns on purpose (see DirectoryProduct), so
 * the description arrives separately — fetched for the one row being opened,
 * which is one tiny query per drawer rather than 4,000 descriptions per page.
 */
function asProduct(row: DirectoryProduct, description: string | null): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Product['category'],
    description,
    image_url: null,
    in_stock: row.in_stock,
    is_own_brand: false,
    listing_type: 'directory',
    created_at: '',
  };
}

export function ProductsTabs({
  featured,
  directory,
  initialTab,
  initialCategory,
  openItemId,
}: {
  featured: Product[];
  directory: DirectoryProduct[];
  initialTab: ListingType;
  initialCategory: string;
  openItemId?: string;
}) {
  const { dict } = useT();
  const [tab, setTab] = React.useState<ListingType>(initialTab);
  const [directoryItem, setDirectoryItem] = React.useState<DirectoryProduct | null>(null);
  /**
   * The opened row's description, fetched on demand. Keyed by id so a slow
   * response for a row the visitor has already closed can never paint its
   * description under a different name.
   */
  const [detail, setDetail] = React.useState<{ id: string; description: string | null } | null>(
    null
  );

  // The drawer opens immediately on the four columns we already have; the
  // description appears a moment later if the admin has written one. Products
  // are publicly readable, so this goes straight out on the anon client.
  React.useEffect(() => {
    if (!directoryItem) {
      setDetail(null);
      return;
    }
    const { id } = directoryItem;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('products')
          .select('description')
          .eq('id', id)
          .maybeSingle();
        if (!cancelled) {
          setDetail({ id, description: (data?.description as string | null) ?? null });
        }
      } catch {
        // No description rather than no drawer.
        if (!cancelled) setDetail({ id, description: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [directoryItem]);

  // A ?item= that belongs to the directory opens there; the shelf handles its
  // own deep link internally.
  React.useEffect(() => {
    if (!openItemId) return;
    const match = directory.find((d) => d.id === openItemId);
    if (match) {
      setTab('directory');
      setDirectoryItem(match);
    }
  }, [openItemId, directory]);

  const select = (next: ListingType) => {
    setTab(next);
    // Keep the URL shareable without a navigation: replaceState leaves the
    // scroll position and the mounted list exactly as they are.
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    url.searchParams.delete('item');
    window.history.replaceState(null, '', url.toString());
  };

  const TABS: { value: ListingType; label: string }[] = [
    { value: 'directory', label: dict.products.tabDirectory },
    { value: 'featured', label: dict.products.tabFeatured },
  ];

  return (
    <div>
      {/* Same underline-tab treatment as the category filters below. */}
      <div className="border-b border-line">
        <ul className="-mx-1 flex items-stretch gap-1 px-1">
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <li key={t.value} className="shrink-0">
                <button
                  type="button"
                  onClick={() => select(t.value)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    '-mb-px inline-flex items-center border-b-2 px-4 py-3 text-[0.9375rem] font-medium transition-colors',
                    active
                      ? 'border-plum text-plum'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  )}
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6">
        {tab === 'directory' ? (
          <MedicineDirectory items={directory} onOpenItem={setDirectoryItem} />
        ) : (
          <ProductGrid
            products={featured}
            initialCategory={initialCategory}
            openItemId={openItemId}
          />
        )}
      </div>

      {directoryItem && (
        <ProductQuickView
          product={asProduct(
            directoryItem,
            detail?.id === directoryItem.id ? detail.description : null
          )}
          onClose={() => setDirectoryItem(null)}
        />
      )}
    </div>
  );
}
