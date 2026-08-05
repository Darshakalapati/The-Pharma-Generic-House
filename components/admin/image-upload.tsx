'use client';

import * as React from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  /** Storage bucket to upload into. Defaults to `public-images`. */
  bucket?: string;
  /** Path layout inside the bucket. `nested` puts the file at `{folder}/{name}`;
   *  `flat` uploads at `{name}` and ignores `folder` (useful for buckets that
   *  are dedicated to a single asset type, e.g. `promo-banners`). */
  pathLayout?: 'nested' | 'flat';
  /** Override preview tile aspect — defaults to a 128px square. */
  previewClassName?: string;
  /** Client-side size ceiling in MB. Keep in step with the bucket's
   *  `file_size_limit`, or the upload fails server-side instead. */
  maxSizeMb?: number;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder,
  bucket = 'public-images',
  pathLayout = 'nested',
  previewClassName,
  maxSizeMb = 5,
  className,
}: Props) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please pick an image file.');
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Image must be under ${maxSizeMb} MB.`);
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = pathLayout === 'flat' ? fileName : `${folder}/${fileName}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(pub.publicUrl);
      toast.success('Image uploaded.');
    } catch (e: any) {
      console.error(e);
      toast.error('Upload failed. Check your Supabase storage bucket.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'shrink-0 rounded-xl border border-brand-line bg-brand-cream-warm overflow-hidden',
            previewClassName ?? 'h-32 w-32'
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-brand-muted">
              <ImageIcon className="h-7 w-7" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
              disabled={uploading}
            >
              <X className="h-4 w-4" /> Remove
            </Button>
          )}
          <p className="text-xs text-brand-muted">JPG/PNG/WebP, up to {maxSizeMb} MB.</p>
        </div>
      </div>
    </div>
  );
}
