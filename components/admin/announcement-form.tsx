'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AnnouncementBannerView } from '@/components/public/announcement-banner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Announcement, AnnouncementColor } from '@/lib/types';

const formSchema = z.object({
  text: z.string().min(2, 'Banner text is required').max(160, 'Keep it short'),
  link_label: z.string().optional(),
  link_url: z.string().optional(),
  background_color: z.enum(['plum', 'teal']),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

const COLORS: { value: AnnouncementColor; label: string; swatchClass: string }[] = [
  { value: 'plum', label: 'Plum', swatchClass: 'bg-plum' },
  { value: 'teal', label: 'Teal', swatchClass: 'bg-teal' },
];

export function AnnouncementForm({
  announcement,
}: {
  announcement: Announcement | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(announcement),
  });

  const text = watch('text');
  const linkLabel = watch('link_label');
  const linkUrl = watch('link_url');
  const bg = watch('background_color');
  const isActive = watch('is_active');

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        text: data.text.trim(),
        link_label: data.link_label?.trim() || null,
        link_url: data.link_url?.trim() || null,
        background_color: data.background_color,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      };

      if (announcement) {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', announcement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert(payload);
        if (error) throw error;
      }

      toast.success('Announcement saved.');
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error('Could not save.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live preview */}
      <div>
        <p className="eyebrow eyebrow--ink mb-3 text-[0.7rem]">Preview</p>
        <div
          className={cn(
            'rounded-xl overflow-hidden border border-brand-line shadow-soft',
            !isActive && 'opacity-50'
          )}
        >
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
        {!isActive && (
          <p className="mt-2 text-xs text-brand-muted">
            Banner is currently hidden from the website.
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(submit)} className="surface-card p-6 sm:p-8 space-y-5">
        <div>
          <Label htmlFor="ann-text">Banner text</Label>
          <Input
            id="ann-text"
            placeholder="e.g. Sunday is Test Day — walk in for ThyroCare lab tests, 9 AM to 1 PM"
            {...register('text')}
            className={cn('mt-1.5', errors.text && 'border-destructive')}
          />
          <p className="mt-1 text-xs text-brand-muted">Keep it short — under 80 characters.</p>
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

        <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
          <div>
            <Label>Active</Label>
            <p className="text-xs text-brand-muted">
              Turn off to hide the banner without deleting it.
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(v) => setValue('is_active', v)}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={submitting}>
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : 'Save announcement'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function defaults(a: Announcement | null): FormValues {
  return {
    text: a?.text ?? '',
    link_label: a?.link_label ?? '',
    link_url: a?.link_url ?? '',
    background_color: (a?.background_color as AnnouncementColor) ?? 'plum',
    is_active: a?.is_active ?? true,
  };
}
