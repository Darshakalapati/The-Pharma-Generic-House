'use client';

import * as React from 'react';
import { X, Plus, Check } from 'lucide-react';
import { WhatsAppGlyph } from './whatsapp-glyph';
import { useT } from './i18n/language-provider';
import { useEnquiryCart } from './enquiry-cart-context';
import { whatsappLink, cn } from '@/lib/utils';
import { PRODUCT_CATEGORIES, SHOP_WHATSAPP } from '@/lib/constants';
import type { Product } from '@/lib/types';

/**
 * Full product detail without leaving the grid.
 *
 * A drawer on desktop and a sheet on phones — either way the list stays
 * mounted behind it, so closing returns the visitor exactly where they were
 * rather than to the top of a re-rendered page.
 */
export function ProductQuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { dict } = useT();
  const { items, add } = useEnquiryCart();

  React.useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product) return null;

  const added = items.some((i) => i.product_id === product.id);
  const category = PRODUCT_CATEGORIES.find((c) => c.value === product.category);
  const catLabel =
    category?.value === 'general'
      ? dict.products.general
      : category?.value === 'pharma'
        ? dict.products.pharma
        : category?.value === 'ayurvedic'
          ? dict.products.ayurvedic
          : category?.value === 'cosmetic'
            ? dict.products.cosmetic
            : '';

  const askHref = whatsappLink(
    SHOP_WHATSAPP,
    dict.products.askMessage.replace('{product}', product.name)
  );

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-40 bg-ink/40" onClick={onClose} />
      <div
        role="dialog"
        aria-label={product.name}
        className={cn(
          'fixed z-50 flex flex-col overflow-y-auto bg-bg-elevated shadow-elevated',
          // Bottom sheet on phones, right drawer on desktop.
          'inset-x-0 bottom-0 max-h-[88vh] rounded-t-2xl',
          'sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none sm:border-l sm:border-line'
        )}
      >
        {/* Close sits in its own bar above the image rather than on top of it. */}
        <div className="flex shrink-0 justify-end border-b border-line px-3 py-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.products.quickViewClose}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-sand hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="aspect-square w-full shrink-0 bg-sand">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          {catLabel && <span className="eyebrow">{catLabel}</span>}
          <h2 className="mt-2 font-serif font-medium text-[1.5rem] leading-tight tracking-[-0.015em]">
            {product.name}
          </h2>

          <span
            className={cn(
              'mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[0.75rem] font-medium',
              product.in_stock
                ? 'bg-teal-tint text-teal-deep'
                : 'bg-sand text-ink-muted'
            )}
          >
            {product.in_stock ? dict.products.inStock : dict.products.outOfStockLong}
          </span>

          {product.description && (
            <p className="mt-4 text-[1rem] leading-[1.7] text-ink-muted">
              {product.description}
            </p>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-6">
            <button
              type="button"
              disabled={!product.in_stock || added}
              onClick={() => add({ product_id: product.id, product_name: product.name })}
              className={cn(
                'btn-plum w-full',
                added && 'pointer-events-none bg-teal-tint text-teal-deep border-teal-tint'
              )}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> {dict.cart.added}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> {dict.cart.addToEnquiry}
                </>
              )}
            </button>
            <a
              href={askHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-teal w-full"
            >
              <WhatsAppGlyph className="h-4 w-4" />
              {dict.products.askOnWhatsapp}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
