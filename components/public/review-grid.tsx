'use client';

import { ReviewCard } from './review-card';
import { StaggerGrid, StaggerGridItem } from '@/components/public/motion/scroll-reveal';
import type { Review } from '@/lib/types';

export function ReviewGrid({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 1) {
    return (
      <StaggerGrid className="mt-10 max-w-md mx-auto" stagger={0.08}>
        <StaggerGridItem>
          <ReviewCard review={reviews[0]} />
        </StaggerGridItem>
      </StaggerGrid>
    );
  }

  return (
    <StaggerGrid
      className="
        mt-10 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4
        sm:grid sm:grid-cols-2 sm:overflow-visible sm:gap-5 sm:mx-0 sm:px-0 sm:pb-0
        lg:grid-cols-3
      "
      stagger={0.08}
    >
      {reviews.map((r) => (
        <StaggerGridItem
          key={r.id}
          className="
            snap-start shrink-0 w-[88vw] max-w-[360px]
            sm:w-auto sm:max-w-none sm:shrink
          "
        >
          <ReviewCard review={r} />
        </StaggerGridItem>
      ))}
    </StaggerGrid>
  );
}
