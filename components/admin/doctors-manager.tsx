'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, ImageOff, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DoctorForm } from './doctor-form';
import { createClient } from '@/lib/supabase/client';
import { formatINR, formatTime12, formatSpecialty } from '@/lib/utils';
import type { Doctor } from '@/lib/types';

export function DoctorsManager({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Doctor | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<Doctor | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () =>
      [...doctors].sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return (a.display_order ?? 0) - (b.display_order ?? 0);
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
    [doctors]
  );

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (d: Doctor) => {
    setEditing(d);
    setFormOpen(true);
  };

  /** Swap with the neighbour, then renumber 1..N so the order stays unambiguous. */
  const move = async (doctorId: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((d) => d.id === doctorId);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[idx], next[target]] = [next[target], next[idx]];

    setWorking(doctorId);
    try {
      const supabase = createClient();
      const results = await Promise.all(
        next.map((d, i) =>
          supabase.from('doctors').update({ display_order: i + 1 }).eq('id', d.id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      router.refresh();
    } catch {
      toast.error('Could not reorder. Have you run migration 0013 in Supabase?');
    } finally {
      setWorking(null);
    }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setWorking(confirmDel.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('doctors').delete().eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('Doctor deleted.');
      setConfirmDel(null);
      router.refresh();
    } catch (e: any) {
      toast.error('Could not delete. Are there appointments linked?');
    } finally {
      setWorking(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-5">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add doctor
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No doctors yet. Click &quot;Add doctor&quot; to add one.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((d, i) => {
            const sp = formatSpecialty(d.specialty);
            return (
              <div key={d.id} className="surface-card overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-brand-cream-warm relative overflow-hidden">
                  {d.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.photo_url} alt={d.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-brand-muted">
                      <ImageOff className="h-7 w-7" />
                    </div>
                  )}
                  {/* Position in the public listing, at a glance. */}
                  <span className="absolute left-2 top-2 grid h-7 min-w-7 place-items-center rounded-full bg-brand-ink/80 px-2 text-xs font-semibold text-white">
                    {i + 1}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant={d.is_on_request ? 'muted' : 'accent'}>
                      {d.is_on_request ? 'On request' : sp}
                    </Badge>
                    {!d.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-semibold">{d.name}</h3>
                  {d.consultation_fee != null && (
                    <p className="text-sm text-brand-muted">{formatINR(d.consultation_fee)}</p>
                  )}
                  {!d.is_on_request &&
                    d.available_days.length > 0 &&
                    d.available_time_start &&
                    d.available_time_end && (
                      <p className="mt-1 text-xs text-brand-muted">
                        {d.available_days.join(', ')} ·{' '}
                        {formatTime12(d.available_time_start)}–{formatTime12(d.available_time_end)}
                      </p>
                    )}
                  <div className="mt-4 pt-3 border-t border-brand-line/70 flex gap-2">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(d.id, -1)}
                        disabled={i === 0 || working !== null}
                        aria-label="Move up"
                        className="grid h-8 w-8 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(d.id, 1)}
                        disabled={i === sorted.length - 1 || working !== null}
                        aria-label="Move down"
                        className="grid h-8 w-8 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => startEdit(d)} className="flex-1">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDel(d)}
                      className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DoctorForm doctor={editing} open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete doctor?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.name}</strong> will be removed permanently. Existing
              appointments linked to this doctor will also be removed.
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
