import { PageHeader } from '@/components/admin/page-header';
import { HeroPhotosManager } from '@/components/admin/hero-photos-manager';
import { createClient } from '@/lib/supabase/server';
import type { HeroPhoto } from '@/lib/types';

export const metadata = { title: 'Hero Photos' };

export default async function AdminHeroPhotosPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('hero_photos')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  return (
    <div>
      <PageHeader
        title="Hero Photos"
        description="Manage photos that appear on the home page hero. Active photos rotate every 12 seconds with a slow zoom effect."
      />
      <HeroPhotosManager photos={(data as HeroPhoto[] | null) ?? []} />
    </div>
  );
}
