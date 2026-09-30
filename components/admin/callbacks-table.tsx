'use client';

import * as React from 'react';
import { Phone, MessageCircle, PhoneOutgoing, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from './status-badge';
import { createClient } from '@/lib/supabase/client';
import { whatsappLink } from '@/lib/utils';
import type { CallbackRequest, CallbackStatus } from '@/lib/types';

/** Rows store ten bare digits; every display and link is built from that. */
function displayPhone(phone: string) {
  return `+91 ${phone}`;
}

/**
 * Submitted-at in the shop's own timezone. The rest of the admin uses
 * formatDateTime, which renders in the server's zone — for a "who do I ring
 * next" queue the shop's clock is the only one that means anything.
 */
function istTime(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

const SOURCE_LABEL: Record<string, string> = {
  band: 'Band',
  slidein: 'Slide-in',
};

export function CallbacksTable({ rows }: { rows: CallbackRequest[] }) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<'all' | CallbackStatus>('all');
  const [working, setWorking] = React.useState<string | null>(null);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);
  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  const updateStatus = async (id: string, status: CallbackStatus) => {
    setWorking(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('callback_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Marked as ${status}.`);
      router.refresh();
    } catch {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  return (
    <div>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="called">Called</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 surface-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-brand-muted">
            No callback requests to show.
          </div>
        ) : (
          <ul className="divide-y divide-brand-line">
            {filtered.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-brand-ink">{displayPhone(r.phone)}</p>
                  <p className="text-xs text-brand-muted">
                    {istTime(r.created_at)} IST
                    {r.note ? ` · ${r.note}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                  <Badge variant="muted">{SOURCE_LABEL[r.source] ?? r.source}</Badge>
                  <StatusBadge status={r.status} />

                  {r.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="accent"
                      disabled={working === r.id}
                      onClick={() => updateStatus(r.id, 'called')}
                    >
                      <PhoneOutgoing className="h-3.5 w-3.5" /> Mark called
                    </Button>
                  )}
                  {r.status !== 'closed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={working === r.id}
                      onClick={() => updateStatus(r.id, 'closed')}
                    >
                      <Archive className="h-3.5 w-3.5" /> Close
                    </Button>
                  )}

                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:+91${r.phone}`}>
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="whatsapp">
                    <a
                      href={whatsappLink(
                        `91${r.phone}`,
                        'Hello, this is The Pharma Generic House returning your callback request.'
                      )}
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
    </div>
  );
}
