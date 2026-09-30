import { createClient } from '@/lib/supabase/server';
import {
  SHOP_PHONE,
  SHOP_WHATSAPP,
  SHOP_ADDRESS,
} from '@/lib/constants';
import type { ShopSettings } from '@/lib/types';
import { coerceSchedule, SHOP_HOURS_SCHEDULE, type Schedule } from '@/lib/hours';

const DEFAULTS: ShopSettings = {
  reservation_pickup_enabled: false,
  shop_phone: SHOP_PHONE,
  shop_whatsapp: SHOP_WHATSAPP,
  shop_address: SHOP_ADDRESS,
  diagnostics_photo_url: '',
  about_photo_url: '',
  whatsapp_reply_note: '',
  google_rating: null,
  google_review_count: null,
  contrast_line1_en: '',
  contrast_line2_en: '',
  contrast_line1_te: '',
  contrast_line2_te: '',
};

export async function getShopSettings(): Promise<ShopSettings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error || !data) return DEFAULTS;

    const map = new Map(data.map((row) => [row.key, row.value]));
    return {
      reservation_pickup_enabled: extractBool(map.get('reservation_pickup_enabled')) ?? DEFAULTS.reservation_pickup_enabled,
      shop_phone: extractString(map.get('shop_phone')) ?? DEFAULTS.shop_phone,
      shop_whatsapp: extractString(map.get('shop_whatsapp')) ?? DEFAULTS.shop_whatsapp,
      shop_address: extractString(map.get('shop_address')) ?? DEFAULTS.shop_address,
      diagnostics_photo_url: extractString(map.get('diagnostics_photo_url')) ?? '',
      about_photo_url: extractString(map.get('about_photo_url')) ?? '',
      whatsapp_reply_note: extractString(map.get('whatsapp_reply_note')) ?? '',
      google_rating: extractNumber(map.get('google_rating')),
      google_review_count: extractNumber(map.get('google_review_count')),
      contrast_line1_en: extractString(map.get('contrast_line1_en')) ?? '',
      contrast_line2_en: extractString(map.get('contrast_line2_en')) ?? '',
      contrast_line1_te: extractString(map.get('contrast_line1_te')) ?? '',
      contrast_line2_te: extractString(map.get('contrast_line2_te')) ?? '',
    };
  } catch {
    return DEFAULTS;
  }
}

function extractBool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  if (v && typeof v === 'object' && 'value' in (v as any)) {
    const inner = (v as any).value;
    if (typeof inner === 'boolean') return inner;
  }
  return null;
}

/** Numeric settings arrive as a bare jsonb number, or wrapped as { value }. */
function extractNumber(v: unknown): number | null {
  const raw =
    v && typeof v === 'object' && 'value' in (v as any) ? (v as any).value : v;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function extractString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'value' in (v as any)) {
    const inner = (v as any).value;
    if (typeof inner === 'string') return inner;
  }
  return null;
}

/**
 * Server-side read of the stored opening-hours schedule.
 *
 * Lives here rather than in lib/hours.ts so that module stays free of any
 * server-only import and can be pulled into the client OpenStatus component.
 */
export async function getSchedule(): Promise<Schedule> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'shop_hours_schedule')
      .maybeSingle();
    if (error || !data) return SHOP_HOURS_SCHEDULE;
    const value = (data as { value: unknown }).value;
    const unwrapped =
      value && typeof value === 'object' && 'value' in (value as any)
        ? (value as any).value
        : value;
    return coerceSchedule(unwrapped);
  } catch {
    return SHOP_HOURS_SCHEDULE;
  }
}
