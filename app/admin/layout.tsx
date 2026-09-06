import type { Metadata } from 'next';

/**
 * Exists only to mark the whole admin panel — dashboard and login alike —
 * noindex. robots.txt already disallows /admin, but a crawler that ignores it,
 * or a link shared out of the panel, still gets the header.
 *
 * Renders children untouched so it adds no DOM and changes no layout. The
 * login page is a client component and cannot export metadata itself, which
 * is why this sits at /admin rather than inside (dashboard).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
