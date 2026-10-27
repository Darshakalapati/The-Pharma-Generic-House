// Shop details. These values are also editable from /admin/settings (stored in
// the `settings` table). The values here serve as fallback defaults when no
// setting row exists.

export const SHOP_NAME = 'The Pharma Generic House';
export const SHOP_TAGLINE = 'Your trusted neighbourhood pharmacy';
export const SHOP_EST = 2018;

// Phone number as displayed on the site (with country code and spaces).
export const SHOP_PHONE = '+91 98850 67198';

// Phone number for `tel:` URIs — no spaces or formatting characters.
export const SHOP_PHONE_TEL = '+919885067198';

// WhatsApp number for wa.me links (no plus, country code first).
export const SHOP_WHATSAPP = '919885067198';

// The one canonical address. Every display site, the maps embed, the
// directions link and the JSON-LD all read from here or from the matching
// `shop_address` setting seeded to the same string.
export const SHOP_ADDRESS =
  'The Pharma Generic House, Opp Golden Pavilion, Governerpeta, Vijayawada, Andhra Pradesh 520002';

/**
 * Google Maps link for an address. The `search` form drops a pin on the shop
 * and Maps itself offers a Directions button from there — and on a phone the
 * URL hands off to the native Maps app.
 *
 * Takes the address so callers can pass the value resolved from settings,
 * which an admin may have edited, rather than the constant below.
 */
export function getMapsUrl(address?: string): string {
  const resolved = address?.trim() || SHOP_ADDRESS;
  // The canonical address already leads with the shop name; only prefix it
  // when an admin has overridden the address with something that doesn't.
  const query = resolved.toLowerCase().startsWith(SHOP_NAME.toLowerCase())
    ? resolved
    : `${SHOP_NAME}, ${resolved}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Convenience for callers with no settings to hand. */
export const GOOGLE_MAPS_URL = getMapsUrl(SHOP_ADDRESS);

/** The same address split for multi-line display (footer, contact card). */
export const SHOP_ADDRESS_LINES = [
  'The Pharma Generic House',
  'Opp Golden Pavilion, Governerpeta',
  'Vijayawada, Andhra Pradesh 520002',
] as const;

// Opening hours are NOT stored here — they live as a structured schedule in
// lib/hours.ts (and the `shop_hours_schedule` setting). Every hours string on
// the site is derived from that one shape.

export const SHOP_CITY = 'Vijayawada';

export const TEST_DAY = 'Sunday';

export const SHOP_EMAIL = 'usalapati@yahoo.com';

// Prefilled message for the "Send prescription on WhatsApp" call to action.
export const PRESCRIPTION_WA_TEXT =
  "Hi The Pharma Generic House, I'd like to order medicines. I'm attaching my prescription.";

export const PRESCRIPTION_WA_TEXT_TE =
  'నమస్తే The Pharma Generic House, నాకు మందులు కావాలి. నా ప్రిస్క్రిప్షన్ జత చేస్తున్నాను.';

// Public Google Maps URL for the shop's review listing. Used by the home
// page reviews section ("Read all reviews on Google →") and the admin
// /admin/reviews helper tip box.
export const GOOGLE_REVIEWS_URL =
  'https://www.google.com/maps/place/The+Pharma+Generic+House/@16.5092295,80.6214302,17z/data=!4m8!3m7!1s0x3a35fb7d1ed11387:0xde552d6c0e675e4!8m2!3d16.5092295!4d80.6240051!9m1!1b1!16s%2Fg%2F11f61dkj4y?entry=ttu';

export const PRODUCT_CATEGORIES = [
  { value: 'general', label: 'General Medicine' },
  { value: 'pharma', label: 'Pharma' },
  { value: 'ayurvedic', label: 'Ayurvedic' },
  { value: 'cosmetic', label: 'Cosmetics' },
] as const;

/**
 * Categories for the salt-name directory (migration 0020). `general` is shared
 * with the featured shelf; the other four exist only here.
 */
export const DIRECTORY_CATEGORIES = [
  { value: 'medicine', label: 'Medicines' },
  { value: 'herbal', label: 'Herbal' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'general', label: 'General' },
] as const;

/** Every category value a bulk import may use, across both layers. */
export const ALL_CATEGORY_VALUES = Array.from(
  new Set([
    ...PRODUCT_CATEGORIES.map((c) => c.value),
    ...DIRECTORY_CATEGORIES.map((c) => c.value),
  ])
) as string[];

export const DOCTOR_SPECIALTIES = [
  { value: 'nadi', label: 'Nadi' },
  { value: 'physiotherapy', label: 'Physiotherapy' },
  { value: 'homeopathy', label: 'Homeopathy' },
] as const;

export const APPOINTMENT_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const TEST_BOOKING_STATUS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const ENQUIRY_STATUS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'completed', label: 'Completed' },
] as const;

export const MESSAGE_STATUS = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
] as const;

export const WEEKDAYS = [
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
  { value: 'Sat', label: 'Saturday' },
  { value: 'Sun', label: 'Sunday' },
] as const;
