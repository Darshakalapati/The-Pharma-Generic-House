import { PageHeader } from '@/components/admin/page-header';
import { AppointmentsTable } from '@/components/admin/appointments-table';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Appointments' };

export default async function AdminAppointmentsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('appointments')
    .select('*, doctor:doctors(id, name, specialty)')
    .order('preferred_date', { ascending: false })
    .order('preferred_time', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Manage doctor appointments. Tap a row for full details."
      />
      <AppointmentsTable rows={(data as any[]) ?? []} />
    </div>
  );
}
