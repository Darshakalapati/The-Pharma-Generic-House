'use client';

import * as React from 'react';
import { Upload, X, ImageIcon, Crop } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

/**
 * Pulls in react-easy-crop, which is only needed once someone actually picks
 * a file to crop.
 */
const ImageCropper = dynamic(
  () => import('./image-cropper').then((m) => m.ImageCropper),
  { ssr: false, loading: () => null }
);
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
  /** Override preview tile aspect — defaults to a 128px square, or to a tile at
   *  `aspectRatio` when one is set. */
  previewClassName?: string;
  /** Client-side size ceiling in MB. Keep in step with the bucket's
   *  `file_size_limit`, or the upload fails server-side instead. */
  maxSizeMb?: number;
  /** Target display aspect (width / height). When set, a picked file goes
   *  through the cropper first and only the cropped JPEG is uploaded. */
  aspectRatio?: number;
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
  aspectRatio,
  className,
}: Props) {
  const [uploading, setUploading] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = React.useState(false);
  // Latched, not derived: once the cropper has been opened it stays mounted,
  // so Radix still plays the dialog's exit animation on close. Before the
  // first open the chunk is never fetched.
  const [cropperUsed, setCropperUsed] = React.useState(false);
  React.useEffect(() => {
    if (cropperOpen) setCropperUsed(true);
  }, [cropperOpen]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const clearInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  /** Push bytes to storage and hand the public URL back to the form. */
  const upload = async (data: Blob, extension: string) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
      const path = pathLayout === 'flat' ? fileName : `${folder}/${fileName}`;
      const { error } = await supabase.storage.from(bucket).upload(path, data, {
        cacheControl: '3600',
        upsert: false,
        contentType: data.type || 'image/jpeg',
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
      clearInput();
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please pick an image file.');
      clearInput();
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      toast.error(`Image must be under ${maxSizeMb} MB.`);
      clearInput();
      return;
    }

    // With a target ratio, crop before uploading. Without one, keep the
    // original straight-to-storage behaviour.
    if (aspectRatio) {
      setPendingFile(file);
      setCropperOpen(true);
      return;
    }
    await upload(file, file.name.split('.').pop() ?? 'jpg');
  };

  /**
   * Re-open the cropper for the current image. Uses the file still in memory
   * when there is one; otherwise pulls the stored image back down so a crop can
   * be redone on a record that was saved earlier.
   */
  const reCrop = async () => {
    if (pendingFile) {
      setCropperOpen(true);
      return;
    }
    if (!value) return;
    try {
      const res = await fetch(value);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      setPendingFile(new File([blob], 'current.jpg', { type: blob.type || 'image/jpeg' }));
      setCropperOpen(true);
    } catch {
      toast.error('Could not reload that image to re-crop. Upload it again instead.');
    }
  };

  const previewStyle = aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined;
  const previewSize = previewClassName ?? (aspectRatio ? 'w-44' : 'h-32 w-32');

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'shrink-0 rounded-xl border border-brand-line bg-brand-cream-warm overflow-hidden',
            previewSize
          )}
          style={previewStyle}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover object-center"
            />
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
          {aspectRatio && value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reCrop}
              disabled={uploading}
            >
              <Crop className="h-4 w-4" /> Re-crop
            </Button>
          )}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null);
                setPendingFile(null);
              }}
              disabled={uploading}
            >
              <X className="h-4 w-4" /> Remove
            </Button>
          )}
          <p className="text-xs text-brand-muted">JPG/PNG/WebP, up to {maxSizeMb} MB.</p>
        </div>
      </div>

      {aspectRatio && cropperUsed && (
        <ImageCropper
          imageFile={pendingFile}
          aspectRatio={aspectRatio}
          open={cropperOpen}
          onCancel={() => {
            setCropperOpen(false);
            clearInput();
          }}
          onCropComplete={async (blob) => {
            setCropperOpen(false);
            await upload(blob, 'jpg');
          }}
        />
      )}
    </div>
  );
}
