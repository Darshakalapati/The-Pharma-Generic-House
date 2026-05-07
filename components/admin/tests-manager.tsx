'use client';

import * as React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
import { TestForm } from './test-form';
import { createClient } from '@/lib/supabase/client';
import { formatINR } from '@/lib/utils';
import type { MedicalTest } from '@/lib/types';

export function TestsManager({ tests }: { tests: MedicalTest[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<MedicalTest | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<MedicalTest | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (t: MedicalTest) => {
    setEditing(t);
    setFormOpen(true);
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setWorking(confirmDel.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('tests').delete().eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('Test deleted.');
      setConfirmDel(null);
      router.refresh();
    } catch (e: any) {
      toast.error('Could not delete. Are there bookings linked?');
    } finally {
      setWorking(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-5">
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add test
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No tests yet. Click &quot;Add test&quot; to add one.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((t) => (
            <div key={t.id} className="surface-card p-5 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                {t.price != null && t.price > 0 ? (
                  <Badge variant="accent">{formatINR(t.price)}</Badge>
                ) : (
                  <Badge variant="muted">Walk-in / Free</Badge>
                )}
                {!t.is_active && <Badge variant="destructive">Inactive</Badge>}
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold leading-snug">{t.name}</h3>
              {t.description && (
                <p className="mt-2 text-sm text-brand-muted line-clamp-3">{t.description}</p>
              )}
              <div className="mt-5 pt-3 border-t border-brand-line/70 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(t)} className="flex-1">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDel(t)}
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TestForm test={editing} open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete test?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.name}</strong> will be removed permanently. Existing
              bookings linked to this test will also be removed.
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
