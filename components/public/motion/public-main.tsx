'use client';

/**
 * Page content wrapper.
 *
 * The route-change animation lives in `PageWipe`, which overlays the viewport
 * rather than wrapping the content. Keeping the content itself un-animated
 * means a slow route never renders behind a half-faded shell, and there is no
 * second transition competing with the wipe.
 */
export function PublicMain({ children }: { children: React.ReactNode }) {
  return <main className="min-h-[60vh]">{children}</main>;
}
