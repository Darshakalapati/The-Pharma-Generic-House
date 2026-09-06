import {
  SHOP_NAME,
  SHOP_PHONE,
  SHOP_EMAIL,
  GOOGLE_REVIEWS_URL,
} from '@/lib/constants';
import { hoursSpecification, type Schedule } from '@/lib/hours';
import { SITE_URL } from '@/lib/seo';

/**
 * The shop's LocalBusiness entry, emitted once on the home page.
 *
 * Deliberately no `aggregateRating`: Google's structured-data policy
 * disallows self-reported ratings copied from a Google listing. The rating
 * badge on the page is display only.
 *
 * Opening hours are derived from the same live schedule the header, footer
 * and contact page read, so the markup can't drift from what visitors see.
 */
export function ShopJsonLd({ schedule }: { schedule: Schedule }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Pharmacy',
    name: SHOP_NAME,
    url: SITE_URL,
    telephone: SHOP_PHONE,
    email: SHOP_EMAIL,
    image: `${SITE_URL}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Opp Golden Pavilion, Governerpeta',
      addressLocality: 'Vijayawada',
      addressRegion: 'Andhra Pradesh',
      postalCode: '520002',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 16.5092295,
      longitude: 80.6240051,
    },
    openingHoursSpecification: hoursSpecification(schedule),
    sameAs: [GOOGLE_REVIEWS_URL],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
