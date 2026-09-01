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
import type { Faq } from '@/lib/types';

const formSchema = z.object({
  question: z.string().min(4, 'Question is required'),
  answer: z.string().min(4, 'Answer is required'),
  question_te: z.string().optional(),
  answer_te: z.string().optional(),
  display_order: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

export function FaqForm({
  faq,
  open,
  onOpenChange,
}: {
  faq: Faq | null;
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
    defaultValues: defaults(faq),
  });

  React.useEffect(() => {
    if (open) reset(defaults(faq));
  }, [open, faq, reset]);

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        question: data.question.trim(),
        answer: data.answer.trim(),
        question_te: data.question_te?.trim() || null,
        answer_te: data.answer_te?.trim() || null,
        display_order: data.display_order ? Number(data.display_order) : 0,
        is_active: data.is_active,
      };
      if (faq) {
        const { error } = await supabase.from('faqs').update(payload).eq('id', faq.id);
        if (error) throw error;
        toast.success('FAQ updated.');
      } else {
        const { error } = await supabase.from('faqs').insert(payload);
        if (error) throw error;
        toast.success('FAQ added.');
      }
      router.refresh();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('Could not save. Have you run migration 0016 in Supabase?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{faq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
          <DialogDescription>
            Shown in the questions accordion on the home page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="faq-q">Question</Label>
            <Input
              id="faq-q"
              placeholder="e.g. Do you deliver medicines?"
              {...register('question')}
              className={cn('mt-1.5', errors.question && 'border-destructive')}
            />
            {errors.question && (
              <p className="mt-1 text-xs text-destructive">{errors.question.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="faq-a">Answer</Label>
            <Textarea
              id="faq-a"
              rows={4}
              {...register('answer')}
              className={cn('mt-1.5', errors.answer && 'border-destructive')}
            />
            {errors.answer && (
              <p className="mt-1 text-xs text-destructive">{errors.answer.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="faq-qte">Telugu question</Label>
            <Input id="faq-qte" {...register('question_te')} className="mt-1.5" />
            <p className="mt-1 text-xs text-brand-muted">
              Optional — shown when the site is in Telugu.
            </p>
          </div>

          <div>
            <Label htmlFor="faq-ate">Telugu answer</Label>
            <Textarea id="faq-ate" rows={4} {...register('answer_te')} className="mt-1.5" />
            <p className="mt-1 text-xs text-brand-muted">
              Optional — shown when the site is in Telugu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="faq-order">Display order</Label>
              <Input
                id="faq-order"
                type="number"
                placeholder="0"
                {...register('display_order')}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-brand-muted">Lower numbers show first.</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3 self-end">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-brand-muted">Turn off to hide without deleting.</p>
              </div>
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(v) => setValue('is_active', v)}
              />
            </div>
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
              {submitting ? 'Saving...' : faq ? 'Save changes' : 'Add FAQ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(f: Faq | null): FormValues {
  return {
    question: f?.question ?? '',
    answer: f?.answer ?? '',
    question_te: f?.question_te ?? '',
    answer_te: f?.answer_te ?? '',
    display_order: f?.display_order != null ? String(f.display_order) : '0',
    is_active: f?.is_active ?? true,
  };
}
