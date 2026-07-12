import { createClient } from '@/lib/supabase/server';
import { PromoBannerCarousel } from './promo-banner-carousel';
import { ScrollReveal, ScrollRevealItem } from '@/components/public/motion/scroll-reveal';
import type { PromoBanner } from '@/lib/types';

export async function PromoBanners() {
  const supabase = createClient();
  const { data } = await supabase
    .from('promo_banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  const banners = (data as PromoBanner[] | null) ?? [];

  // Hide the entire section while there are no active banners.
  if (banners.length === 0) return null;

  return (
    <ScrollReveal as="section" className="mt-20 sm:mt-28">
      <ScrollRevealItem>
        <PromoBannerCarousel banners={banners} />
      </ScrollRevealItem>
    </ScrollReveal>
  );
}
