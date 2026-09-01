import { generateTimeSlots, istWeekday, formatTime12 } from './utils';
import type { Doctor } from './types';
import type { Dictionary } from './i18n/types';

export interface Slot {
  /** YYYY-MM-DD in shop time. */
  date: string;
  /** HH:mm, matching the values the booking dialog's time select uses. */
  time: string;
  /** Display label, e.g. "Today 7:00 PM" or "Wed 7:00 PM". */
  label: string;
}

const DAY_SEQUENCE = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Same slot grid the booking dialog offers, so a suggestion is always bookable. */
export function generateSlots(doctor: Doctor, _dateISO?: string): string[] {
  if (!doctor.available_time_start || !doctor.available_time_end) return [];
  return generateTimeSlots(
    doctor.available_time_start,
    doctor.available_time_end,
    doctor.slot_duration_minutes ?? 30
  );
}

/** Calendar date in Asia/Kolkata, `offset` days from now, as YYYY-MM-DD. */
function istDateISO(now: Date, offset: number): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '01';
  const base = new Date(`${get('year')}-${get('month')}-${get('day')}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + offset);
  return base.toISOString().slice(0, 10);
}

/** Minutes since midnight, in shop time. */
function istMinutes(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? '0', 10);
  return get('hour') * 60 + get('minute');
}

/** How far ahead a slot must start to be offered today. */
const LEAD_MINUTES = 30;

/**
 * The next few bookable times for a doctor.
 *
 * These are suggestions, not reservations — we deliberately do not consult the
 * appointments table, because the shop confirms every booking on WhatsApp
 * anyway. Today's slots need `LEAD_MINUTES` of notice so nobody is offered a
 * time that has effectively already passed; otherwise the search rolls forward
 * to the doctor's next consulting day.
 */
export function getNextAvailableSlots(
  doctor: Doctor,
  now: Date = new Date(),
  count = 3,
  dict?: Dictionary
): Slot[] {
  if (doctor.is_on_request) return [];
  const times = generateSlots(doctor);
  if (times.length === 0 || doctor.available_days.length === 0) return [];

  const norm = (d: string) => d.trim().slice(0, 3).toLowerCase();
  const worksOn = (label: string) => doctor.available_days.some((d) => norm(d) === label.toLowerCase());

  const today = istWeekday(now);
  const startIdx = Math.max(0, DAY_SEQUENCE.indexOf(today));
  const nowMinutes = istMinutes(now);
  const out: Slot[] = [];

  for (let step = 0; step < 7 && out.length < count; step++) {
    const dayLabel = DAY_SEQUENCE[(startIdx + step) % 7];
    if (!worksOn(dayLabel)) continue;

    for (const time of times) {
      if (out.length >= count) break;
      if (step === 0) {
        const [h, m] = time.split(':').map(Number);
        if (h * 60 + m < nowMinutes + LEAD_MINUTES) continue;
      }
      const prefix =
        step === 0
          ? (dict?.common.today ?? 'Today')
          : (dict?.common.days[dayLabel.toLowerCase() as 'mon'] ?? dayLabel);
      out.push({
        date: istDateISO(now, step),
        time,
        label: `${prefix} ${formatTime12(time)}`,
      });
    }
  }
  return out;
}
