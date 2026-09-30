'use client';

import * as React from 'react';
import { Phone, MessageCircle, PhoneOutgoing } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { whatsappLink } from '@/lib/utils';

/**
 * Call / WhatsApp / Mark called for one pending callback, inline on the
 * dashboard. `router.refresh()` re-runs the page's server fetch, so the stat
 * card count drops in the same interaction rather than waiting for a reload.
 */
export function CallbackRowActions({ id, phone }: { id: string; phone: string }) {
  const router = useRouter();
  const [working, setWorking] = React.useState(false);

  const markCalled = async () => {
    setWorking(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('callback_requests')
        .update({ status: 'called' })
        .eq('id', id);
      if (error) throw error;
      toast.success('Marked as called.');
      router.refresh();
    } catch {
      toast.error('Could not update.');
    } finally {
      setWorking(false);
    }
  };

  const link =
    'inline-flex items-center gap-1 rounded-md border border-brand-line px-2 py-1 text-xs font-medium transition-colors';

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5">
      <a href={`tel:+91${phone}`} className={`${link} text-brand-ink hover:border-brand-purple`}>
        <Phone className="h-3 w-3" /> Call
      </a>
      <a
        href={whatsappLink(
          `91${phone}`,
          'Hello, this is The Pharma Generic House returning your callback request.'
        )}
        target="_blank"
        rel="noopener noreferrer"
        className={`${link} text-brand-teal-deep hover:border-brand-teal`}
      >
        <MessageCircle className="h-3 w-3" /> WhatsApp
      </a>
      <button
        type="button"
        onClick={markCalled}
        disabled={working}
        className={`${link} border-brand-purple text-brand-purple hover:bg-brand-purple/5 disabled:opacity-50`}
      >
        <PhoneOutgoing className="h-3 w-3" /> {working ? 'Saving…' : 'Mark called'}
      </button>
    </div>
  );
}
