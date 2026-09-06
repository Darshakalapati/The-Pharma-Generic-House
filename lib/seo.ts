import type { Metadata } from 'next';
import { SHOP_NAME } from '@/lib/constants';

/**
 * The site's canonical origin. `metadataBase` in the root layout is built from
 * this, so page-level `alternates.canonical` values can stay as bare paths.
 */
export const SITE_URL = 'https://www.pharmagenerichouse.com';

/**
 * Build a public page's metadata.
 *
 * Titles are passed whole and set as `absolute`: each one already ends in the
 * shop name, so letting the root layout's `%s · The Pharma Generic House`
 * template run would repeat it.
 *
 * `openGraph` is replaced wholesale by Next when a page declares it — only
 * the file-based OG image is inherited — so the site-wide fields are repeated
 * here rather than left to the root layout.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Route path, leading slash, no origin. Becomes the canonical URL. */
  path: string;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SHOP_NAME,
      locale: 'en_IN',
      url: path,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
