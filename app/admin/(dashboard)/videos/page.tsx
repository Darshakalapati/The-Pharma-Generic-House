import { PageHeader } from '@/components/admin/page-header';
import { VideosManager } from '@/components/admin/videos-manager';
import { createClient } from '@/lib/supabase/server';
import type { Video } from '@/lib/types';

export const metadata = { title: 'Videos' };

export default async function AdminVideosPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('videos')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  return (
    <div>
      <PageHeader
        title="Videos"
        description="Manage testimonials and customer videos shown on the home page."
      />
      <VideosManager videos={(data as Video[] | null) ?? []} />
    </div>
  );
}
