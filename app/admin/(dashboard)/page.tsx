import Link from 'next/link';
import { Calendar, Activity, ShoppingBag, MessageSquare, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatTime12 } from '@/lib/utils';

export const metadata = { title: 'Dashboard' };

function nextSundayISO() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const next = new Date(d);
  next.setDate(d.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next.toISOString().slice(0, 10);
}

export default async function AdminDashboard() {
  const supabase = createClient();

  const todayISO = new Date().toISOString().slice(0, 10);
  const sundayISO = nextSundayISO();

  const [
    apptsCount,
    testsCount,
    enqCount,
    msgCount,
    todayAppts,
    sundayTests,
  ] = await Promise.all([
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('test_bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('appointments')
      .select('*, doctor:doctors(name)')
      .eq('preferred_date', todayISO)
      .order('preferred_time', { ascending: true })
      .limit(10),
    supabase
      .from('test_bookings')
      .select('*, test:tests(name)')
      .eq('preferred_date', sundayISO)
      .order('created_at', { ascending: true })
      .limit(10),
  ]);

  return (
    <div>
      <PageHeader title="Dashboard" description="A snapshot of what needs your attention today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="New appointments" count={apptsCount.count ?? 0} href="/admin/appointments" icon={Calendar} />
        <StatCard title="New test bookings" count={testsCount.count ?? 0} href="/admin/test-bookings" icon={Activity} tone="teal" />
        <StatCard title="New enquiries" count={enqCount.count ?? 0} href="/admin/enquiries" icon={ShoppingBag} />
        <StatCard title="Unread messages" count={msgCount.count ?? 0} href="/admin/messages" icon={MessageSquare} tone="teal" />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Today&apos;s appointments</h2>
            <Link href="/admin/appointments" className="text-sm text-brand-purple inline-flex items-center gap-1">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="text-xs text-brand-muted mt-1">{formatDate(todayISO)}</p>
          <ul className="mt-4 space-y-2">
            {(todayAppts.data ?? []).length === 0 ? (
              <li className="text-sm text-brand-muted py-4">Nothing scheduled for today.</li>
            ) : (
              (todayAppts.data ?? []).map((a: any) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-line/70 bg-brand-cream/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.patient_name}</p>
                    <p className="text-xs text-brand-muted truncate">
                      {a.doctor?.name ?? '—'} · {formatTime12(a.preferred_time)}
                    </p>
                  </div>
                  <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Upcoming tests this Sunday</h2>
            <Link href="/admin/test-bookings" className="text-sm text-brand-purple inline-flex items-center gap-1">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="text-xs text-brand-muted mt-1">{formatDate(sundayISO)}</p>
          <ul className="mt-4 space-y-2">
            {(sundayTests.data ?? []).length === 0 ? (
              <li className="text-sm text-brand-muted py-4">No bookings yet for Sunday.</li>
            ) : (
              (sundayTests.data ?? []).map((t: any) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-line/70 bg-brand-cream/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.patient_name}</p>
                    <p className="text-xs text-brand-muted truncate">
                      {t.test?.name ?? '—'} · {t.collection_type === 'home' ? 'Home' : 'Shop'}
                    </p>
                  </div>
                  <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function statusVariant(s: string): any {
  switch (s) {
    case 'pending':
    case 'new':
      return 'warning';
    case 'confirmed':
    case 'contacted':
    case 'read':
      return 'info';
    case 'completed':
    case 'replied':
      return 'success';
    case 'cancelled':
      return 'destructive';
    default:
      return 'muted';
  }
}
