'use client';

import * as React from 'react';
import { Upload, X, Film, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

/**
 * Video upload to the public `videos` Supabase Storage bucket.
 *
 * Uses a direct XHR PUT to the storage REST endpoint (instead of the
 * supabase-js helper) so we can show real upload progress via the XHR
 * `progress` event. The user must be an authenticated admin — the upload
 * is authorised by their session access token.
 */
export function VideoUpload({ value, onChange, className }: Props) {
  const [progress, setProgress] = React.useState<number | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const xhrRef = React.useRef<XMLHttpRequest | null>(null);

  const reset = () => {
    setProgress(null);
    setUploading(false);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Pick an MP4, MOV, or WebM video.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('Video must be under 50 MB.');
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setProgress(0);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Your session has expired. Please sign in again.');
        reset();
        return;
      }

      const ext = file.name.split('.').pop() ?? 'mp4';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/videos/${encodeURIComponent(path)}`;

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      const done = await new Promise<boolean>((resolve) => {
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.setRequestHeader('cache-control', '3600');

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve(true);
          } else {
            console.error('Upload failed', xhr.status, xhr.responseText);
            resolve(false);
          }
        });
        xhr.addEventListener('error', () => resolve(false));
        xhr.addEventListener('abort', () => resolve(false));

        xhr.send(file);
      });

      xhrRef.current = null;

      if (!done) {
        toast.error('Upload failed. Check your connection and try again.');
        reset();
        return;
      }

      const { data: pub } = supabase.storage.from('videos').getPublicUrl(path);
      onChange(pub.publicUrl);
      toast.success('Video uploaded.');
      // Keep the file name visible briefly, then clear progress UI.
      window.setTimeout(() => {
        setUploading(false);
        setProgress(null);
      }, 400);
    } catch (e) {
      console.error(e);
      toast.error('Upload failed.');
      reset();
    }
  };

  const cancel = () => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    reset();
  };

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      {!value && !uploading && (
        <div className="rounded-xl border border-dashed border-brand-line bg-brand-cream-warm/50 p-6 text-center">
          <Film className="h-7 w-7 mx-auto text-brand-muted" />
          <p className="mt-3 text-sm text-brand-ink font-medium">No video uploaded yet</p>
          <p className="mt-1 text-xs text-brand-muted">MP4, MOV, or WebM. Up to 50 MB.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            className="mt-4"
          >
            <Upload className="h-4 w-4" /> Pick a video
          </Button>
        </div>
      )}

      {value && !uploading && (
        <div className="rounded-xl border border-brand-line bg-white overflow-hidden">
          <video
            src={value}
            controls
            playsInline
            className="w-full max-h-64 bg-black"
          />
          <div className="flex items-center justify-between gap-2 p-3 border-t border-brand-line">
            <p className="text-xs text-brand-muted truncate">Uploaded video</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" /> Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(null)}
                className="text-destructive hover:bg-destructive/5 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="rounded-xl border border-brand-line bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="h-4 w-4 animate-spin text-brand-purple shrink-0" />
              <p className="text-sm text-brand-ink font-medium truncate">
                {fileName ?? 'Uploading...'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-brand-muted tabular-nums">
                {progress ?? 0}%
              </span>
              <button
                type="button"
                onClick={cancel}
                aria-label="Cancel upload"
                className="text-brand-muted hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-brand-line overflow-hidden">
            <div
              className="h-full bg-brand-purple transition-[width] duration-200 ease-out"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
