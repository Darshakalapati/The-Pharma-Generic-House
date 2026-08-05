'use client';

import * as React from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Crosshair, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  CENTER_FOCUS,
  cropImageToBlob,
  cropRectFromFocus,
  focusFromRectFraction,
  focusWithinRect,
  loadImage,
  objectPositionForRect,
  type CropRect,
  type FocusPoint,
} from '@/lib/image-crop';

export type CropMode = 'smart_focus' | 'manual_crop';

interface Props {
  imageFile: File | null;
  aspectRatio: number;
  mode?: CropMode;
  open: boolean;
  onCropComplete: (
    croppedBlob: Blob,
    focusPoint: FocusPoint | null,
    cropRect: CropRect | null
  ) => void;
  onCancel: () => void;
}

/**
 * Crops an upload to the aspect ratio its slot on the public site actually
 * uses, so nothing gets awkwardly cut off at display time.
 *
 * Two modes, per the brief:
 *  - smart focus (default) — the photo fills a frame at the target ratio and
 *    the admin taps the thing that must always stay visible; the crop window
 *    recentres on it and snaps to the image bounds.
 *  - manual crop — react-easy-crop with a ratio-locked box and a zoom slider.
 *
 * Either way the result is rasterised client-side to an exact-ratio JPEG; the
 * original is never uploaded.
 */
