import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DOCTOR_SPECIALTIES } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Turn a stored specialty into its display label.
 *
 * The three built-ins are stored lowercase ('nadi', 'physiotherapy',
 * 'homeopathy') and get their proper capitalisation back. Anything else is a
 * custom specialty the admin typed, so it is shown exactly as entered.
 *
 * Every place that renders a specialty goes through here — there is no
 * enum-to-label map anywhere else.
 */
export function formatSpecialty(value: string | null | undefined): string {
  const raw = (value ?? '').trim();
  if (!raw) return '';
  const known = DOCTOR_SPECIALTIES.find((s) => s.value === raw.toLowerCase());
  return known ? known.label : raw;
}

export function formatINR(amount: number | null | undefined) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function formatTime12(time: string) {
  // time is "HH:MM" or "HH:MM:SS"
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m.toString().padStart(2, '0')} ${period}`;
}

export function generateTimeSlots(start: string, end: string, durationMin: number): string[] {
  const slots: string[] = [];
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  let current = sH * 60 + sM;
  const endMin = eH * 60 + eM;
  while (current + durationMin <= endMin) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    current += durationMin;
  }
  return slots;
}

export function whatsappLink(phone: string, message?: string) {
  const base = `https://wa.me/${phone}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Build a `tel:` URI from a display phone number, stripping spaces/dashes. */
export function telLink(phone: string) {
  return `tel:${phone.replace(/[\s-]/g, '')}`;
}

/** Pull the YouTube video ID from any common YouTube URL form. */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&?#]+)/,
    /youtu\.be\/([^&?#/]+)/,
    /youtube\.com\/shorts\/([^&?#/]+)/,
    /youtube\.com\/embed\/([^&?#/]+)/,
    /youtube\.com\/v\/([^&?#/]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

/** Pull the Instagram post/reel ID from a URL. */
export function extractInstagramId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#]+)/);
  return m ? m[1] : null;
}

export function instagramEmbedUrl(url: string): string {
  const id = extractInstagramId(url);
  if (!id) return url;
  return `https://www.instagram.com/p/${id}/embed/captioned`;
}

export function dayOfWeek(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export function isValidPhoneIN(phone: string) {
  // Accepts +91 prefix or 10-digit mobile, with optional spaces/dashes.
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+?91)?[6-9]\d{9}$/.test(cleaned);
}

export function normalizePhoneIN(phone: string) {
  const cleaned = phone.replace(/[\s-+]/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned;
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}
