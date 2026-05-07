'use client';

import * as React from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { useEnquiryCart } from './enquiry-cart-context';
import type { Product } from '@/lib/types';

const FILTERS = [
  { value: 'all', label: 'All Products' },
  ...PRODUCT_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
];

export function ProductGrid({
  products,
  initialCategory = 'all',
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const [category, setCategory] = React.useState<string>(initialCategory);
  const [query, setQuery] = React.useState('');
  const { items, add } = useEnquiryCart();

  const filtered = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.description ?? '').toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const inCart = (id: string) => items.some((i) => i.product_id === id);

  return (
    <div>
      {/* Filter row */}
      <div className="border-b border-line">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-1">
          {/* Tab-style filters */}
          <div className="-mx-1 px-1 overflow-x-auto">
            <ul className="flex items-stretch gap-1">
              {FILTERS.map((f) => {
                const active = category === f.value;
                return (
                  <li key={f.value} className="shrink-0">
                    <button
                      onClick={() => setCategory(f.value)}
                      className={cn(
                        'inline-flex items-center px-4 py-3 text-[0.9375rem] font-medium transition-colors',
                        'border-b-2 -mb-px',
                        active
                          ? 'text-plum border-plum'
                          : 'text-ink-muted border-transparent hover:text-ink'
                      )}
                    >
                      {f.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Search input */}
          <div className="relative lg:w-72 max-w-full pb-3 lg:pb-0">
            <Search
              aria-hidden
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint pointer-events-none"
            />
            <input
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field pl-9 h-10"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center text-ink-muted">
          <p>No products match. Try another category, or message us on WhatsApp.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              added={inCart(p.id)}
              onAdd={() => add({ product_id: p.id, product_name: p.name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  added,
  onAdd,
}: {
  product: Product;
  added: boolean;
  onAdd: () => void;
}) {
  const cat = PRODUCT_CATEGORIES.find((c) => c.value === product.category);
  return (
    <article className="card-soft overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-sand overflow-hidden">
        {product.image_url ? (
          // Use plain img to allow any external host (picsum, supabase-stored uploads, unsplash)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-smooth hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-ink-faint text-xs">
            No image
          </div>
        )}
        {!product.in_stock && (
          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-md bg-bg-elevated/95 backdrop-blur border border-line text-[0.7rem] font-medium text-ink-muted">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="eyebrow eyebrow--teal text-[0.7rem]">
          {cat?.label ?? product.category}
        </span>
        <h3 className="mt-2 font-serif font-medium text-[1.0625rem] leading-snug tracking-[-0.005em]">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1.5 text-[0.85rem] text-ink-muted leading-snug line-clamp-2">
            {product.description}
          </p>
        )}
        <button
          onClick={onAdd}
          disabled={!product.in_stock}
          className={cn(
            'mt-4 inline-flex items-center gap-1.5 self-start rounded-md px-2.5 py-1.5 -ml-2.5 text-[0.875rem] font-medium transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            added
              ? 'text-plum bg-plum-tint'
              : 'text-plum hover:bg-plum-tint'
          )}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add to Enquiry
            </>
          )}
        </button>
      </div>
    </article>
  );
}
