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
import { ImageUpload } from './image-upload';
import { PromoBannerCard } from '@/components/public/promo-banner-card';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { BannerBackgroundStyle, BannerType, PromoBanner } from '@/lib/types';

const HEADLINE_MAX = 60;
const SUBHEADING_MAX = 120;

const formSchema = z.object({
  title: z.string().min(2, 'Banner title is required'),
  banner_type: z.enum(['image', 'text']),
  image_url: z.string().optional(),
  headline: z.string().max(HEADLINE_MAX, `Keep it under ${HEADLINE_MAX} characters`).optional(),
  subheading: z.string().max(SUBHEADING_MAX, `Keep it under ${SUBHEADING_MAX} characters`).optional(),
  button_label: z.string().optional(),
  button_link: z.string().optional(),
  background_style: z.enum(['plum', 'teal', 'cream']),
  display_order: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

const BACKGROUNDS: {
  value: BannerBackgroundStyle;
  label: string;
  swatch: string;
  textTone: string;
}[] = [
  { value: 'plum', label: 'Plum', swatch: 'bg-plum', textTone: 'text-white' },
  { value: 'teal', label: 'Teal', swatch: 'bg-teal', textTone: 'text-white' },
  { value: 'cream', label: 'Cream', swatch: 'bg-bg-elevated border border-line', textTone: 'text-ink' },
];

export function PromoBannerForm({
  banner,
  open,
  onOpenChange,
}: {
  banner: PromoBanner | null;
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
    defaultValues: defaults(banner),
  });

  React.useEffect(() => {
    if (open) reset(defaults(banner));
  }, [open, banner, reset]);

  const bannerType = watch('banner_type');
  const backgroundStyle = watch('background_style');
  const headline = watch('headline');
  const subheading = watch('subheading');
  const buttonLabel = watch('button_label');
  const buttonLink = watch('button_link');
  const imageUrl = watch('image_url');

  // Build a preview banner from the current form values so we can render
  // the actual public PromoBannerCard component as a live preview.
  const previewBanner = React.useMemo<PromoBanner>(
    () => ({
      id: banner?.id ?? 'preview',
      title: 'preview',
      banner_type: bannerType,
      image_url: imageUrl?.trim() || null,
      headline: headline?.trim() || null,
      subheading: subheading?.trim() || null,
      button_label: buttonLabel?.trim() || null,
      button_link: buttonLink?.trim() || null,
      background_style: backgroundStyle,
      display_order: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    }),
    [
      banner?.id,
      bannerType,
      imageUrl,
      headline,
      subheading,
      buttonLabel,
      buttonLink,
      backgroundStyle,
    ]
  );

  const submit = async (data: FormValues) => {
    if (data.banner_type === 'image' && !data.image_url?.trim()) {
      toast.error('Upload an image for an image banner.');
      return;
    }
    if (data.banner_type === 'text' && !data.headline?.trim()) {
      toast.error('Add a headline for a text banner.');
      return;
    }
    if ((data.button_label?.trim() && !data.button_link?.trim()) ||
        (!data.button_label?.trim() && data.button_link?.trim())) {
      toast.error('Set both a button label and a link, or leave both blank.');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        title: data.title.trim(),
        banner_type: data.banner_type,
        image_url: data.image_url?.trim() || null,
        headline: data.headline?.trim() || null,
        subheading: data.subheading?.trim() || null,
        button_label: data.button_label?.trim() || null,
        button_link: data.button_link?.trim() || null,
        background_style: data.background_style,
        display_order: data.display_order ? Number(data.display_order) : 0,
        is_active: data.is_active,
      };

      if (banner) {
        const { error } = await supabase
          .from('promo_banners')
          .update(payload)
          .eq('id', banner.id);
        if (error) throw error;
        toast.success('Banner updated.');
      } else {
        const { error } = await supabase.from('promo_banners').insert(payload);
        if (error) throw error;
        toast.success('Banner added.');
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{banner ? 'Edit banner' : 'Add banner'}</DialogTitle>
          <DialogDescription>
            Build a banner for the home page. The preview at the top updates as you type.
          </DialogDescription>
        </DialogHeader>

        {/* Live preview */}
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-brand-muted font-medium mb-2">
            Preview
          </p>
          <div className="rounded-xl overflow-hidden">
            <PromoBannerCard banner={previewBanner} clickableSurface={false} />
          </div>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label htmlFor="pb-title">Banner title</Label>
            <Input
              id="pb-title"
              placeholder="e.g. Diwali offer week"
              {...register('title')}
              className={cn('mt-1.5', errors.title && 'border-destructive')}
            />
            <p className="mt-1 text-xs text-brand-muted">
              An internal label so you remember what this banner is. Not shown to customers.
            </p>
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Banner type — segmented control */}
          <div>
            <Label>Banner type</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(['image', 'text'] as BannerType[]).map((t) => {
                const active = bannerType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('banner_type', t, { shouldValidate: true })}
                    className={cn(
                      'h-11 rounded-md border text-sm font-medium transition-all',
                      active
                        ? 'border-brand-purple bg-brand-purple/5 text-brand-ink'
                        : 'border-brand-line bg-white text-brand-ink hover:border-brand-purple/40'
                    )}
                  >
                    {t === 'image' ? 'Image banner' : 'Text banner'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* IMAGE-specific */}
          {bannerType === 'image' && (
            <div>
              <Label>Banner image</Label>
              <div className="mt-1.5">
                <ImageUpload
                  value={imageUrl ?? null}
                  onChange={(url) =>
                    setValue('image_url', url ?? '', { shouldValidate: true })
                  }
                  folder="banners"
                  bucket="promo-banners"
                  pathLayout="flat"
                  previewClassName="aspect-[16/9] w-40"
                />
              </div>
              <p className="mt-1 text-xs text-brand-muted">
                Recommended size: 1600 × 700 pixels for a wide banner. Use Canva or any
                free tool to design banners. JPG, PNG, or WebP up to 5 MB.
              </p>
            </div>
          )}

          {/* TEXT-specific */}
          {bannerType === 'text' && (
            <>
              <div>
                <Label htmlFor="pb-headline">Headline</Label>
                <Input
                  id="pb-headline"
                  placeholder="e.g. Sunday is Test Day"
                  maxLength={HEADLINE_MAX}
                  {...register('headline')}
                  className={cn('mt-1.5', errors.headline && 'border-destructive')}
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-brand-muted">
                    The main message. Keep it short and bold.
                  </p>
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      (headline ?? '').length > HEADLINE_MAX - 10
                        ? 'text-destructive'
                        : 'text-brand-muted'
                    )}
                  >
                    {(headline ?? '').length} / {HEADLINE_MAX}
                  </span>
                </div>
                {errors.headline && (
                  <p className="mt-1 text-xs text-destructive">{errors.headline.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="pb-sub">Subheading</Label>
                <Textarea
                  id="pb-sub"
                  rows={2}
                  maxLength={SUBHEADING_MAX}
                  placeholder="e.g. Walk in for ThyroCare lab tests, 9 AM to 1 PM"
                  {...register('subheading')}
                  className={cn('mt-1.5', errors.subheading && 'border-destructive')}
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-brand-muted">Supporting detail.</p>
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      (subheading ?? '').length > SUBHEADING_MAX - 15
                        ? 'text-destructive'
                        : 'text-brand-muted'
                    )}
                  >
                    {(subheading ?? '').length} / {SUBHEADING_MAX}
                  </span>
                </div>
                {errors.subheading && (
                  <p className="mt-1 text-xs text-destructive">{errors.subheading.message}</p>
                )}
              </div>

              <div>
                <Label>Background</Label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {BACKGROUNDS.map((b) => {
                    const active = backgroundStyle === b.value;
                    return (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setValue('background_style', b.value)}
                        className={cn(
                          'flex items-center gap-2 rounded-md p-2.5 border-2 transition-all',
                          active
                            ? 'border-brand-purple ring-1 ring-brand-purple/20'
                            : 'border-brand-line hover:border-brand-purple/40'
                        )}
                      >
                        <span
                          className={cn(
                            'block h-8 w-8 rounded shrink-0',
                            b.swatch
                          )}
                        />
                        <span className="text-sm font-medium text-brand-ink">{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Common — button + order + active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pb-btn-label">Button label</Label>
              <Input
                id="pb-btn-label"
                placeholder="e.g. Book a test"
                {...register('button_label')}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-brand-muted">
                Leave blank for a banner without a clickable button.
              </p>
            </div>
            <div>
              <Label htmlFor="pb-btn-link">Button link</Label>
              <Input
                id="pb-btn-link"
                placeholder="/tests"
                {...register('button_link')}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-brand-muted">
                Where the button goes — full URLs or paths like /tests.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pb-order">Display order</Label>
              <Input
                id="pb-order"
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
                  Turn off to hide a banner without deleting it.
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
              {submitting ? 'Saving...' : banner ? 'Save changes' : 'Add banner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(b: PromoBanner | null): FormValues {
  return {
    title: b?.title ?? '',
    banner_type: (b?.banner_type as BannerType) ?? 'text',
    image_url: b?.image_url ?? '',
    headline: b?.headline ?? '',
    subheading: b?.subheading ?? '',
    button_label: b?.button_label ?? '',
    button_link: b?.button_link ?? '',
    background_style: (b?.background_style as BannerBackgroundStyle) ?? 'plum',
    display_order: b?.display_order != null ? String(b.display_order) : '0',
    is_active: b?.is_active ?? true,
  };
}
