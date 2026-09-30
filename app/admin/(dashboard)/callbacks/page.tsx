import { PageHeader } from '@/components/admin/page-header';
import { CallbacksTable } from '@/components/admin/callbacks-table';
import { createClient } from '@/lib/supabase/server';
import type { CallbackRequest } from '@/lib/types';

export const metadata = { title: 'Callbacks' };

export default async function AdminCallbacksPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('callback_requests')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Callbacks"
        description="Visitors who asked to be called back. Ring them, then mark the request called."
      />
      <CallbacksTable rows={(data as CallbackRequest[] | null) ?? []} />
    </div>
  );
}
