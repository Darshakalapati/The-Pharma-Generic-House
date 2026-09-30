'use server';

/**
 * Server actions for the four public submission forms.
 *
 * These used to insert straight from the browser with the anon key. Moving
 * them server-side buys two things: the payload is re-validated somewhere the
 * customer can't edit, and we get a server context to send the notification
 * email from.
 *
 * The inserts still go through the anon-key server client rather than the
 * service-role one, so the existing `*_public_insert` RLS policies remain the
 * boundary — a bug here can't write anything the browser couldn't already.
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotification } from '@/lib/notify';
import { isValidPhoneIN } from '@/lib/utils';

export interface SubmitResult {
  ok: boolean;
  /** Present only when ok is false. Callers show their own generic copy. */
  error?: string;
}

const phone = z.string().refine(isValidPhoneIN, 'Invalid phone number');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date');

/**
 * Email failures must never surface to the customer: the row is saved and
 * visible in /admin regardless. sendNotification already swallows its own
 * errors; this is the second belt for anything unexpected.
 */
async function notifyQuietly(input: Parameters<typeof sendNotification>[0]) {
  try {
    await sendNotification(input);
  } catch (err) {
    console.error('[actions] Notification failed:', err);
  }
}

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

const appointmentSchema = z.object({
  doctor_id: z.string().uuid(),
  patient_name: z.string().trim().min(2).max(120),
  patient_phone: phone,
  patient_age: z.number().int().positive().lt(120).nullable().optional(),
  preferred_date: isoDate,
  preferred_time: z.string().min(1).max(8),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export async function submitAppointment(
  input: z.input<typeof appointmentSchema>
): Promise<SubmitResult> {
  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Please check the form and try again.' };
  const data = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('appointments').insert({
    doctor_id: data.doctor_id,
    patient_name: data.patient_name,
    patient_phone: data.patient_phone,
    patient_age: data.patient_age ?? null,
    preferred_date: data.preferred_date,
    preferred_time: data.preferred_time,
    notes: data.notes || null,
    status: 'pending',
  });
  if (error) return { ok: false, error: error.message };

  // Read the doctor's name from the database rather than trusting a name
  // posted by the browser — it only ever appears in the shop's own inbox.
  const { data: doctor } = await supabase
    .from('doctors')
    .select('name')
    .eq('id', data.doctor_id)
    .maybeSingle();

  await notifyQuietly({
    kind: 'appointment',
    payload: {
      patient_name: data.patient_name,
      patient_phone: data.patient_phone,
      patient_age: data.patient_age ?? null,
      doctor_name: doctor?.name ?? 'Doctor',
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      notes: data.notes ?? null,
    },
  });

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Test bookings                                                       */
/* ------------------------------------------------------------------ */

const testBookingSchema = z
  .object({
    test_id: z.string().uuid(),
    patient_name: z.string().trim().min(2).max(120),
    patient_phone: phone,
    patient_address: z.string().trim().max(500).nullable().optional(),
    preferred_date: isoDate,
    collection_type: z.enum(['shop', 'home']),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  // Home collection without an address is unworkable for the shop, so the
  // rule is enforced here as well as in the dialog.
  .refine((v) => v.collection_type !== 'home' || !!v.patient_address, {
    message: 'An address is required for home collection.',
    path: ['patient_address'],
  });

export async function submitTestBooking(
  input: z.input<typeof testBookingSchema>
): Promise<SubmitResult> {
  const parsed = testBookingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Please check the form and try again.' };
  const data = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('test_bookings').insert({
    test_id: data.test_id,
    patient_name: data.patient_name,
    patient_phone: data.patient_phone,
    patient_address: data.patient_address || null,
    preferred_date: data.preferred_date,
    collection_type: data.collection_type,
    notes: data.notes || null,
    status: 'pending',
  });
  if (error) return { ok: false, error: error.message };

  const { data: test } = await supabase
    .from('tests')
    .select('name')
    .eq('id', data.test_id)
    .maybeSingle();

  await notifyQuietly({
    kind: 'test_booking',
    payload: {
      patient_name: data.patient_name,
      patient_phone: data.patient_phone,
      patient_address: data.patient_address ?? null,
      test_name: test?.name ?? 'Test',
      preferred_date: data.preferred_date,
      collection_type: data.collection_type,
      notes: data.notes ?? null,
    },
  });

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Product enquiries                                                   */
/* ------------------------------------------------------------------ */

const enquirySchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_phone: phone,
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        product_name: z.string().trim().min(1).max(200),
        quantity: z.number().int().positive().max(999),
      })
    )
    .min(1)
    .max(50),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export async function submitEnquiry(
  input: z.input<typeof enquirySchema>
): Promise<SubmitResult> {
  const parsed = enquirySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Please check the form and try again.' };
  const data = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('enquiries').insert({
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    items: data.items,
    notes: data.notes || null,
    status: 'new',
  });
  if (error) return { ok: false, error: error.message };

  await notifyQuietly({
    kind: 'enquiry',
    payload: {
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      items: data.items,
      notes: data.notes ?? null,
    },
  });

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Contact messages                                                    */
/* ------------------------------------------------------------------ */

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone,
  email: z.string().trim().email().nullable().optional().or(z.literal('')),
  message: z.string().trim().min(5).max(5000),
});

export async function submitContactMessage(
  input: z.input<typeof contactSchema>
): Promise<SubmitResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Please check the form and try again.' };
  const data = parsed.data;

  const supabase = createClient();
  const { error } = await supabase.from('contact_messages').insert({
    name: data.name,
    phone: data.phone,
    email: data.email || null,
    message: data.message,
    status: 'new',
  });
  if (error) return { ok: false, error: error.message };

  await notifyQuietly({
    kind: 'contact',
    payload: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      message: data.message,
    },
  });

  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Callback requests                                                   */
/* ------------------------------------------------------------------ */

/** How long a repeat submission from the same number is treated as a dupe. */
const CALLBACK_DEDUPE_MS = 10 * 60 * 1000;

/**
 * Reduce anything a visitor might type to the ten digits we store.
 *
 * Length-driven rather than prefix-driven on purpose: stripping a leading "91"
 * by pattern would mangle a genuine ten-digit number that happens to start
 * 91xxxxxxxx. Returns null when the result isn't a real Indian mobile.
 */
function toTenDigits(raw: string): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '');
  let ten = digits;
  if (ten.length === 13 && ten.startsWith('091')) ten = ten.slice(3);
  else if (ten.length === 12 && ten.startsWith('91')) ten = ten.slice(2);
  else if (ten.length === 11 && ten.startsWith('0')) ten = ten.slice(1);
  // Same rule as isValidPhoneIN: Indian mobile numbers all begin 6-9.
  return /^[6-9]\d{9}$/.test(ten) ? ten : null;
}

