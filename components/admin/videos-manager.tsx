'use client';

import * as React from 'react';
import {
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Play,
  Youtube,
  Instagram,
  Film,
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
import { VideoForm } from './video-form';
import { createClient } from '@/lib/supabase/client';
import { extractYouTubeId, youtubeThumbnailUrl } from '@/lib/utils';
import type { Video } from '@/lib/types';

export function VideosManager({ videos }: { videos: Video[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Video | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<Video | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () =>
      [...videos].sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
    [videos]
  );

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (v: Video) => {
    setEditing(v);
    setFormOpen(true);
  };

  const toggleActive = async (v: Video) => {
    setWorking(v.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('videos')
        .update({ is_active: !v.is_active })
        .eq('id', v.id);
      if (error) throw error;
      toast.success(`Marked as ${!v.is_active ? 'active' : 'inactive'}.`);
      router.refresh();
    } catch {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  /**
   * Move a video up or down by swapping `display_order` with its neighbour
   * (and renumbering all rows from 1..N to keep ordering well-defined even
   * when neighbours had duplicate display_order values).
   */
  const move = async (videoId: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((v) => v.id === videoId);
    if (idx < 0) return;
    const target = idx + direction;
    if (target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[idx], next[target]] = [next[target], next[idx]];

    setWorking(videoId);
    try {
      const supabase = createClient();
      // Renumber sequentially so the new order is unambiguous.
      const updates = next.map((v, i) =>
        supabase.from('videos').update({ display_order: i + 1 }).eq('id', v.id)
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
      const { error } = await supabase.from('videos').delete().eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('Video deleted.');
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
      <div className="flex justify-end mb-5">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add video
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No videos yet. Click &quot;Add video&quot; to add one.
        </div>
      ) : (
        <ul className="surface-card overflow-hidden divide-y divide-brand-line">
          {sorted.map((v, i) => {
            const thumb = resolveThumbnail(v);
            return (
              <li key={v.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(v.id, -1)}
                      disabled={i === 0 || working !== null}
                      aria-label="Move up"
                      className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(v.id, 1)}
                      disabled={i === sorted.length - 1 || working !== null}
                      aria-label="Move down"
                      className="grid h-6 w-6 place-items-center rounded-md border border-brand-line bg-white hover:bg-brand-cream-warm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-14 rounded-lg overflow-hidden bg-brand-cream-warm shrink-0">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={v.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-brand-muted">
                        <Play className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-ink truncate">{v.title}</p>
                    <p className="text-xs text-brand-muted truncate">
                      {v.customer_name ?? '—'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge variant="muted">{v.video_type}</Badge>
                      <SourceBadge source={v.video_source} />
                      <span className="text-[0.7rem] text-brand-muted">
                        Order: {v.display_order}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active toggle + actions */}
                <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                  <div className="flex items-center gap-2 text-xs text-brand-muted px-2">
                    <span>Active</span>
                    <Switch
                      checked={v.is_active}
                      disabled={working === v.id}
                      onCheckedChange={() => toggleActive(v)}
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => startEdit(v)}>
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDel(v)}
                    className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <VideoForm video={editing} open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete video?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.title}</strong> will be removed permanently. The video
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

function SourceBadge({ source }: { source: Video['video_source'] }) {
  if (source === 'youtube') {
    return (
      <Badge variant="outline" className="gap-1">
        <Youtube className="h-3 w-3" /> YouTube
      </Badge>
    );
  }
  if (source === 'instagram') {
    return (
      <Badge variant="outline" className="gap-1">
        <Instagram className="h-3 w-3" /> Instagram
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Film className="h-3 w-3" /> Upload
    </Badge>
  );
}

function resolveThumbnail(v: Video): string | null {
  if (v.thumbnail_url) return v.thumbnail_url;
  if (v.video_source === 'youtube') {
    const id = extractYouTubeId(v.video_url);
    if (id) return youtubeThumbnailUrl(id);
  }
  return null;
}
