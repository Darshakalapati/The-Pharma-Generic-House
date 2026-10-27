import { createClient } from '@/lib/supabase/server';
import { getShopSettings, getSchedule } from '@/lib/settings';
import { getDictionary, getLocale } from '@/lib/i18n';
import { ProductsTabs } from '@/components/public/products-tabs';
import { EnquiryCartProvider } from '@/components/public/enquiry-cart-context';
import { EnquiryCartPanel } from '@/components/public/enquiry-cart-panel';
import { CallbackSlideIn } from '@/components/public/callback-slidein';
import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import { WhatsAppGlyph } from '@/components/public/whatsapp-glyph';
import { whatsappLink } from '@/lib/utils';
import { SHOP_WHATSAPP, PRESCRIPTION_WA_TEXT, PRESCRIPTION_WA_TEXT_TE } from '@/lib/constants';
import type { DirectoryProduct, ListingType, Product } from '@/lib/types';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title:
    'Medicines & Personal Care in Vijayawada — Browse Our Shelves | The Pharma Generic House',
  description:
    'Search 4,000+ generic medicines by salt name — the composition, not the brand — plus Ayurvedic preparations and personal care at our Governerpeta shop in Vijayawada. Send your prescription on WhatsApp and we will confirm availability.',
  path: '/products',
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { cat?: string; item?: string; tab?: string };
}) {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const rxText = locale === 'te' ? PRESCRIPTION_WA_TEXT_TE : PRESCRIPTION_WA_TEXT;
  const supabase = createClient();
  const [settings, schedule] = await Promise.all([getShopSettings(), getSchedule()]);

  // Two queries, two shapes. The shelf needs whole rows for its photo cards;
  // the directory is ~4,000 rows and takes only the four columns it renders,
  // which is the difference between a small payload and a very large one.
  const [featuredRes, directoryRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('listing_type', 'featured')
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('id, name, category, in_stock')
      .eq('listing_type', 'directory')
      .order('name', { ascending: true }),
  ]);

  const featured: Product[] = featuredRes.data ?? [];
  const directory: DirectoryProduct[] = directoryRes.data ?? [];
  const initialCategory = searchParams.cat ?? 'all';

  // A ?cat= link is a shelf link, so honour it by opening that tab; otherwise
  // the directory leads, since it is what most people are looking for.
  const initialTab: ListingType =
    searchParams.tab === 'featured' || (!searchParams.tab && !!searchParams.cat)
      ? 'featured'
      : 'directory';

  return (
    <EnquiryCartProvider>
      <ScrollReveal as="section" className="container-public pt-12 sm:pt-16 pb-8">
        <ScrollRevealItem as="div" className="max-w-2xl">
          <span className="eyebrow">{dict.products.eyebrow}</span>
          <h1 className="h-hero mt-4 text-balance">{dict.products.heading}</h1>
          <p className="mt-5 text-[1.0625rem] text-ink-muted leading-[1.7]">
            {dict.products.sub}
          </p>
          <a
            href={whatsappLink(SHOP_WHATSAPP, rxText)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-teal mt-6 h-12 w-full sm:h-10 sm:w-auto"
          >
            <WhatsAppGlyph className="h-4 w-4" />
            {dict.hero.sendRx}
          </a>
        </ScrollRevealItem>
      </ScrollReveal>

      <ScrollReveal as="section" className="container-public mt-6 sm:mt-10 pb-16">
        <ScrollRevealItem>
          <ProductsTabs
            featured={featured}
            directory={directory}
            initialTab={initialTab}
            initialCategory={initialCategory}
            openItemId={searchParams?.item}
          />
        </ScrollRevealItem>
      </ScrollReveal>

      <EnquiryCartPanel
        whatsappNumber={settings.shop_whatsapp}
        reservationEnabled={settings.reservation_pickup_enabled}
      />

      <CallbackSlideIn phone={settings.shop_phone} schedule={schedule} />
    </EnquiryCartProvider>
  );
}
