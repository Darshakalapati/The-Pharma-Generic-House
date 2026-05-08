import { PageHeader } from '@/components/admin/page-header';
import { ReviewsManager } from '@/components/admin/reviews-manager';
import { createClient } from '@/lib/supabase/server';
import type { Review } from '@/lib/types';

export const metadata = { title: 'Customer Reviews' };

export default async function AdminReviewsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Customer Reviews"
        description="Manage Google reviews shown on the home page. Add reviews exactly as they appear on Google."
      />
      <ReviewsManager reviews={(data as Review[] | null) ?? []} />
    </div>
  );
}
