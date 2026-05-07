import { PageHeader } from '@/components/admin/page-header';
import { TestBookingsTable } from '@/components/admin/test-bookings-table';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Test bookings' };

export default async function AdminTestBookingsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('test_bookings')
    .select('*, test:tests(id, name, price)')
    .order('preferred_date', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Test bookings"
        description="Lab tests booked by customers. Confirm a slot, then WhatsApp them the details."
      />
      <TestBookingsTable rows={(data as any[]) ?? []} />
    </div>
  );
}
