'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
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
import type { Review } from '@/lib/types';

const REVIEW_MAX = 800;

const formSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'Customer name is required')
    .max(80, 'Keep it under 80 characters'),
  stars: z.number().int().min(1, 'Pick a rating').max(5),
  review_date_label: z.string().min(1, 'Date label is required'),
  review_text: z
    .string()
    .min(2, 'Review text is required')
    .max(REVIEW_MAX, `Keep it under ${REVIEW_MAX} characters`),
  display_order: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

export function ReviewForm({
  review,
  open,
  onOpenChange,
}: {
  review: Review | null;
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
    defaultValues: defaults(review),
  });

  React.useEffect(() => {
    if (open) reset(defaults(review));
  }, [open, review, reset]);

  const stars = watch('stars');
  const reviewText = watch('review_text') ?? '';

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        customer_name: data.customer_name.trim(),
        stars: data.stars,
        review_date_label: data.review_date_label.trim(),
        review_text: data.review_text.trim(),
        display_order: data.display_order ? Number(data.display_order) : 0,
        is_active: data.is_active,
      };
      if (review) {
        const { error } = await supabase.from('reviews').update(payload).eq('id', review.id);
        if (error) throw error;
        toast.success('Review updated.');
      } else {
        const { error } = await supabase.from('reviews').insert(payload);
        if (error) throw error;
        toast.success('Review added.');
      }
      router.refresh();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('Could not save.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{review ? 'Edit review' : 'Add review'}</DialogTitle>
          <DialogDescription>
            Copy the review from Google and paste the parts below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="rev-name">Customer name</Label>
            <Input
              id="rev-name"
              placeholder="As shown on Google"
              {...register('customer_name')}
              className={cn('mt-1.5', errors.customer_name && 'border-destructive')}
            />
            <p className="mt-1 text-xs text-brand-muted">As shown on Google.</p>
            {errors.customer_name && (
              <p className="mt-1 text-xs text-destructive">{errors.customer_name.message}</p>
            )}
          </div>

          {/* Star selector */}
          <div>
            <Label>Stars</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = n <= stars;
                  return (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={stars === n}
                      aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                      onClick={() => setValue('stars', n, { shouldValidate: true })}
                      className="grid h-9 w-9 place-items-center rounded-md hover:bg-brand-cream-warm transition-colors"
                    >
                      <Star
                        className={cn(
                          'h-5 w-5 transition-colors',
                          active
                            ? 'text-brand-purple fill-brand-purple'
                            : 'text-brand-line fill-brand-line'
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-sm text-brand-muted tabular-nums">
                {stars}/5
              </span>
            </div>
            {errors.stars && (
              <p className="mt-1 text-xs text-destructive">{errors.stars.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rev-date">Review date label</Label>
            <Input
              id="rev-date"
              placeholder="e.g. 2 months ago"
              {...register('review_date_label')}
              className={cn('mt-1.5', errors.review_date_label && 'border-destructive')}
            />
            <p className="mt-1 text-xs text-brand-muted">
              Copy exactly as Google shows it — e.g. &quot;2 months ago&quot;, &quot;3 weeks
              ago&quot;.
            </p>
            {errors.review_date_label && (
              <p className="mt-1 text-xs text-destructive">{errors.review_date_label.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rev-text">Review text</Label>
            <Textarea
              id="rev-text"
              rows={4}
              maxLength={REVIEW_MAX}
              placeholder="Paste the review exactly as it appears on Google."
              {...register('review_text')}
              className={cn('mt-1.5', errors.review_text && 'border-destructive')}
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              {errors.review_text ? (
                <p className="text-xs text-destructive">{errors.review_text.message}</p>
              ) : (
                <span aria-hidden />
              )}
              <span
                className={cn(
                  'text-xs tabular-nums',
                  reviewText.length > REVIEW_MAX - 60
                    ? 'text-destructive'
                    : 'text-brand-muted'
                )}
              >
                {reviewText.length} / {REVIEW_MAX}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="rev-order">Display order</Label>
              <Input
                id="rev-order"
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
                <p className="text-xs text-brand-muted">
                  Turn off to hide a review without deleting it.
                </p>
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
              {submitting ? 'Saving...' : review ? 'Save changes' : 'Add review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(r: Review | null): FormValues {
  return {
    customer_name: r?.customer_name ?? '',
    stars: r?.stars ?? 5,
    review_date_label: r?.review_date_label ?? '',
    review_text: r?.review_text ?? '',
    display_order: r?.display_order != null ? String(r.display_order) : '0',
    is_active: r?.is_active ?? true,
  };
}
