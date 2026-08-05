'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { HeroPhotoForm } from './hero-photo-form';
import { createClient } from '@/lib/supabase/client';
import type { HeroPhoto } from '@/lib/types';

export function HeroPhotosManager({ photos }: { photos: HeroPhoto[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<HeroPhoto | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<HeroPhoto | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () =>
      [...photos].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
    [photos]
  );

  const activeCount = sorted.filter((p) => p.is_active).length;

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (p: HeroPhoto) => {
    setEditing(p);
    setFormOpen(true);
  };

  const toggleActive = async (p: HeroPhoto) => {
    setWorking(p.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('hero_photos')
        .update({ is_active: !p.is_active })
        .eq('id', p.id);
      if (error) throw error;
      toast.success(`Marked as ${!p.is_active ? 'active' : 'inactive'}.`);
      router.refresh();
    } catch {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  /** Swap with the neighbour, then renumber 1..N so the order stays unambiguous. */
  const move = async (photoId: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((p) => p.id === photoId);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[idx], next[target]] = [next[target], next[idx]];

    setWorking(photoId);
    try {
      const supabase = createClient();
      const results = await Promise.all(
        next.map((p, i) =>
          supabase.from('hero_photos').update({ display_order: i + 1 }).eq('id', p.id)
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
      const { error } = await supabase.from('hero_photos').delete().eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('Hero photo deleted.');
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
        <strong className="font-medium">Tip:</strong> Upload photos of your pharmacy
        interior, shelves, medicines, or the counter. Use landscape orientation (wider
        than tall). Recommended: 1600 × 1200px. Keep 1–4 active photos for the best
        effect.
      </div>

      <div className="flex items-center justify-between gap-3 mt-5 mb-5">
        <p className="text-xs text-brand-muted">
          {activeCount === 0
            ? 'No active photos — the hero shows the built-in pharmacy photo.'
            : activeCount === 1
              ? '1 active photo — it zooms slowly on a loop.'
              : `${activeCount} active photos — they rotate every 12 seconds.`}
        </p>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add Hero Photo
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No hero photos yet. Click &quot;Add Hero Photo&quot; to add one.
        </div>
      ) : (
        <ul className="surface-card overflow-hidden divide-y divide-brand-line">
          {sorted.map((p, i) => (
            <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(p.id, -1)}
                    disabled={i === 0 || working !== null}
                    aria-label="Move up"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(p.id, 1)}
                    disabled={i === sorted.length - 1 || working !== null}
                    aria-label="Move down"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Thumbnail */}
                <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-brand-cream-warm shrink-0">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.alt_text ?? 'Hero photo'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-brand-muted">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brand-ink truncate">
                    {p.alt_text || 'Inside The Pharma Generic House pharmacy'}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-brand-muted">
                    Order: {p.display_order}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                <div className="flex items-center gap-2 text-xs text-brand-muted px-2">
                  <span>Active</span>
                  <Switch
                    checked={p.is_active}
                    disabled={working === p.id}
                    onCheckedChange={() => toggleActive(p)}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDel(p)}
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <HeroPhotoForm photo={editing} open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete hero photo?</DialogTitle>
            <DialogDescription>
              This photo will be removed from the home page hero permanently. The image
              file in storage is not deleted automatically.
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
