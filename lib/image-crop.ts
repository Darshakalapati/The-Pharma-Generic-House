// Crop geometry and canvas rasterisation for the admin image cropper.
//
// Kept out of the component so the maths is readable on its own: everything
// here works in *source pixel* coordinates, and the only browser APIs touched
// are Image/canvas at the very bottom.

/** A crop window in source-image pixels. */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Normalised [0,1] point in the source image that must stay visible. */
export interface FocusPoint {
  x: number;
  y: number;
}

export const CENTER_FOCUS: FocusPoint = { x: 0.5, y: 0.5 };

/** Target aspect ratios by usage. Width / height. */
export const ASPECT = {
  promoBanner: 21 / 9,
  heroPhoto: 3 / 4,
  familyPhoto: 4 / 5,
  doctorPhoto: 1,
  productPhoto: 1,
  videoThumbnail: 16 / 9,
} as const;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/**
 * The largest rectangle of the given aspect ratio that fits inside the image.
 * One dimension always equals the source; the other is the constrained one.
 */
export function largestRectForAspect(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number
): { width: number; height: number } {
  if (imageWidth / imageHeight > aspectRatio) {
    // Source is wider than the target — height is the limit.
    return { width: imageHeight * aspectRatio, height: imageHeight };
  }
  // Source is taller than (or equal to) the target — width is the limit.
  return { width: imageWidth, height: imageWidth / aspectRatio };
}

/**
 * Crop window for smart-focus mode: the largest rectangle at `aspectRatio`,
 * centred on `focus`, then snapped so it never leaves the image. A focus point
 * near an edge therefore still yields a full-size crop — it just stops sliding
 * once it hits the boundary.
 */
export function cropRectFromFocus(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number,
  focus: FocusPoint = CENTER_FOCUS
): CropRect {
  const { width, height } = largestRectForAspect(imageWidth, imageHeight, aspectRatio);
  const centerX = focus.x * imageWidth;
  const centerY = focus.y * imageHeight;
  return {
    x: clamp(centerX - width / 2, 0, imageWidth - width),
    y: clamp(centerY - height / 2, 0, imageHeight - height),
    width,
    height,
  };
}

/**
 * `object-position` percentages that make a CSS `object-fit: cover` box show
 * exactly `rect`. Cover already picks the largest rectangle at the container's
 * aspect, so only the offset has to be expressed — as a fraction of the total
 * overflow along each axis.
 */
export function objectPositionForRect(
  imageWidth: number,
  imageHeight: number,
  rect: CropRect
): { x: number; y: number } {
  const overflowX = imageWidth - rect.width;
  const overflowY = imageHeight - rect.height;
  return {
    x: overflowX > 0.5 ? clamp((rect.x / overflowX) * 100, 0, 100) : 50,
    y: overflowY > 0.5 ? clamp((rect.y / overflowY) * 100, 0, 100) : 50,
  };
}

/** Where the focus point sits inside the crop window, as [0,1] fractions. */
export function focusWithinRect(
  imageWidth: number,
  imageHeight: number,
  rect: CropRect,
  focus: FocusPoint
): { x: number; y: number } {
  return {
    x: clamp((focus.x * imageWidth - rect.x) / rect.width, 0, 1),
    y: clamp((focus.y * imageHeight - rect.y) / rect.height, 0, 1),
  };
}

/** Inverse of {@link focusWithinRect} — a click inside the crop window becomes a focus point. */
export function focusFromRectFraction(
  imageWidth: number,
  imageHeight: number,
  rect: CropRect,
  fraction: { x: number; y: number }
): FocusPoint {
  return {
    x: clamp((rect.x + fraction.x * rect.width) / imageWidth, 0, 1),
    y: clamp((rect.y + fraction.y * rect.height) / imageHeight, 0, 1),
  };
}

/** Load a File into an HTMLImageElement, revoking the object URL afterwards. */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image file.'));
    };
    img.src = url;
  });
}

/**
 * Rasterise `cropRect` of `imageFile` to a JPEG blob at exactly `aspectRatio`.
 *
 * The output is capped at `outputMaxWidth` on the long edge so a 6000px phone
 * photo doesn't get uploaded at full size. The canvas is always sized to the
 * target aspect, so even a defensive/rounded crop rect lands on an exact ratio.
 */
export async function cropImageToBlob(
  imageFile: File,
  cropRect: CropRect,
  aspectRatio: number,
  outputMaxWidth = 2000
): Promise<Blob> {
  const img = await loadImage(imageFile);

  const outWidth = Math.round(Math.min(cropRect.width, outputMaxWidth));
  const outHeight = Math.round(outWidth / aspectRatio);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, outWidth);
  canvas.height = Math.max(1, outHeight);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare the image for cropping.');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // White matte — the source may be a PNG with transparency, and we emit JPEG.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    img,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not crop that image.'))),
      'image/jpeg',
      0.9
    );
  });
}
