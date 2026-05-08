import { PageHeader } from '@/components/admin/page-header';
import { AnnouncementForm } from '@/components/admin/announcement-form';
import { createClient } from '@/lib/supabase/server';
import type { Announcement } from '@/lib/types';

export const metadata = { title: 'Announcement banner' };

export default async function AdminAnnouncementsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Announcement Banner"
        description="The bar at the top of every page on your website."
      />
      <AnnouncementForm announcement={(data as Announcement | null) ?? null} />
    </div>
  );
}
