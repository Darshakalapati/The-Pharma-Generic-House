'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, User } from 'lucide-react';
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
import { FamilyForm } from './family-form';
import { createClient } from '@/lib/supabase/client';
import type { FamilyMember } from '@/lib/types';

export function FamilyManager({ members }: { members: FamilyMember[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<FamilyMember | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<FamilyMember | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () =>
      [...members].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
    [members]
  );

  // The home page renders the first active member — mirror that here so the
  // admin can see which row is actually on the site.
  const featuredId = sorted.find((m) => m.is_active)?.id ?? null;

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (m: FamilyMember) => {
    setEditing(m);
    setFormOpen(true);
  };

  const toggleActive = async (m: FamilyMember) => {
    setWorking(m.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('family_members')
        .update({ is_active: !m.is_active })
        .eq('id', m.id);
      if (error) throw error;
      toast.success(`Marked as ${!m.is_active ? 'active' : 'inactive'}.`);
      router.refresh();
    } catch {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  /** Swap with the neighbour, then renumber 1..N so the order stays unambiguous. */
  const move = async (memberId: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((m) => m.id === memberId);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[idx], next[target]] = [next[target], next[idx]];

    setWorking(memberId);
    try {
      const supabase = createClient();
      const results = await Promise.all(
        next.map((m, i) =>
          supabase.from('family_members').update({ display_order: i + 1 }).eq('id', m.id)
        )
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
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('Family member deleted.');
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
        <strong className="font-medium">Tip:</strong> The featured family member (marked
        &quot;Show as Main&quot;) appears prominently on the home page with their photo
        and bio. The featured quote appears as a pull-quote in that section.
      </div>

      <div className="flex justify-end mt-5 mb-5">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add Family Member
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No family members yet. Click &quot;Add Family Member&quot; to add one.
        </div>
      ) : (
        <ul className="surface-card overflow-hidden divide-y divide-brand-line">
          {sorted.map((m, i) => (
            <li key={m.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(m.id, -1)}
                    disabled={i === 0 || working !== null}
                    aria-label="Move up"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(m.id, 1)}
                    disabled={i === sorted.length - 1 || working !== null}
                    aria-label="Move down"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="relative h-20 w-16 rounded-lg overflow-hidden bg-brand-cream-warm shrink-0">
                  {m.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo_url} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-brand-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-ink truncate">{m.name}</p>
                  <p className="text-xs text-brand-muted truncate">{m.role}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {m.id === featuredId && <Badge variant="muted">Show as Main</Badge>}
                    {m.is_featured_quote && (
                      <Badge variant="outline">Featured Quote</Badge>
                    )}
                    <span className="text-[0.7rem] text-brand-muted">
                      Order: {m.display_order}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                <div className="flex items-center gap-2 text-xs text-brand-muted px-2">
                  <span>Active</span>
                  <Switch
                    checked={m.is_active}
                    disabled={working === m.id}
                    onCheckedChange={() => toggleActive(m)}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(m)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDel(m)}
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FamilyForm member={editing} open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete family member?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.name}</strong> will be removed permanently. The photo
              in storage is not deleted automatically.
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
