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
