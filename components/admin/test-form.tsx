'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { MedicalTest } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  price: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

export function TestForm({
  test,
  open,
  onOpenChange,
}: {
  test: MedicalTest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(test),
  });

  React.useEffect(() => {
    if (open) reset(defaults(test));
  }, [open, test, reset]);

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        price: data.price ? Number(data.price) : null,
        is_active: data.is_active,
      };
      if (test) {
        const { error } = await supabase.from('tests').update(payload).eq('id', test.id);
        if (error) throw error;
        toast.success('Test updated.');
      } else {
        const { error } = await supabase.from('tests').insert(payload);
        if (error) throw error;
        toast.success('Test added.');
      }
      router.refresh();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error('Could not save.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{test ? 'Edit test' : 'Add test'}</DialogTitle>
          <DialogDescription>
            Tests appear on the website&apos;s /tests page when active.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Thyroid Profile"
              {...register('name')}
              className={cn('mt-1.5', errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Short description of the test."
              {...register('description')}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              placeholder="e.g. 500"
              {...register('price')}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-brand-muted">
              Leave blank for &quot;Walk-in / Free&quot;.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
            <div>
              <Label>Active</Label>
              <p className="text-xs text-brand-muted">Show this test on the website.</p>
            </div>
            <Switch
              checked={watch('is_active')}
              onCheckedChange={(v) => setValue('is_active', v)}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : test ? 'Save changes' : 'Add test'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(t: MedicalTest | null): FormValues {
  return {
    name: t?.name ?? '',
    description: t?.description ?? '',
    price: t?.price != null ? String(t.price) : '',
    is_active: t?.is_active ?? true,
  };
}
