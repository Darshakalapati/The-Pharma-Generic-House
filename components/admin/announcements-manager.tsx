'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, Radio, Power } from 'lucide-react';
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
import { AnnouncementForm } from './announcement-form';
import {
  activateAnnouncement,
  deactivateAllAnnouncements,
} from '@/app/admin/(dashboard)/announcements/actions';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/lib/types';

export function AnnouncementsManager({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Announcement | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<Announcement | null>(null);
  const [confirmOff, setConfirmOff] = React.useState<Announcement | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  // Newest first. Sorted here rather than in the query so the page still
  // renders if migration 0012 has not been applied and created_at is absent.
  const sorted = React.useMemo(
    () =>
      [...announcements].sort((a, b) => {
        const at = new Date(a.created_at ?? a.updated_at).getTime();
        const bt = new Date(b.created_at ?? b.updated_at).getTime();
        return bt - at;
      }),
    [announcements]
  );

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (a: Announcement) => {
    setEditing(a);
    setFormOpen(true);
  };

  const setLive = async (a: Announcement) => {
    setWorking(a.id);
    try {
      const res = await activateAnnouncement(a.id);
      if (!res.ok) throw new Error(res.error);
      toast.success(`“${a.title}” is now live`);
      router.refresh();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'Could not switch that on.');
    } finally {
      setWorking(null);
    }
  };

  const turnOff = async () => {
    if (!confirmOff) return;
    setWorking(confirmOff.id);
    try {
      const res = await deactivateAllAnnouncements();
      if (!res.ok) throw new Error(res.error);
      toast.success('Banner switched off. The website shows no banner now.');
      setConfirmOff(null);
      router.refresh();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'Could not switch that off.');
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
        .from('announcements')
        .delete()
        .eq('id', confirmDel.id);
      if (error) throw error;
      toast.success(
        confirmDel.is_active
          ? 'Announcement deleted. The website shows no banner now.'
          : 'Announcement deleted.'
      );
      setConfirmDel(null);
      router.refresh();
    } catch {
      toast.error('Could not delete.');
    } finally {
      setWorking(null);
    }
  };

  const liveOne = sorted.find((a) => a.is_active) ?? null;

  return (
    <>
      <div className="rounded-xl bg-brand-cream-warm p-5 text-sm text-brand-ink">
        <strong className="font-medium">Tip:</strong> Save announcements you use often
        — like &quot;Sunday Test Day&quot; or festival offers. When the day comes, just
        switch it on. Turning one on automatically turns the others off.
      </div>

      <div className="flex items-center justify-between gap-3 mt-5 mb-5">
        <p className="text-xs text-brand-muted">
          {liveOne
            ? `Live now: “${liveOne.title}”`
            : 'Nothing is live — the website is showing no banner.'}
        </p>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No announcements yet. Click &quot;New Announcement&quot; to add one.
        </div>
      ) : (
        <ul className="surface-card overflow-hidden divide-y divide-brand-line">
          {sorted.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-serif text-[1.0625rem] font-medium text-brand-ink truncate">
                    {a.title || '(untitled)'}
                  </p>
                  {a.is_active && (
                    <Badge className="bg-brand-teal text-white hover:bg-brand-teal gap-1 uppercase text-[0.65rem] tracking-wider">
                      <Radio className="h-3 w-3" /> Live
                    </Badge>
                  )}
                </div>

                {/* Mini preview of the banner itself */}
                <div className="mt-2 max-w-lg">
                  <span
                    className={cn(
                      'block truncate rounded-full px-3 py-1 text-xs text-white',
                      a.background_color === 'teal' ? 'bg-teal' : 'bg-plum'
                    )}
                  >
                    {a.text}
                    {a.link_label ? `  ${a.link_label}` : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                {a.is_active ? (
                  <Button
                    size="sm"
                    disabled={working === a.id}
                    onClick={() => setConfirmOff(a)}
                    className="bg-brand-teal text-white hover:bg-brand-teal-deep"
                  >
                    <Power className="h-3.5 w-3.5" /> Live
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={working !== null}
                    onClick={() => setLive(a)}
                  >
                    Set Live
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => startEdit(a)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDel(a)}
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AnnouncementForm
        announcement={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      {/* Turn the live banner off */}
      <Dialog open={!!confirmOff} onOpenChange={(v) => !v && setConfirmOff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turn off this announcement?</DialogTitle>
            <DialogDescription>
              The website will show no banner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOff(null)}>
              Cancel
            </Button>
            <Button disabled={working === confirmOff?.id} onClick={turnOff}>
              Turn off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete announcement?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.title}</strong> will be removed permanently.
              {confirmDel?.is_active
                ? ' It is currently live, so the website will show no banner.'
                : ''}
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
