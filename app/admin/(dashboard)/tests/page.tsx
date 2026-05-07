import { PageHeader } from '@/components/admin/page-header';
import { TestsManager } from '@/components/admin/tests-manager';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Tests' };

export default async function AdminTestsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('tests')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Tests"
        description="Manage the lab tests offered at the shop."
      />
      <TestsManager tests={data ?? []} />
    </div>
  );
}
