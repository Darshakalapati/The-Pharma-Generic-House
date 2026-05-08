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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VideoUpload } from './video-upload';
import { createClient } from '@/lib/supabase/client';
import {
  cn,
  extractYouTubeId,
  youtubeThumbnailUrl,
  extractInstagramId,
} from '@/lib/utils';
import type { Video, VideoSource, VideoType } from '@/lib/types';

const formSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  customer_name: z.string().optional(),
  video_type: z.enum(['testimonial', 'review', 'announcement']),
  video_source: z.enum(['upload', 'youtube', 'instagram']),
  video_url: z.string().min(2, 'A video URL or upload is required'),
  thumbnail_url: z.string().optional(),
  description: z.string().optional(),
  display_order: z.string().optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

const VIDEO_TYPES: { value: VideoType; label: string }[] = [
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'review', label: 'Review' },
  { value: 'announcement', label: 'Announcement' },
];

const VIDEO_SOURCES: { value: VideoSource; label: string }[] = [
  { value: 'upload', label: 'Upload a file' },
  { value: 'youtube', label: 'YouTube link' },
  { value: 'instagram', label: 'Instagram link' },
];

export function VideoForm({
  video,
  open,
  onOpenChange,
}: {
  video: Video | null;
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
    defaultValues: defaults(video),
  });

  React.useEffect(() => {
    if (open) reset(defaults(video));
  }, [open, video, reset]);

  const source = watch('video_source');
  const videoUrl = watch('video_url');
  const thumbnailUrl = watch('thumbnail_url');

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      // Auto-derive thumbnail for YouTube before saving.
      let thumb = data.thumbnail_url?.trim() || null;
      if (data.video_source === 'youtube' && !thumb) {
        const id = extractYouTubeId(data.video_url);
        if (id) thumb = youtubeThumbnailUrl(id);
      }

      // Light validation per source.
      if (data.video_source === 'youtube') {
        if (!extractYouTubeId(data.video_url)) {
          toast.error("That doesn't look like a YouTube link.");
          setSubmitting(false);
          return;
        }
      } else if (data.video_source === 'instagram') {
        if (!extractInstagramId(data.video_url)) {
          toast.error("That doesn't look like an Instagram link.");
          setSubmitting(false);
          return;
        }
      }

      const supabase = createClient();
      const payload = {
        title: data.title.trim(),
        customer_name: data.customer_name?.trim() || null,
        video_type: data.video_type,
        video_source: data.video_source,
        video_url: data.video_url.trim(),
        thumbnail_url: thumb,
        description: data.description?.trim() || null,
        display_order: data.display_order ? Number(data.display_order) : 0,
        is_active: data.is_active,
      };

      if (video) {
        const { error } = await supabase.from('videos').update(payload).eq('id', video.id);
        if (error) throw error;
        toast.success('Video updated.');
      } else {
        const { error } = await supabase.from('videos').insert(payload);
        if (error) throw error;
        toast.success('Video added.');
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
          <DialogTitle>{video ? 'Edit video' : 'Add video'}</DialogTitle>
          <DialogDescription>
            Add a customer testimonial, a review, or an announcement video.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="v-title">Title</Label>
              <Input
                id="v-title"
                placeholder="e.g. Mrs. Sharma's Sunday test experience"
                {...register('title')}
                className={cn('mt-1.5', errors.title && 'border-destructive')}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="v-customer">Customer name</Label>
              <Input
                id="v-customer"
                placeholder="e.g. Mrs. Sharma"
                {...register('customer_name')}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Video type</Label>
              <div className="mt-1.5">
                <Select
                  value={watch('video_type')}
                  onValueChange={(v) => setValue('video_type', v as VideoType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Video source</Label>
              <div className="mt-1.5">
                <Select
                  value={watch('video_source')}
                  onValueChange={(v) => {
                    setValue('video_source', v as VideoSource);
                    // Clear video_url so the user can re-enter for the new source
                    setValue('video_url', '');
                    setValue('thumbnail_url', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Source-specific input */}
          {source === 'upload' && (
            <div>
              <Label>Video file</Label>
              <div className="mt-1.5">
                <VideoUpload
                  value={videoUrl || null}
                  onChange={(url) =>
                    setValue('video_url', url ?? '', { shouldValidate: true })
                  }
                />
              </div>
              {errors.video_url && (
                <p className="mt-1 text-xs text-destructive">{errors.video_url.message}</p>
              )}
            </div>
          )}

          {source === 'youtube' && (
            <div>
              <Label htmlFor="v-yt">YouTube URL</Label>
              <Input
                id="v-yt"
                placeholder="https://youtube.com/watch?v=..."
                {...register('video_url')}
                className={cn('mt-1.5', errors.video_url && 'border-destructive')}
              />
              <p className="mt-1 text-xs text-brand-muted">
                Paste any YouTube link — e.g. https://youtube.com/watch?v=… or
                https://youtu.be/…. We&apos;ll fetch the thumbnail automatically.
              </p>
              {errors.video_url && (
                <p className="mt-1 text-xs text-destructive">{errors.video_url.message}</p>
              )}
            </div>
          )}

          {source === 'instagram' && (
            <div>
              <Label htmlFor="v-ig">Instagram Reel URL</Label>
              <Input
                id="v-ig"
                placeholder="https://www.instagram.com/reel/..."
                {...register('video_url')}
                className={cn('mt-1.5', errors.video_url && 'border-destructive')}
              />
              <p className="mt-1 text-xs text-brand-muted">
                Paste the full Instagram reel or post link.
              </p>
              {errors.video_url && (
                <p className="mt-1 text-xs text-destructive">{errors.video_url.message}</p>
              )}
            </div>
          )}

          {/* Thumbnail — manual override only meaningful for uploads. */}
          {source === 'upload' && (
            <div>
              <Label htmlFor="v-thumb">Thumbnail URL (optional)</Label>
              <Input
                id="v-thumb"
                placeholder="https://..."
                {...register('thumbnail_url')}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-brand-muted">
                Image shown before play. Leave blank to use the first frame of the video.
              </p>
            </div>
          )}

          {source === 'youtube' && thumbnailUrl && (
            <p className="text-xs text-brand-muted">
              Thumbnail will be auto-fetched from YouTube.
            </p>
          )}

          <div>
            <Label htmlFor="v-desc">Description</Label>
            <Textarea
              id="v-desc"
              rows={3}
              placeholder="Short caption shown below the video on the home page."
              {...register('description')}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="v-order">Display order</Label>
              <Input
                id="v-order"
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
                <p className="text-xs text-brand-muted">Show on the home page.</p>
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
              {submitting ? 'Saving...' : video ? 'Save changes' : 'Add video'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(v: Video | null): FormValues {
  return {
    title: v?.title ?? '',
    customer_name: v?.customer_name ?? '',
    video_type: (v?.video_type as VideoType) ?? 'testimonial',
    video_source: (v?.video_source as VideoSource) ?? 'upload',
    video_url: v?.video_url ?? '',
    thumbnail_url: v?.thumbnail_url ?? '',
    description: v?.description ?? '',
    display_order: v?.display_order != null ? String(v.display_order) : '0',
    is_active: v?.is_active ?? true,
  };
}
