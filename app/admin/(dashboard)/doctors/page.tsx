import { PageHeader } from '@/components/admin/page-header';
import { DoctorsManager } from '@/components/admin/doctors-manager';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Doctors' };

export default async function AdminDoctorsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Manage doctors and their availability."
      />
      <DoctorsManager doctors={data ?? []} />
    </div>
  );
}
