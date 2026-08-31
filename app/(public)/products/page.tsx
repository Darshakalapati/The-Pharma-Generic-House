import { createClient } from '@/lib/supabase/server';
import { getShopSettings } from '@/lib/settings';
import { ProductGrid } from '@/components/public/product-grid';
import { EnquiryCartProvider } from '@/components/public/enquiry-cart-context';
import { EnquiryCartPanel } from '@/components/public/enquiry-cart-panel';
import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import { WhatsAppGlyph } from '@/components/public/whatsapp-glyph';
import { whatsappLink } from '@/lib/utils';
import { SHOP_WHATSAPP, PRESCRIPTION_WA_TEXT } from '@/lib/constants';
import type { Product } from '@/lib/types';

export const metadata = {
  title: 'Products',
  description:
    'Browse general medicines, prescription pharma, Ayurvedic preparations, and personal care from The Pharma Generic House.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const supabase = createClient();
  const settings = await getShopSettings();

  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const products: Product[] = data ?? [];
  const initialCategory = searchParams.cat ?? 'all';

  return (
    <EnquiryCartProvider>
      <ScrollReveal as="section" className="container-public pt-12 sm:pt-16 pb-8">
        <ScrollRevealItem as="div" className="max-w-2xl">
          <span className="eyebrow">Catalogue</span>
          <h1 className="h-hero mt-4 text-balance">Browse our shelves.</h1>
          <p className="mt-5 text-[1.0625rem] text-ink-muted leading-[1.7]">
            Add what you need to your enquiry list and we&apos;ll confirm availability on
            WhatsApp. Pick up from the shop or arrange home delivery.
          </p>
          <a
            href={whatsappLink(SHOP_WHATSAPP, PRESCRIPTION_WA_TEXT)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-teal mt-6 h-12 w-full sm:h-10 sm:w-auto"
          >
            <WhatsAppGlyph className="h-4 w-4" />
            Send prescription on WhatsApp
          </a>
        </ScrollRevealItem>
      </ScrollReveal>

      <ScrollReveal as="section" className="container-public mt-6 sm:mt-10 pb-16">
        <ScrollRevealItem>
          <ProductGrid products={products} initialCategory={initialCategory} />
        </ScrollRevealItem>
      </ScrollReveal>

      <EnquiryCartPanel
        whatsappNumber={settings.shop_whatsapp}
        reservationEnabled={settings.reservation_pickup_enabled}
      />
    </EnquiryCartProvider>
  );
}
