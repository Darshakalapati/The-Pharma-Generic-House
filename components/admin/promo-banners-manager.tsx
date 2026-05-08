'use client';

import * as React from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Type,
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
import { PromoBannerForm } from './promo-banner-form';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { PromoBanner } from '@/lib/types';

export function PromoBannersManager({ banners }: { banners: PromoBanner[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<PromoBanner | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<PromoBanner | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () =>
      [...banners].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [banners]
  );

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (b: PromoBanner) => {
    setEditing(b);
    setFormOpen(true);
  };

  const toggleActive = async (b: PromoBanner) => {
    setWorking(b.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('promo_banners')
        .update({ is_active: !b.is_active })
        .eq('id', b.id);
      if (error) throw error;
      toast.success(`Marked as ${!b.is_active ? 'active' : 'inactive'}.`);
      router.refresh();
    } catch {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  /**
   * Move a banner up or down by swapping with its neighbour and renumbering
   * 1..N so order is unambiguous when display_order had duplicates.
   */
  const move = async (bannerId: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((b) => b.id === bannerId);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[idx], next[target]] = [next[target], next[idx]];

    setWorking(bannerId);
    try {
      const supabase = createClient();
      const updates = next.map((b, i) =>
        supabase.from('promo_banners').update({ display_order: i + 1 }).eq('id', b.id)
      );
      const results = await Promise.all(updates);
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
      const { error } = await supabase.from('promo_banners').delete().eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('Banner deleted.');
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
      <div className="rounded-xl bg-brand-cream-warm border border-brand-line p-5 mb-6 text-sm text-brand-ink">
        <p>
          <strong>Tip:</strong> Keep 1 to 3 banners active at a time. The home page
          rotates through them automatically every few seconds. Toggle banners on or off
          depending on the day&apos;s promotion — for example, Sunday tests on weekends,
          Ayurvedic offers during festivals, or new product launches.
        </p>
      </div>

      <div className="flex justify-end mb-5">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add banner
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No banners yet. Click &quot;Add banner&quot; to add one.
        </div>
      ) : (
        <ul className="surface-card overflow-hidden divide-y divide-brand-line">
          {sorted.map((b, i) => (
            <li
              key={b.id}
              className={cn(
                'flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-5 transition-opacity',
                !b.is_active && 'opacity-50'
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 mt-1">
                  <button
                    type="button"
                    onClick={() => move(b.id, -1)}
                    disabled={i === 0 || working !== null}
                    aria-label="Move up"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(b.id, 1)}
                    disabled={i === sorted.length - 1 || working !== null}
                    aria-label="Move down"
                    className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Thumbnail (96px square) */}
                <BannerThumb banner={b} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-ink truncate">{b.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Badge variant="muted" className="gap-1">
                      {b.banner_type === 'image' ? (
                        <>
                          <ImageIcon className="h-3 w-3" /> Image
                        </>
                      ) : (
                        <>
                          <Type className="h-3 w-3" /> Text
                        </>
                      )}
                    </Badge>
                    {!b.is_active && <Badge variant="destructive">Inactive</Badge>}
                    <span className="text-[0.7rem] text-brand-muted">
                      Order: {b.display_order}
                    </span>
                  </div>
                  {b.banner_type === 'text' && (
                    <>
                      {b.headline && (
                        <p className="mt-2 text-sm font-medium text-brand-ink truncate">
                          {b.headline}
                        </p>
                      )}
                      {b.subheading && (
                        <p className="text-xs text-brand-muted truncate">{b.subheading}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Active toggle + actions */}
              <div className="flex flex-wrap items-center gap-2 sm:ml-3 sm:mt-0">
                <div className="flex items-center gap-2 text-xs text-brand-muted px-2">
                  <span>Active</span>
                  <Switch
                    checked={b.is_active}
                    disabled={working === b.id}
                    onCheckedChange={() => toggleActive(b)}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(b)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDel(b)}
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PromoBannerForm banner={editing} open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete banner?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.title}</strong> will be removed permanently. The image
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

function BannerThumb({ banner }: { banner: PromoBanner }) {
  if (banner.banner_type === 'image') {
    return (
      <div className="relative h-24 w-24 shrink-0 rounded-lg overflow-hidden bg-brand-cream-warm border border-brand-line">
        {banner.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.image_url}
            alt={banner.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-brand-muted">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
      </div>
    );
  }

  // Text banner — mini swatch with the headline
  const bg =
    banner.background_style === 'plum'
      ? 'bg-plum text-white'
      : banner.background_style === 'teal'
        ? 'bg-teal text-white'
        : 'bg-bg-elevated text-ink border border-line';

  return (
    <div
      className={cn(
        'relative h-24 w-24 shrink-0 rounded-lg overflow-hidden p-2 flex items-end',
        bg
      )}
    >
      <p className="text-[0.7rem] font-serif font-medium leading-tight line-clamp-3">
        {banner.headline ?? 'Untitled'}
      </p>
    </div>
  );
}
