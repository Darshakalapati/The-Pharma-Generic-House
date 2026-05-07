'use client';

import * as React from 'react';
import {
  Phone,
  MessageCircle,
  Check,
  X,
  CircleCheckBig,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { StatusBadge } from './status-badge';
import { createClient } from '@/lib/supabase/client';
import {
  formatDate,
  formatTime12,
  whatsappLink,
  normalizePhoneIN,
  cn,
} from '@/lib/utils';
import type { Appointment, AppointmentStatus, Doctor } from '@/lib/types';

type Row = Appointment & { doctor?: Pick<Doctor, 'id' | 'name' | 'specialty'> };

export function AppointmentsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<'all' | AppointmentStatus>('all');
  const [active, setActive] = React.useState<Row | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    setWorking(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Marked as ${status}.`);
      router.refresh();
      if (active?.id === id) setActive((a) => (a ? { ...a, status } : a));
    } catch (e: any) {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  const buildWhatsApp = (a: Row) => {
    const lines = [
      `Hi ${a.patient_name}, this is The Pharma Generic House.`,
      `Your appointment with ${a.doctor?.name ?? 'our doctor'} is confirmed for`,
      `${formatDate(a.preferred_date)} at ${formatTime12(a.preferred_time)}.`,
      'Please reply if you need to reschedule.',
    ].join('\n');
    return whatsappLink(normalizePhoneIN(a.patient_phone), lines);
  };

  return (
    <div>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-brand-muted">No appointments to show.</div>
        ) : (
          <ul className="divide-y divide-brand-line">
            {filtered.map((a) => (
              <li key={a.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <button
                  onClick={() => setActive(a)}
                  className="flex-1 min-w-0 text-left flex items-center gap-3 hover:opacity-80"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-ink truncate">{a.patient_name}</p>
                    <p className="text-xs text-brand-muted truncate">
                      {a.doctor?.name ?? '—'} · {formatDate(a.preferred_date)} · {formatTime12(a.preferred_time)}
                    </p>
                    <p className="text-xs text-brand-muted truncate">{a.patient_phone}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-muted shrink-0" />
                </button>

                <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                  <StatusBadge status={a.status} />
                  {a.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="accent"
                      disabled={working === a.id}
                      onClick={() => updateStatus(a.id, 'confirmed')}
                    >
                      <Check className="h-3.5 w-3.5" /> Confirm
                    </Button>
                  )}
                  {a.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="accent"
                      disabled={working === a.id}
                      onClick={() => updateStatus(a.id, 'completed')}
                    >
                      <CircleCheckBig className="h-3.5 w-3.5" /> Complete
                    </Button>
                  )}
                  {a.status !== 'cancelled' && a.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={working === a.id}
                      onClick={() => updateStatus(a.id, 'cancelled')}
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${a.patient_phone}`}>
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="whatsapp">
                    <a href={buildWhatsApp(a)} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="p-0">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.patient_name}</SheetTitle>
                <SheetDescription>
                  Appointment with {active.doctor?.name ?? '—'}
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 pb-6 space-y-4">
                <Field label="Status">
                  <StatusBadge status={active.status} />
                </Field>
                <Field label="Phone">
                  <a href={`tel:${active.patient_phone}`} className="text-brand-purple">
                    {active.patient_phone}
                  </a>
                </Field>
                {active.patient_age && <Field label="Age">{active.patient_age}</Field>}
                <Field label="Date">{formatDate(active.preferred_date)}</Field>
                <Field label="Time">{formatTime12(active.preferred_time)}</Field>
                {active.notes && <Field label="Notes">{active.notes}</Field>}
                <Field label="Submitted">{formatDate(active.created_at)}</Field>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3')}>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">{label}</p>
      <div className="mt-1 text-sm text-brand-ink whitespace-pre-wrap">{children}</div>
    </div>
  );
}
