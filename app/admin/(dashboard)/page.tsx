import Link from 'next/link';
import {
  PhoneCall,
  Calendar,
  Activity,
  ShoppingBag,
  MessageSquare,
  ArrowRight,
  Plus,
  PlaySquare,
  Star,
  HelpCircle,
  Megaphone,
  Clock,
  Store,
  Home,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { Badge } from '@/components/ui/badge';
import { CallbackRowActions } from '@/components/admin/callback-row-actions';
import { createClient } from '@/lib/supabase/server';
import { whatsappLink, normalizePhoneIN, formatTime12 } from '@/lib/utils';
import type { CallbackRequest } from '@/lib/types';

export const metadata = { title: 'Dashboard' };

/* ------------------------------------------------------------------ */
/* Dates, in shop time                                                 */
/* ------------------------------------------------------------------ */

/**
 * Today's date in Asia/Kolkata as YYYY-MM-DD.
 *
 * The server may be anywhere; "today" on this screen has to mean today at the
 * counter in Vijayawada, or the morning list is wrong either side of midnight.
 */
function istToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return parts; // en-CA gives YYYY-MM-DD
}

/** IST weekday index, 0 = Sunday. */
function istDayIndex(): number {
  const wd = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(new Date());
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
}

/** The coming Sunday, or today when today *is* Sunday. */
function comingSunday(): { iso: string; daysAway: number } {
  const day = istDayIndex();
  const daysAway = day === 0 ? 0 : 7 - day;
  const [y, m, d] = istToday().split('-').map(Number);
  // Built in UTC from the IST calendar date, so the arithmetic can't slip a day.
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + daysAway);
  return { iso: base.toISOString().slice(0, 10), daysAway };
}

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const SOURCE_LABEL: Record<string, string> = { band: 'Band', slidein: 'Slide-in' };

/* ------------------------------------------------------------------ */

const QUICK_ACTIONS = [
  { label: 'Product', href: '/admin/products', icon: Plus },
  { label: 'Video', href: '/admin/videos', icon: PlaySquare },
  { label: 'Review', href: '/admin/reviews', icon: Star },
  { label: 'FAQ', href: '/admin/faqs', icon: HelpCircle },
  { label: 'Switch announcement', href: '/admin/announcements', icon: Megaphone },
  { label: 'Edit hours', href: '/admin/settings', icon: Clock },
];

