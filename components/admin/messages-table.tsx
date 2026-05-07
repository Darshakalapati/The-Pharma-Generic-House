'use client';

import * as React from 'react';
import { Phone, MessageCircle, Mail, Check, CircleCheckBig, ChevronRight } from 'lucide-react';
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
import type { ContactMessage, MessageStatus } from '@/lib/types';

export function MessagesTable({ rows }: { rows: ContactMessage[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<'all' | MessageStatus>('all');
  const [active, setActive] = React.useState<ContactMessage | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  const updateStatus = async (id: string, status: MessageStatus) => {
    setWorking(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(`Marked as ${status}.`);
      router.refresh();
      if (active?.id === id) setActive((m) => (m ? { ...m, status } : m));
    } catch (e: any) {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  return (
    <div>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
          <TabsTrigger value="replied">Replied</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-brand-muted">No messages to show.</div>
        ) : (
          <ul className="divide-y divide-brand-line">
            {filtered.map((m) => (
              <li key={m.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <button
                  onClick={() => {
                    setActive(m);
                    if (m.status === 'new') updateStatus(m.id, 'read');
                  }}
                  className="flex-1 min-w-0 text-left flex items-center gap-3 hover:opacity-80"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-ink truncate">{m.name}</p>
                    <p className="text-xs text-brand-muted truncate">{m.message}</p>
                    <p className="text-xs text-brand-muted truncate">
                      {m.phone} · {formatDateTime(m.created_at)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-muted shrink-0" />
                </button>

                <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                  <StatusBadge status={m.status} />
                  {m.status !== 'replied' && (
                    <Button
                      size="sm"
                      variant="accent"
                      disabled={working === m.id}
                      onClick={() => updateStatus(m.id, 'replied')}
                    >
                      <CircleCheckBig className="h-3.5 w-3.5" /> Replied
                    </Button>
                  )}
                  {m.status === 'new' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={working === m.id}
                      onClick={() => updateStatus(m.id, 'read')}
                    >
                      <Check className="h-3.5 w-3.5" /> Read
                    </Button>
                  )}
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${m.phone}`}>
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="whatsapp">
                    <a
                      href={whatsappLink(normalizePhoneIN(m.phone), `Hi ${m.name}, this is The Pharma Generic House. About your message:`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
                <SheetTitle>{active.name}</SheetTitle>
                <SheetDescription>
                  Received {formatDateTime(active.created_at)}
                </SheetDescription>
              </SheetHeader>
              <div className="px-6 pb-6 space-y-4">
                <Field label="Status">
                  <StatusBadge status={active.status} />
                </Field>
                <Field label="Phone">
                  <a href={`tel:${active.phone}`} className="text-brand-purple">
                    {active.phone}
                  </a>
                </Field>
                {active.email && (
                  <Field label="Email">
                    <a href={`mailto:${active.email}`} className="text-brand-purple inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {active.email}
                    </a>
                  </Field>
                )}
                <Field label="Message">{active.message}</Field>
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
