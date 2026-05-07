// Shop details. These values are also editable from /admin/settings (stored in
// the `settings` table). The values here serve as fallback defaults when no
// setting row exists.

export const SHOP_NAME = 'The Pharma Generic House';
export const SHOP_TAGLINE = 'Your trusted neighbourhood pharmacy';
export const SHOP_EST = 2010;

// Phone number as displayed on the site (with country code and spaces).
export const SHOP_PHONE = '+91 98850 67198';

// Phone number for `tel:` URIs — no spaces or formatting characters.
export const SHOP_PHONE_TEL = '+919885067198';

// WhatsApp number for wa.me links (no plus, country code first).
export const SHOP_WHATSAPP = '919885067198';

export const SHOP_ADDRESS =
  'MG Road, Near Raghavaiah Park Rd, opp. Golden Pavallion, Governor Peta, Vijayawada, Andhra Pradesh 520002, India';

// Short summary form used in the footer, hero trust bar, and contact CTA band.
export const SHOP_HOURS = 'Mon–Sat: 9 AM – 10 PM · Sun: 9 AM – 2 PM';

// Day-by-day breakdown for the contact page hours table.
export const SHOP_HOURS_DETAILED = [
  { day: 'Monday', hours: '9 AM – 10 PM' },
  { day: 'Tuesday', hours: '9 AM – 10 PM' },
  { day: 'Wednesday', hours: '9 AM – 10 PM' },
  { day: 'Thursday', hours: '9 AM – 10 PM' },
  { day: 'Friday', hours: '9 AM – 10 PM' },
  { day: 'Saturday', hours: '9 AM – 10 PM' },
  { day: 'Sunday', hours: '9 AM – 2 PM' },
] as const;

export const SHOP_CITY = 'Vijayawada';

export const TEST_DAY = 'Sunday';

export const SHOP_EMAIL = 'hello@pharmagenerichouse.com';

export const PRODUCT_CATEGORIES = [
  { value: 'general', label: 'General Medicine' },
  { value: 'pharma', label: 'Pharma' },
  { value: 'ayurvedic', label: 'Ayurvedic' },
  { value: 'cosmetic', label: 'Cosmetics' },
] as const;

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
