import { PageHeader } from '@/components/admin/page-header';
import { EnquiriesTable } from '@/components/admin/enquiries-table';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Product enquiries' };

export default async function AdminEnquiriesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Product enquiries"
        description="Customers asking about products. WhatsApp them with the pre-filled item list."
      />
      <EnquiriesTable rows={(data as any[]) ?? []} />
    </div>
  );
}
