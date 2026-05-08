import { PageHeader } from '@/components/admin/page-header';
import { PromoBannersManager } from '@/components/admin/promo-banners-manager';
import { createClient } from '@/lib/supabase/server';
import type { PromoBanner } from '@/lib/types';

export const metadata = { title: 'Promo Banners' };

export default async function AdminPromoBannersPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('promo_banners')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Promo Banners"
        description="Manage advertising banners shown on the home page. Up to 3 active banners rotate automatically."
      />
      <PromoBannersManager banners={(data as PromoBanner[] | null) ?? []} />
    </div>
  );
}