/**
 * Record a "call me back" request.
 *
 * Writes with the service-role client: migration 0017 gives this table no
 * public policy at all, so unlike the other four forms nothing reachable from
 * a browser can read or write it.
 *
 * `honeypot` is a field hidden from real users. A bot that fills it gets a
 * successful-looking result and no row — telling it that it was caught would
 * only help it try again.
 */
export async function submitCallbackRequest(
  phone: string,
  source: 'band' | 'slidein',
  honeypot?: string
): Promise<SubmitResult> {
  if (honeypot && honeypot.trim() !== '') return { ok: true };

  const ten = toTenDigits(phone);
  if (!ten) return { ok: false, error: 'invalidPhone' };

  const resolvedSource = source === 'slidein' ? 'slidein' : 'band';
  const admin = createAdminClient();

  // A visitor who taps twice, or fills both the band and the slide-in, should
  // not produce two rows the shop has to reconcile.
  const since = new Date(Date.now() - CALLBACK_DEDUPE_MS).toISOString();
  const { data: recent } = await admin
    .from('callback_requests')
    .select('id')
    .eq('phone', ten)
    .gte('created_at', since)
    .limit(1);
  if (recent && recent.length > 0) return { ok: true };

  const { error } = await admin.from('callback_requests').insert({
    phone: ten,
    source: resolvedSource,
    status: 'pending',
  });
  if (error) return { ok: false, error: error.message };

  await notifyQuietly({
    kind: 'callback',
    payload: { phone: ten, source: resolvedSource },
  });

  return { ok: true };
}
