'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, ImageOff } from 'lucide-react';
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
import { DOCTOR_SPECIALTIES } from '@/lib/constants';
import { formatINR, formatTime12 } from '@/lib/utils';
import type { Doctor } from '@/lib/types';

export function DoctorsManager({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Doctor | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<Doctor | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (d: Doctor) => {
    setEditing(d);
    setFormOpen(true);
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

      {doctors.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No doctors yet. Click &quot;Add doctor&quot; to add one.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => {
            const sp = DOCTOR_SPECIALTIES.find((s) => s.value === d.specialty);
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
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge variant={d.is_on_request ? 'muted' : 'accent'}>
                      {d.is_on_request ? 'On request' : sp?.label}
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
