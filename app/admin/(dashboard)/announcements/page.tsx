import { PageHeader } from '@/components/admin/page-header';
import { AnnouncementsManager } from '@/components/admin/announcements-manager';
import { createClient } from '@/lib/supabase/server';
import type { Announcement } from '@/lib/types';

export const metadata = { title: 'Announcements' };

export default async function AdminAnnouncementsPage() {
  const supabase = createClient();
  // Unordered on purpose — the manager sorts newest-first client-side, so the
  // page still renders if migration 0012 (created_at) has not been applied.
  const { data } = await supabase.from('announcements').select('*');

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Save announcements and switch which one shows on the website. Only one can be live at a time."
      />
      <AnnouncementsManager announcements={(data as Announcement[] | null) ?? []} />
    </div>
  );
}
