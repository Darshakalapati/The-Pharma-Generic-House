export type ProductCategory = 'general' | 'pharma' | 'ayurvedic' | 'cosmetic';
/** The three built-in specialties. Any other value is free text the admin typed. */
export type DoctorSpecialty = 'nadi' | 'physiotherapy' | 'homeopathy';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type TestBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type EnquiryStatus = 'new' | 'contacted' | 'completed';
export type MessageStatus = 'new' | 'read' | 'replied';
export type CollectionType = 'shop' | 'home';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string | null;
  image_url: string | null;
  in_stock: boolean;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  /** One of the three built-ins, or any custom specialty typed by the admin. */
  specialty: string;
  /** Free text, e.g. "MBBS, MD (Cardiology)". Hidden entirely when empty. */
  qualifications: string | null;
  bio: string | null;
  photo_url: string | null;
  consultation_fee: number | null;
  available_days: string[];
  available_time_start: string | null;
  available_time_end: string | null;
  slot_duration_minutes: number;
  is_active: boolean;
  is_on_request: boolean;
  display_order: number;
  created_at: string;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_phone: string;
  patient_age: number | null;
  preferred_date: string;
  preferred_time: string;
  notes: string | null;
  status: AppointmentStatus;
  created_at: string;
  doctor?: Doctor;
}

export interface MedicalTest {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

export interface TestBooking {
  id: string;
  test_id: string;
  patient_name: string;
  patient_phone: string;
  patient_address: string | null;
  preferred_date: string;
  collection_type: CollectionType;
  status: TestBookingStatus;
  notes: string | null;
  created_at: string;
  test?: MedicalTest;
}

export interface EnquiryItem {
  product_id: string;
  product_name: string;
  quantity: number;
}

export interface Enquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  items: EnquiryItem[];
  status: EnquiryStatus;
  notes: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: any;
}

export interface ShopSettings {
  reservation_pickup_enabled: boolean;
  shop_phone: string;
  shop_whatsapp: string;
  shop_address: string;
  /** Admin-uploaded section photos; empty string falls back to the bundled image. */
  diagnostics_photo_url: string;
  about_photo_url: string;
  /** Copied from the Google Business Profile. Null until an admin fills them in;
   *  the rating badge renders only when both are present. */
  google_rating: number | null;
  google_review_count: number | null;
}

export type AnnouncementColor = 'plum' | 'teal';

export interface Announcement {
  id: string;
  /** Internal label for the admin list — never shown to customers. */
  title: string;
  text: string;
  link_label: string | null;
  link_url: string | null;
  background_color: AnnouncementColor;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export type VideoType = 'testimonial' | 'review' | 'announcement';
export type VideoSource = 'upload' | 'youtube' | 'instagram';

export interface Video {
  id: string;
  title: string;
  customer_name: string | null;
  video_type: VideoType;
  video_url: string;
  video_source: VideoSource;
  thumbnail_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  stars: number;
  review_text: string;
  review_date_label: string;
  source: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

/** A photograph in the home page hero rotation. */
export interface HeroPhoto {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

/** A person featured in the "Our story" section on the home page. */
export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  quote_text: string | null;
  quote_attribution: string | null;
  display_order: number;
  is_active: boolean;
  is_featured_quote: boolean;
  created_at: string;
}

export type BannerType = 'image' | 'text';
export type BannerBackgroundStyle = 'plum' | 'teal' | 'cream';

export interface PromoBanner {
  id: string;
  title: string;
  banner_type: BannerType;
  image_url: string | null;
  headline: string | null;
  subheading: string | null;
  button_label: string | null;
  button_link: string | null;
  background_style: BannerBackgroundStyle;
  display_order: number;
  is_active: boolean;
  created_at: string;
}
