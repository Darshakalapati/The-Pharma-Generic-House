import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const [appts, tests, enquiries, msgs] = await Promise.all([
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('test_bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  ]);

  const counts: Record<string, number> = {
    '/admin/appointments': appts.count ?? 0,
    '/admin/test-bookings': tests.count ?? 0,
    '/admin/enquiries': enquiries.count ?? 0,
    '/admin/messages': msgs.count ?? 0,
  };
  const newTotal =
    counts['/admin/appointments'] +
    counts['/admin/test-bookings'] +
    counts['/admin/enquiries'] +
    counts['/admin/messages'];

  return (
    <div className="min-h-screen bg-brand-cream lg:flex">
      <AdminSidebar counts={counts} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar email={user.email ?? ''} newCount={newTotal} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
