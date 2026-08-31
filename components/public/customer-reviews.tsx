import { createClient } from '@/lib/supabase/server';
import { getShopSettings } from '@/lib/settings';
import { GoogleRatingLine } from './google-rating';
import { GOOGLE_REVIEWS_URL } from '@/lib/constants';
import { ReviewGrid } from './review-grid';
import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import type { Review } from '@/lib/types';

export async function CustomerReviews() {
  const supabase = createClient();
  const settings = await getShopSettings();
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  const reviews = (data as Review[] | null) ?? [];

  // Hide the entire section when there are no active reviews.
  if (reviews.length === 0) return null;

  return (
    <ScrollReveal as="section" className="container-public mt-20 sm:mt-28">
      <ScrollRevealItem as="div">
        <span className="eyebrow">From Google</span>
        <h2 className="h-section mt-4 max-w-2xl">What our customers say.</h2>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between md:gap-8">
          <p className="text-[1.0625rem] text-ink-muted leading-[1.7] max-w-2xl">
            Verified reviews from people who trust us with their health.
          </p>
          <GoogleRatingLine
            rating={settings.google_rating}
            count={settings.google_review_count}
            className="shrink-0"
          />
        </div>
      </ScrollRevealItem>

      <ReviewGrid reviews={reviews} />

      <ScrollRevealItem as="div" className="mt-10 text-center">
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline link-plum text-[0.95rem] font-medium"
        >
          Read all reviews on Google →
        </a>
      </ScrollRevealItem>
    </ScrollReveal>
  );
}
