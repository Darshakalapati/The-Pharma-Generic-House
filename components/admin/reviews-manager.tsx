'use client';

import * as React from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Star,
  ExternalLink,
} from 'lucide-react';
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
import { ReviewForm } from './review-form';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { GOOGLE_REVIEWS_URL } from '@/lib/constants';
import type { Review } from '@/lib/types';

export function ReviewsManager({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Review | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<Review | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () =>
      [...reviews].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [reviews]
  );

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (r: Review) => {
    setEditing(r);
    setFormOpen(true);
  };

  const toggleActive = async (r: Review) => {
    setWorking(r.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('reviews')
        .update({ is_active: !r.is_active })
        .eq('id', r.id);
      if (error) throw error;
      toast.success(`Marked as ${!r.is_active ? 'active' : 'inactive'}.`);
      router.refresh();
    } catch {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  /**
   * Move a review up or down by swapping with its neighbour and renumbering
   * all rows 1..N so the order is unambiguous even if rows had duplicate
   * display_order values.
   */
  const move = async (reviewId: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((r) => r.id === reviewId);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[idx], next[target]] = [next[target], next[idx]];

    setWorking(reviewId);
    try {
      const supabase = createClient();
      const updates = next.map((r, i) =>
        supabase.from('reviews').update({ display_order: i + 1 }).eq('id', r.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find((res) => res.error);
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
      const { error } = await supabase.from('reviews').delete().eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('Review deleted.');
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
      {/* Helper tip box */}
      <div className="rounded-xl bg-brand-cream-warm border border-brand-line p-5 mb-6">
        <h3 className="font-serif text-lg font-semibold text-brand-ink">
          How to add a Google review
        </h3>
        <ol className="mt-3 space-y-1 text-sm text-brand-ink list-decimal list-inside">
          <li>Open your Google Maps listing.</li>
          <li>Pick a review you want to feature.</li>
          <li>
            Copy the customer&apos;s name, star rating, the exact date label (e.g.
            &quot;2 months ago&quot;), and the review text.
          </li>
          <li>Click &quot;+ Add Review&quot; and paste them in.</li>
        </ol>
        <p className="mt-3 text-xs text-brand-muted">
          Reviews appear on the home page immediately after saving.
        </p>
        <div className="mt-4">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-purple hover:text-brand-purple-deep"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Google reviews →
          </a>
        </div>
      </div>

      <div className="flex justify-end mb-5">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add review
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No reviews yet. Click &quot;Add review&quot; to add one from Google.
        </div>
      ) : (
        <ul className="surface-card overflow-hidden divide-y divide-brand-line">
          {sorted.map((r, i) => (
            <li
              key={r.id}
              className={cn(
                'flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-5 transition-opacity',
                !r.is_active && 'opacity-50'
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => move(r.id, -1)}
                    disabled={i === 0 || working !== null}
                    aria-label="Move up"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(r.id, 1)}
                    disabled={i === sorted.length - 1 || working !== null}
                    aria-label="Move down"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`${r.stars} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          aria-hidden
                          className={cn(
                            'h-3.5 w-3.5',
                            n <= r.stars
                              ? 'text-brand-purple fill-brand-purple'
                              : 'text-brand-line fill-brand-line'
                          )}
                        />
                      ))}
                    </div>
                    {!r.is_active && <Badge variant="destructive">Inactive</Badge>}
                    <span className="text-[0.7rem] text-brand-muted">
                      Order: {r.display_order}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-brand-ink leading-snug line-clamp-2">
                    {r.review_text}
                  </p>
                  <p className="mt-1.5 text-xs text-brand-muted truncate">
                    <span className="font-medium text-brand-ink">{r.customer_name}</span>
                    <span aria-hidden className="mx-1.5">·</span>
                    {r.review_date_label}
                  </p>
                </div>
              </div>

              {/* Active toggle + actions */}
              <div className="flex flex-wrap items-center gap-2 sm:ml-3 sm:mt-0">
                <div className="flex items-center gap-2 text-xs text-brand-muted px-2">
                  <span>Active</span>
                  <Switch
                    checked={r.is_active}
                    disabled={working === r.id}
                    onCheckedChange={() => toggleActive(r)}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDel(r)}
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ReviewForm review={editing} open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete review?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.customer_name}</strong>&apos;s review will be removed
              permanently. You can also turn it off instead with the Active toggle.
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
