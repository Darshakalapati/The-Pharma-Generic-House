'use client';

import * as React from 'react';
import { Phone, MessageCircle, Check, CircleCheckBig, ChevronRight } from 'lucide-react';
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
  formatDateTime,
  whatsappLink,
  normalizePhoneIN,
} from '@/lib/utils';
import type { Enquiry, EnquiryStatus, EnquiryItem } from '@/lib/types';

export function EnquiriesTable({ rows }: { rows: Enquiry[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<'all' | EnquiryStatus>('all');
  const [active, setActive] = React.useState<Enquiry | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const updateStatus = async (id: string, status: EnquiryStatus) => {
    setWorking(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
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

  const buildWhatsApp = (e: Enquiry) => {
    const items = (e.items ?? []) as EnquiryItem[];
    const lines = [
      `Hi ${e.customer_name}, this is The Pharma Generic House.`,
      `About your enquiry:`,
      ...items.map((i, idx) => `${idx + 1}. ${i.product_name} — qty ${i.quantity}`),
      ``,
      `We have these available. When would you like to pick up / get them delivered?`,
    ].join('\n');
    return whatsappLink(normalizePhoneIN(e.customer_phone), lines);
  };

  return (
    <div>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-brand-muted">No enquiries to show.</div>
        ) : (
          <ul className="divide-y divide-brand-line">
            {filtered.map((e) => {
              const items = (e.items ?? []) as EnquiryItem[];
              const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <li key={e.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                  <button
                    onClick={() => setActive(e)}
                    className="flex-1 min-w-0 text-left flex items-center gap-3 hover:opacity-80"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-ink truncate">{e.customer_name}</p>
                      <p className="text-xs text-brand-muted truncate">
                        {items.length} item{items.length !== 1 && 's'} · {totalQty} qty · {e.customer_phone}
                      </p>
                      <p className="text-xs text-brand-muted truncate">
                        {items.map((i) => i.product_name).slice(0, 3).join(', ')}
                        {items.length > 3 && '...'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-brand-muted shrink-0" />
                  </button>

                  <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                    <StatusBadge status={e.status} />
                    {e.status === 'new' && (
                      <Button
                        size="sm"
                        variant="accent"
                        disabled={working === e.id}
                        onClick={() => updateStatus(e.id, 'contacted')}
                      >
                        <Check className="h-3.5 w-3.5" /> Contacted
                      </Button>
                    )}
                    {e.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="accent"
                        disabled={working === e.id}
                        onClick={() => updateStatus(e.id, 'completed')}
                      >
                        <CircleCheckBig className="h-3.5 w-3.5" /> Complete
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${e.customer_phone}`}>
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="whatsapp">
                      <a href={buildWhatsApp(e)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="p-0">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.customer_name}</SheetTitle>
                <SheetDescription>
                  Submitted {formatDateTime(active.created_at)}
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 pb-6 space-y-4">
                <Field label="Status">
                  <StatusBadge status={active.status} />
                </Field>
                <Field label="Phone">
                  <a href={`tel:${active.customer_phone}`} className="text-brand-purple">
                    {active.customer_phone}
                  </a>
                </Field>
                {active.notes && <Field label="Notes">{active.notes}</Field>}
                <div className="rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
                    Items requested
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {((active.items ?? []) as EnquiryItem[]).map((it, idx) => (
                      <li key={idx} className="text-sm flex justify-between">
                        <span>{it.product_name}</span>
                        <span className="text-brand-muted">qty {it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
    <div className="rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">{label}</p>
      <div className="mt-1 text-sm text-brand-ink whitespace-pre-wrap">{children}</div>
    </div>
  );
}
