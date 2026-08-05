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
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from './image-upload';
import { createClient } from '@/lib/supabase/client';
import type { HeroPhoto } from '@/lib/types';

const DEFAULT_ALT = 'Inside The Pharma Generic House pharmacy';

const formSchema = z.object({
  image_url: z.string().min(1, 'Upload a photo first'),
  alt_text: z.string().optional(),
  display_order: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

export function HeroPhotoForm({
  photo,
  open,
  onOpenChange,
}: {
  photo: HeroPhoto | null;
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
    defaultValues: defaults(photo),
  });

  React.useEffect(() => {
    if (open) reset(defaults(photo));
  }, [open, photo, reset]);

  const imageUrl = watch('image_url');

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        image_url: data.image_url.trim(),
        alt_text: data.alt_text?.trim() || DEFAULT_ALT,
        display_order: data.display_order ? Number(data.display_order) : 0,
        is_active: data.is_active,
      };

      if (photo) {
        const { error } = await supabase
          .from('hero_photos')
          .update(payload)
          .eq('id', photo.id);
        if (error) throw error;
        toast.success('Hero photo updated.');
      } else {
        const { error } = await supabase.from('hero_photos').insert(payload);
        if (error) throw error;
        toast.success('Hero photo added.');
      }
      router.refresh();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('Could not save. Have you run migration 0009 in Supabase?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{photo ? 'Edit hero photo' : 'Add hero photo'}</DialogTitle>
          <DialogDescription>
            Photos marked active appear in the home page hero and rotate every 12
            seconds with a slow zoom.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label>Photo</Label>
            <div className="mt-1.5">
              <ImageUpload
                value={imageUrl || null}
                onChange={(url) => setValue('image_url', url ?? '', { shouldValidate: true })}
                folder="hero"
                bucket="hero-photos"
                pathLayout="flat"
                maxSizeMb={10}
                previewClassName="aspect-[4/3] w-44"
              />
            </div>
            <p className="mt-1 text-xs text-brand-muted">
              Landscape orientation works best. Recommended: 1600 × 1200 pixels.
            </p>
            {errors.image_url && (
              <p className="mt-1 text-xs text-destructive">{errors.image_url.message}</p>
            )}
          </div>

          {/* Live preview at the hero's own aspect ratio */}
          {imageUrl && (
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.12em] text-brand-muted font-medium mb-2">
                Preview — as it appears in the hero
              </p>
              <div className="relative aspect-[3/4] w-40 overflow-hidden rounded-xl border border-brand-line bg-brand-cream-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Hero preview"
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="hp-alt">Alt text</Label>
            <Input
              id="hp-alt"
              placeholder={DEFAULT_ALT}
              {...register('alt_text')}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-brand-muted">
              Describes the photo for screen readers and search engines. Leave blank to
              use &quot;{DEFAULT_ALT}&quot;.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hp-order">Display order</Label>
              <Input
                id="hp-order"
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
                  Turn off to hide a photo without deleting it.
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
              {submitting ? 'Saving...' : photo ? 'Save changes' : 'Add photo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(p: HeroPhoto | null): FormValues {
  return {
    image_url: p?.image_url ?? '',
    alt_text: p?.alt_text ?? '',
    display_order: p?.display_order != null ? String(p.display_order) : '0',
    is_active: p?.is_active ?? true,
  };
}
