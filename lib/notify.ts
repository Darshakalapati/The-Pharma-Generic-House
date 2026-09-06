/**
 * Email notifications for new bookings, enquiries and messages.
 *
 * SERVER ONLY. This module reads RESEND_API_KEY and must never be imported
 * from a client component.
 *
 * Every function here is best-effort: if the shop hasn't configured Resend
 * yet, or Resend is down, we log and return. A customer's booking must never
 * fail because an email didn't go out — the row is already in the database
 * and visible in /admin either way.
 */

import { Resend } from 'resend';
import { SHOP_NAME } from '@/lib/constants';

const FROM = `${SHOP_NAME} <bookings@pharmagenerichouse.com>`;
const ADMIN_URL = 'https://www.pharmagenerichouse.com/admin';

// Brand accents, inlined as hex — email clients have no Tailwind.
const PLUM = '#6B2C5F';
const TEAL = '#2A9B8E';
const INK = '#1F1A1F';
const INK_MUTED = '#6B6470';
const LINE = '#EDE6DC';
const CREAM = '#FBF7F2';

export interface AppointmentPayload {
  patient_name: string;
  patient_phone: string;
  patient_age?: number | null;
  doctor_name: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string | null;
}

export interface TestBookingPayload {
  patient_name: string;
  patient_phone: string;
  patient_address?: string | null;
  test_name: string;
  preferred_date: string;
  collection_type: 'shop' | 'home';
  notes?: string | null;
}

export interface EnquiryPayload {
  customer_name: string;
  customer_phone: string;
  items: { product_name: string; quantity: number }[];
  notes?: string | null;
}

export interface ContactPayload {
  name: string;
  phone: string;
  email?: string | null;
  message: string;
}

export type NotificationInput =
  | { kind: 'appointment'; payload: AppointmentPayload }
  | { kind: 'test_booking'; payload: TestBookingPayload }
  | { kind: 'enquiry'; payload: EnquiryPayload }
  | { kind: 'contact'; payload: ContactPayload };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Escape user-supplied text before it goes into the HTML body. */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * wa.me needs a bare country-code + number. Customers type all of
 * "9885067198", "+91 98850 67198" and "09885067198", so reduce to the last
 * ten digits and prefix 91.
 */
function waNumber(phone: string): string {
  const digits = String(phone ?? '').replace(/\D/g, '');
  return `91${digits.slice(-10)}`;
}

/** Timestamp in the shop's own timezone, never the server's. */
function istNow(): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

function time12(time: string): string {
  const [hStr, mStr] = String(time ?? '').split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m.toString().padStart(2, '0')} ${period}`;
}

type Row = [label: string, value: string | null | undefined];

/** Table of fields. Rows with no value are dropped rather than left blank. */
function fieldTable(rows: Row[]): string {
  const cells = rows
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid ${LINE};color:${INK_MUTED};font-size:13px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
          <td style="padding:10px 16px;border-bottom:1px solid ${LINE};color:${INK};font-size:15px;vertical-align:top;">${esc(value)}</td>
        </tr>`
    )
    .join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid ${LINE};border-radius:8px;overflow:hidden;">${cells}</table>`;
}

function itemList(items: { product_name: string; quantity: number }[]): string {
  return items
    .map((i) => `${i.product_name} — qty ${i.quantity}`)
    .join('\n');
}

/** Shell: heading, the caller's table, then the two action links. */
function wrap({
  heading,
  name,
  phone,
  body,
}: {
  heading: string;
  name: string;
  phone: string;
  body: string;
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:${CREAM};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${TEAL};font-weight:600;">${esc(SHOP_NAME)}</p>
      <h1 style="margin:0 0 4px;font-size:20px;line-height:1.3;color:${PLUM};font-weight:600;">${esc(heading)}</h1>
      <p style="margin:0 0 20px;font-size:13px;color:${INK_MUTED};">${esc(istNow())} IST</p>

      ${body}

      <div style="margin-top:24px;">
        <a href="https://wa.me/${waNumber(phone)}" style="display:inline-block;padding:11px 20px;margin:0 8px 8px 0;background:${TEAL};color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:6px;">WhatsApp ${esc(name)}</a>
        <a href="${ADMIN_URL}" style="display:inline-block;padding:11px 20px;margin:0 8px 8px 0;background:#ffffff;color:${PLUM};font-size:14px;font-weight:500;text-decoration:none;border:1px solid ${PLUM};border-radius:6px;">Open admin</a>
      </div>
    </div>
  </body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Message building                                                    */
/* ------------------------------------------------------------------ */

/**
 * Exported so the subject line can be asserted in tests and logged without
 * actually sending anything.
 */
export function buildNotification(input: NotificationInput): {
  subject: string;
  html: string;
} {
  switch (input.kind) {
    case 'appointment': {
      const p = input.payload;
      return {
        subject: `New appointment — ${p.patient_name} with ${p.doctor_name}`,
        html: wrap({
          heading: 'New appointment request',
          name: p.patient_name,
          phone: p.patient_phone,
          body: fieldTable([
            ['Patient', p.patient_name],
            ['Phone', p.patient_phone],
            ['Age', p.patient_age != null ? String(p.patient_age) : null],
            ['Doctor', p.doctor_name],
            ['Date', p.preferred_date],
            ['Time', time12(p.preferred_time)],
            ['Notes', p.notes],
          ]),
        }),
      };
    }
    case 'test_booking': {
      const p = input.payload;
      return {
        subject: `New test booking — ${p.patient_name} · ${p.test_name} · ${p.collection_type}`,
        html: wrap({
          heading: 'New test booking',
          name: p.patient_name,
          phone: p.patient_phone,
          body: fieldTable([
            ['Patient', p.patient_name],
            ['Phone', p.patient_phone],
            ['Test', p.test_name],
            ['Date', p.preferred_date],
            ['Collection', p.collection_type === 'home' ? 'Home collection' : 'At the shop'],
            ['Address', p.patient_address],
            ['Notes', p.notes],
          ]),
        }),
      };
    }
    case 'enquiry': {
      const p = input.payload;
      return {
        subject: `New product enquiry — ${p.customer_name} (${p.items.length} items)`,
        html: wrap({
          heading: 'New product enquiry',
          name: p.customer_name,
          phone: p.customer_phone,
          body: fieldTable([
            ['Customer', p.customer_name],
            ['Phone', p.customer_phone],
            ['Items', itemList(p.items)],
            ['Notes', p.notes],
          ]),
        }),
      };
    }
    case 'contact': {
      const p = input.payload;
      return {
        subject: `New message — ${p.name}`,
        html: wrap({
          heading: 'New contact message',
          name: p.name,
          phone: p.phone,
          body: fieldTable([
            ['Name', p.name],
            ['Phone', p.phone],
            ['Email', p.email],
            ['Message', p.message],
          ]),
        }),
      };
    }
  }
}

/* ------------------------------------------------------------------ */
/* Send                                                                */
/* ------------------------------------------------------------------ */

/**
 * Email the shop about a new submission.
 *
 * Never throws. Callers still wrap it in try/catch as a second belt, but the
 * contract here is that a missing key or a Resend outage is a warning in the
 * server log, not a failed booking.
 */
export async function sendNotification(input: NotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;

  const { subject, html } = buildNotification(input);

  if (!apiKey || !to) {
    console.warn(
      `[notify] RESEND_API_KEY or NOTIFY_EMAIL not set — skipping email. Subject would have been: "${subject}"`
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('[notify] Resend rejected the message:', error);
    }
  } catch (err) {
    console.error('[notify] Failed to send notification email:', err);
  }
}
