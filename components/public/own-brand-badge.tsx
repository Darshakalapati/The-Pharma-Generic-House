import type { Dictionary } from '@/lib/i18n/types';

/**
 * Marks a product the shop bottles itself. Declared once so the card and the
 * quick-view can never drift apart on wording or weight.
 *
 * Only rendered when the flag is set, so a card without it keeps exactly the
 * spacing it had before — no reserved row, no layout shift.
 */
export function OwnBrandBadge({ dict }: { dict: Dictionary }) {
  return (
    <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-teal">
      {dict.products.ownBrand}
    </span>
  );
}
