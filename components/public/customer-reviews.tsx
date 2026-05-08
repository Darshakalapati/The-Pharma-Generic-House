import { createClient } from '@/lib/supabase/server';
import { GOOGLE_REVIEWS_URL } from '@/lib/constants';
import { ReviewCard } from './review-card';
import type { Review } from '@/lib/types';

export async function CustomerReviews() {
  const supabase = createClient();
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
    <section className="container-public mt-20 sm:mt-28">
      <div className="max-w-2xl">
        <span className="eyebrow">From Google</span>
        <h2 className="h-section mt-4">What our customers say.</h2>
        <p className="mt-4 text-[1.0625rem] text-ink-muted leading-[1.7]">
          Verified reviews from families who trust us with their health.
        </p>
      </div>

      {reviews.length === 1 ? (
        <div className="mt-10 max-w-md mx-auto">
          <ReviewCard review={reviews[0]} />
        </div>
      ) : (
        // Mobile: horizontal scroll with peek of next card.
        // Tablet+: responsive grid (2 cols sm, 3 cols lg).
        <div
          className="
            mt-10 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4
            sm:grid sm:grid-cols-2 sm:overflow-visible sm:gap-5 sm:mx-0 sm:px-0 sm:pb-0
            lg:grid-cols-3
          "
        >
          {reviews.map((r) => (
            <div
              key={r.id}
              className="
                snap-start shrink-0 w-[88vw] max-w-[360px]
                sm:w-auto sm:max-w-none sm:shrink
              "
            >
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline link-plum text-[0.95rem] font-medium"
        >
          Read all reviews on Google →
        </a>
      </div>
    </section>
  );
}
