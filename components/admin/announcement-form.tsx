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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AnnouncementBannerView } from '@/components/public/announcement-banner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Announcement, AnnouncementColor } from '@/lib/types';

const TEXT_MAX = 80;

const formSchema = z.object({
  title: z.string().min(2, 'Give this announcement a name'),
  text: z.string().min(2, 'Banner text is required').max(TEXT_MAX, 'Keep it short'),
  link_label: z.string().optional(),
  link_url: z.string().optional(),
  background_color: z.enum(['plum', 'teal']),
});
type FormValues = z.infer<typeof formSchema>;

const COLORS: { value: AnnouncementColor; label: string; swatchClass: string }[] = [
  { value: 'plum', label: 'Plum', swatchClass: 'bg-plum' },
  { value: 'teal', label: 'Teal', swatchClass: 'bg-teal' },
];

export function AnnouncementForm({
  announcement,
  open,
  onOpenChange,
}: {
  announcement: Announcement | null;
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
    defaultValues: defaults(announcement),
  });

  React.useEffect(() => {
    if (open) reset(defaults(announcement));
  }, [open, announcement, reset]);

  const text = watch('text');
  const linkLabel = watch('link_label');
  const linkUrl = watch('link_url');
  const bg = watch('background_color');

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        title: data.title.trim(),
        text: data.text.trim(),
        link_label: data.link_label?.trim() || null,
        link_url: data.link_url?.trim() || null,
        background_color: data.background_color,
        updated_at: new Date().toISOString(),
      };

      if (announcement) {
        // Note: is_active is deliberately absent — editing an announcement
        // must never change which one is live. That is the list's job.
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', announcement.id);
        if (error) throw error;
        toast.success('Announcement updated.');
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({ ...payload, is_active: false });
        if (error) throw error;
        toast.success('Announcement saved.');
      }
      router.refresh();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('Could not save. Have you run migration 0012 in Supabase?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Edit announcement' : 'New announcement'}
          </DialogTitle>
          <DialogDescription>
            The bar at the very top of every page. The preview updates as you type.
          </DialogDescription>
        </DialogHeader>

        {/* Live preview */}
        <div>
          <p className="eyebrow eyebrow--ink mb-2 text-[0.7rem]">Preview</p>
          <div className="rounded-xl overflow-hidden border border-brand-line shadow-soft">
            <AnnouncementBannerView
              announcement={{
                text: text || 'Your banner text will appear here.',
                link_label: linkLabel?.trim() || null,
                link_url: linkUrl?.trim() || null,
                background_color: bg,
              }}
              showDismiss
              onDismiss={() => {}}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="ann-title">Name</Label>
            <Input
              id="ann-title"
              placeholder="e.g. Diwali Offer"
              {...register('title')}
              className={cn('mt-1.5', errors.title && 'border-destructive')}
            />
            <p className="mt-1 text-xs text-brand-muted">
              For your reference only — customers don&apos;t see this.
            </p>
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ann-text">Banner text</Label>
            <Input
              id="ann-text"
              maxLength={TEXT_MAX}
              placeholder="e.g. Sunday is Test Day — walk in for lab tests, 9 AM to 1 PM"
              {...register('text')}
              className={cn('mt-1.5', errors.text && 'border-destructive')}
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-xs text-brand-muted">What customers actually read.</p>
              <span
                className={cn(
                  'text-xs tabular-nums',
                  (text ?? '').length > TEXT_MAX - 10
                    ? 'text-destructive'
                    : 'text-brand-muted'
                )}
              >
                {(text ?? '').length} / {TEXT_MAX}
              </span>
            </div>
            {errors.text && (
              <p className="mt-1 text-xs text-destructive">{errors.text.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ann-link-label">Link label</Label>
              <Input
                id="ann-link-label"
                placeholder="e.g. Book a test →"
                {...register('link_label')}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-brand-muted">
                Leave blank if you don&apos;t want a clickable link.
              </p>
            </div>
            <div>
              <Label htmlFor="ann-link-url">Link URL</Label>
              <Input
                id="ann-link-url"
                placeholder="/tests"
                {...register('link_url')}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-brand-muted">
                Where the link goes. Use full URLs or paths like /tests.
              </p>
            </div>
          </div>

          <div>
            <Label>Background color</Label>
            <div className="mt-2 flex gap-2">
              {COLORS.map((c) => {
                const active = bg === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setValue('background_color', c.value)}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium',
                      active
                        ? 'border-brand-purple bg-brand-purple/5 text-brand-ink'
                        : 'border-brand-line bg-white text-brand-ink hover:border-brand-purple/40'
                    )}
                  >
                    <span className={cn('block h-4 w-4 rounded-full', c.swatchClass)} />
                    {c.label}
                  </button>
                );
              })}
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
              {submitting ? 'Saving...' : announcement ? 'Save changes' : 'Save announcement'}
            </Button>
          </div>
          {!announcement && (
            <p className="text-xs text-brand-muted text-center">
              Saved announcements start switched off.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(a: Announcement | null): FormValues {
  return {
    title: a?.title ?? '',
    text: a?.text ?? '',
    link_label: a?.link_label ?? '',
    link_url: a?.link_url ?? '',
    background_color: (a?.background_color as AnnouncementColor) ?? 'plum',
  };
}
