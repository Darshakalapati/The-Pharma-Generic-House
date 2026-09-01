'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { FaqForm } from './faq-form';
import { createClient } from '@/lib/supabase/client';
import type { Faq } from '@/lib/types';

export function FaqsManager({ faqs }: { faqs: Faq[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Faq | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<Faq | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () =>
      [...faqs].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
    [faqs]
  );

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const toggleActive = async (f: Faq) => {
    setWorking(f.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('faqs')
        .update({ is_active: !f.is_active })
        .eq('id', f.id);
      if (error) throw error;
      toast.success(`Marked as ${!f.is_active ? 'active' : 'inactive'}.`);
      router.refresh();
    } catch {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  /** Swap with the neighbour, then renumber 1..N so the order stays unambiguous. */
  const move = async (id: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((f) => f.id === id);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[idx], next[target]] = [next[target], next[idx]];

    setWorking(id);
    try {
      const supabase = createClient();
      const results = await Promise.all(
        next.map((f, i) => supabase.from('faqs').update({ display_order: i + 1 }).eq('id', f.id))
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      router.refresh();
    } catch {
      toast.error('Could not reorder.');
    } finally {
      setWorking(null);
    }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setWorking(confirmDel.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('faqs').delete().eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('FAQ deleted.');
      setConfirmDel(null);
      router.refresh();
    } catch {
      toast.error('Could not delete.');
    } finally {
      setWorking(null);
    }
  };

  return (
    <>
      <div className="rounded-xl bg-brand-cream-warm p-5 text-sm text-brand-ink">
        <strong className="font-medium">Tip:</strong> Answer the questions customers ask
        at the counter. Add the Telugu version too — without it, Telugu readers see the
        English answer.
      </div>

      <div className="flex justify-end mt-5 mb-5">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No FAQs yet. Click &quot;Add FAQ&quot; to add one.
        </div>
      ) : (
        <ul className="surface-card overflow-hidden divide-y divide-brand-line">
          {sorted.map((f, i) => (
            <li key={f.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => move(f.id, -1)}
                    disabled={i === 0 || working !== null}
                    aria-label="Move up"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(f.id, 1)}
                    disabled={i === sorted.length - 1 || working !== null}
                    aria-label="Move down"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-ink">{f.question}</p>
                  <p className="mt-1 text-xs text-brand-muted line-clamp-2">{f.answer}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {f.question_te && f.answer_te && (
                      <Badge variant="muted" className="gap-1">
                        <Languages className="h-3 w-3" /> Telugu
                      </Badge>
                    )}
                    <span className="text-[0.7rem] text-brand-muted">
                      Order: {f.display_order}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                <div className="flex items-center gap-2 text-xs text-brand-muted px-2">
                  <span>Active</span>
                  <Switch
                    checked={f.is_active}
                    disabled={working === f.id}
                    onCheckedChange={() => toggleActive(f)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(f);
                    setFormOpen(true);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDel(f)}
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FaqForm faq={editing} open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.question}</strong> will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={working === confirmDel?.id}
              onClick={doDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