export default async function AdminDashboard() {
  const supabase = createClient();
  const todayISO = istToday();
  const { iso: sundayISO, daysAway } = comingSunday();

  // One round trip. Counts use head:true so no rows come back for them.
  const [
    callbackCount,
    apptCount,
    testCount,
    enqCount,
    msgCount,
    todayAppts,
    pendingCallbacks,
    sundayTests,
  ] = await Promise.all([
    supabase.from('callback_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('test_bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('appointments')
      .select('id, patient_name, patient_phone, preferred_time, status, doctor:doctors(name)')
      .eq('preferred_date', todayISO)
      .in('status', ['pending', 'confirmed'])
      .order('preferred_time', { ascending: true })
      .limit(20),
    supabase
      .from('callback_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('test_bookings')
      .select('id, patient_name, patient_phone, collection_type, status, test:tests(name)')
      .eq('preferred_date', sundayISO)
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: true })
      .limit(20),
  ]);

  const appts = (todayAppts.data ?? []) as any[];
  const callbacks = (pendingCallbacks.data ?? []) as CallbackRequest[];
  const tests = (sundayTests.data ?? []) as any[];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A snapshot of what needs your attention today."
      />

      {/* Row 1 — the five things worth a number. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Pending callbacks"
          count={callbackCount.count ?? 0}
          href="/admin/callbacks"
          icon={PhoneCall}
          /* The only one where somebody is waiting for the phone to ring. */
          accent={(callbackCount.count ?? 0) > 0}
        />
        <StatCard title="New appointments" count={apptCount.count ?? 0} href="/admin/appointments" icon={Calendar} />
        <StatCard title="New test bookings" count={testCount.count ?? 0} href="/admin/test-bookings" icon={Activity} tone="teal" />
        <StatCard title="New enquiries" count={enqCount.count ?? 0} href="/admin/enquiries" icon={ShoppingBag} />
        <StatCard title="Unread messages" count={msgCount.count ?? 0} href="/admin/messages" icon={MessageSquare} tone="teal" />
      </div>

      {/* Row 2 */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* ---------------- Today ---------------- */}
        <div className="surface-card p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-brand-ink">Today</h2>
            <p className="text-xs text-brand-muted">{todayISO} · IST</p>
          </div>

          <h3 className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Appointments
          </h3>
          <ul className="mt-2 space-y-2">
            {appts.length === 0 ? (
              <li className="py-3 text-sm text-brand-muted">No appointments today.</li>
            ) : (
              appts.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-line/70 bg-brand-cream/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-ink">{a.patient_name}</p>
                    <p className="truncate text-xs text-brand-muted">
                      {a.doctor?.name ?? '—'} · {formatTime12(a.preferred_time)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={a.status === 'confirmed' ? 'info' : 'warning'}>{a.status}</Badge>
                    <a
                      href={whatsappLink(
                        normalizePhoneIN(a.patient_phone),
                        `Hello ${a.patient_name}, this is The Pharma Generic House about your appointment today.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-brand-teal-deep hover:underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                </li>
              ))
            )}
          </ul>

          <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
            Callbacks waiting
          </h3>
          <ul className="mt-2 space-y-2">
            {callbacks.length === 0 ? (
              <li className="py-3 text-sm text-brand-muted">No callbacks waiting.</li>
            ) : (
              callbacks.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 rounded-lg border border-brand-line/70 bg-brand-cream/40 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-ink">+91 {c.phone}</p>
                    <p className="truncate text-xs text-brand-muted">
                      {SOURCE_LABEL[c.source] ?? c.source} · {timeAgo(c.created_at)}
                    </p>
                  </div>
                  <CallbackRowActions id={c.id} phone={c.phone} />
                </li>
              ))
            )}
          </ul>
        </div>

        {/* ---------------- This Sunday ---------------- */}
        <div className="surface-card p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-brand-ink">This Sunday</h2>
            <Link
              href="/admin/test-bookings"
              className="inline-flex items-center gap-1 text-sm text-brand-purple"
            >
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="mt-1 text-xs text-brand-muted">
            {sundayISO} ·{' '}
            {daysAway === 0
              ? 'Sunday Test Day is today'
              : `Sunday Test Day in ${daysAway} ${daysAway === 1 ? 'day' : 'days'}`}
          </p>

          <ul className="mt-5 space-y-2">
            {tests.length === 0 ? (
              <li className="py-3 text-sm text-brand-muted">No bookings yet for Sunday.</li>
            ) : (
              tests.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-line/70 bg-brand-cream/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-ink">{t.patient_name}</p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-brand-muted">
                      {t.collection_type === 'home' ? (
                        <Home className="h-3 w-3 shrink-0" />
                      ) : (
                        <Store className="h-3 w-3 shrink-0" />
                      )}
                      {t.test?.name ?? '—'} · {t.collection_type === 'home' ? 'Home' : 'Shop'}
                    </p>
                  </div>
                  <a
                    href={whatsappLink(
                      normalizePhoneIN(t.patient_phone),
                      `Hello ${t.patient_name}, this is The Pharma Generic House about your test booking.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-medium text-brand-teal-deep hover:underline"
                  >
                    WhatsApp
                  </a>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Row 3 — Quick actions */}
      <div className="mt-8 surface-card p-6">
        <h2 className="font-serif text-xl font-semibold text-brand-ink">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href + a.label}
              href={a.href}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-line px-3 py-2 text-sm font-medium text-brand-ink transition-colors hover:border-brand-purple hover:text-brand-purple"
            >
              <a.icon className="h-3.5 w-3.5" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
