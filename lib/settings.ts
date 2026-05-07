import { createClient } from '@/lib/supabase/server';
import {
  SHOP_PHONE,
  SHOP_WHATSAPP,
  SHOP_ADDRESS,
  SHOP_HOURS,
} from '@/lib/constants';
import type { ShopSettings } from '@/lib/types';

const DEFAULTS: ShopSettings = {
  reservation_pickup_enabled: false,
  shop_phone: SHOP_PHONE,
  shop_whatsapp: SHOP_WHATSAPP,
  shop_address: SHOP_ADDRESS,
  shop_hours: SHOP_HOURS,
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
      shop_hours: extractString(map.get('shop_hours')) ?? DEFAULTS.shop_hours,
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

function extractString(v: unknown): string | null {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'value' in (v as any)) {
    const inner = (v as any).value;
    if (typeof inner === 'string') return inner;
  }
  return null;
}
