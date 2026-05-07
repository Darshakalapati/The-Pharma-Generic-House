import { PageHeader } from '@/components/admin/page-header';
import { MessagesTable } from '@/components/admin/messages-table';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Messages' };

export default async function AdminMessagesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Messages from the contact form. Tap a message to read and reply."
      />
      <MessagesTable rows={(data as any[]) ?? []} />
    </div>
  );
}
