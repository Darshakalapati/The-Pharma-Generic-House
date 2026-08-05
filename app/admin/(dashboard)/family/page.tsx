import { PageHeader } from '@/components/admin/page-header';
import { FamilyManager } from '@/components/admin/family-manager';
import { createClient } from '@/lib/supabase/server';
import type { FamilyMember } from '@/lib/types';

export const metadata = { title: 'Meet the Family' };

export default async function AdminFamilyPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('family_members')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  return (
    <div>
      <PageHeader
        title="Meet the Family"
        description="Manage the family section on the home page. Add or update family members, upload photos, and set the featured quote."
      />
      <FamilyManager members={(data as FamilyMember[] | null) ?? []} />
    </div>
  );
}