export function ImageCropper({
  imageFile,
  aspectRatio,
  mode: initialMode = 'smart_focus',
  open,
  onCropComplete,
  onCancel,
}: Props) {
  const [mode, setMode] = React.useState<CropMode>(initialMode);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [natural, setNatural] = React.useState<{ w: number; h: number } | null>(null);
  const [focus, setFocus] = React.useState<FocusPoint>(CENTER_FOCUS);
  const [saving, setSaving] = React.useState(false);

  // react-easy-crop state
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [manualArea, setManualArea] = React.useState<Area | null>(null);

  const stageRef = React.useRef<HTMLDivElement>(null);

  // Load the file once per open, and reset every choice made about the last one.
  React.useEffect(() => {
    if (!open || !imageFile) return;
    let cancelled = false;
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    setMode(initialMode);
    setFocus(CENTER_FOCUS);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setManualArea(null);
    setNatural(null);

    loadImage(imageFile)
      .then((img) => {
        if (!cancelled) setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not read that image file.');
      });

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [open, imageFile, initialMode]);

  const smartRect: CropRect | null = React.useMemo(
    () => (natural ? cropRectFromFocus(natural.w, natural.h, aspectRatio, focus) : null),
    [natural, aspectRatio, focus]
  );

  const objectPosition = React.useMemo(() => {
    if (!natural || !smartRect) return { x: 50, y: 50 };
    return objectPositionForRect(natural.w, natural.h, smartRect);
  }, [natural, smartRect]);

  const crosshairAt = React.useMemo(() => {
    if (!natural || !smartRect) return { x: 0.5, y: 0.5 };
    return focusWithinRect(natural.w, natural.h, smartRect, focus);
  }, [natural, smartRect, focus]);

  const setFocusFromPointer = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage || !natural || !smartRect) return;
    const box = stage.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const fraction = {
      x: (clientX - box.left) / box.width,
      y: (clientY - box.top) / box.height,
    };
    setFocus(focusFromRectFraction(natural.w, natural.h, smartRect, fraction));
  };

  const save = async () => {
    if (!imageFile || !natural) return;
    const rect =
      mode === 'manual_crop' && manualArea
        ? {
            x: manualArea.x,
            y: manualArea.y,
            width: manualArea.width,
            height: manualArea.height,
          }
        : smartRect;
    if (!rect) return;

    setSaving(true);
    try {
      const blob = await cropImageToBlob(imageFile, rect, aspectRatio);
      onCropComplete(
        blob,
        mode === 'smart_focus' ? focus : null,
        mode === 'manual_crop' ? rect : null
      );
    } catch (e) {
      console.error(e);
      toast.error('Could not crop that image. Try a different file.');
    } finally {
      setSaving(false);
    }
  };

  const ratioLabel = describeRatio(aspectRatio);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onCancel()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            This image is shown at {ratioLabel} on the site. Choose what stays in frame.
          </DialogDescription>
        </DialogHeader>

        {!natural ? (
          <div className="grid h-56 place-items-center text-brand-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : mode === 'smart_focus' ? (
          <div className="space-y-3">
            <Label>Focus point</Label>
            <div
              ref={stageRef}
              role="button"
              tabIndex={0}
              aria-label="Set focus point"
              onClick={(e) => setFocusFromPointer(e.clientX, e.clientY)}
              onKeyDown={(e) => {
                // Arrow keys nudge the focus point for keyboard users.
                const step = 0.02;
                if (e.key === 'ArrowLeft') setFocus((f) => ({ ...f, x: Math.max(0, f.x - step) }));
                else if (e.key === 'ArrowRight') setFocus((f) => ({ ...f, x: Math.min(1, f.x + step) }));
                else if (e.key === 'ArrowUp') setFocus((f) => ({ ...f, y: Math.max(0, f.y - step) }));
                else if (e.key === 'ArrowDown') setFocus((f) => ({ ...f, y: Math.min(1, f.y + step) }));
                else return;
                e.preventDefault();
              }}
              className="relative w-full overflow-hidden rounded-xl border border-brand-line bg-brand-cream-warm cursor-crosshair"
              style={{ aspectRatio: String(aspectRatio) }}
            >
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  draggable={false}
                  className="h-full w-full select-none"
                  style={{
                    objectFit: 'cover',
                    objectPosition: `${objectPosition.x}% ${objectPosition.y}%`,
                  }}
                />
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-purple shadow-[0_0_0_1px_rgba(31,26,31,0.15)]"
                style={{
                  left: `${crosshairAt.x * 100}%`,
                  top: `${crosshairAt.y * 100}%`,
                }}
              >
                <Crosshair className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="text-xs text-brand-muted">
              Tap on the photo to set the focus point — this is the part that will
              always be shown.
            </p>
            <button
              type="button"
              onClick={() => setMode('manual_crop')}
              className="text-xs font-medium text-brand-purple underline underline-offset-2 hover:text-brand-purple-deep"
            >
              Switch to manual crop
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Label>Manual crop</Label>
            <div
              className="relative w-full overflow-hidden rounded-xl border border-brand-line bg-brand-ink"
              style={{ aspectRatio: String(aspectRatio) }}
            >
              {previewUrl && (
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspectRatio}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_area, areaPixels) => setManualArea(areaPixels)}
                  restrictPosition
                />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-brand-muted shrink-0">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Zoom"
                className="w-full accent-brand-purple"
              />
            </div>
            <p className="text-xs text-brand-muted">
              Drag the box to select what to show. Zoom in for detail.
            </p>
            <button
              type="button"
              onClick={() => setMode('smart_focus')}
              className="text-xs font-medium text-brand-purple underline underline-offset-2 hover:text-brand-purple-deep"
            >
              Back to smart focus
            </button>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={saving || !natural}
            className="flex-1"
          >
            {saving ? 'Saving crop...' : 'Save crop'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** "21:9", "4:5", "square" — for the dialog description. */
function describeRatio(ratio: number): string {
  const known: [number, string][] = [
    [21 / 9, '21:9 (wide banner)'],
    [16 / 9, '16:9 (landscape)'],
    [4 / 5, '4:5 (portrait)'],
    [3 / 4, '3:4 (portrait)'],
    [1, '1:1 (square)'],
  ];
  const hit = known.find(([r]) => Math.abs(r - ratio) < 0.01);
  return hit ? hit[1] : `${ratio.toFixed(2)}:1`;
}
