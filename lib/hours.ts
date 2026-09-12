import type { Dictionary } from './i18n/types';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  open?: string;
  close?: string;
  closed?: boolean;
}

export type Schedule = Record<DayKey, DayHours>;

/** Monday-first, matching how the shop and the contact page list the week. */
export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const SHORT_LABEL: Record<DayKey, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

const LONG_LABEL: Record<DayKey, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

/** Day names come from the dictionary when one is passed; English otherwise. */
function shortLabel(key: DayKey, dict?: Dictionary): string {
  return dict ? dict.common.days[key] : SHORT_LABEL[key];
}

function longLabel(key: DayKey, dict?: Dictionary): string {
  if (!dict) return LONG_LABEL[key];
  const map: Record<DayKey, string> = {
    mon: dict.common.fullDays.monday,
    tue: dict.common.fullDays.tuesday,
    wed: dict.common.fullDays.wednesday,
    thu: dict.common.fullDays.thursday,
    fri: dict.common.fullDays.friday,
    sat: dict.common.fullDays.saturday,
    sun: dict.common.fullDays.sunday,
  };
  return map[key];
}

function fill(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m));
}

/**
 * The shop's opening hours, and the fallback whenever the settings row is
 * missing or malformed. Every hours string on the site is derived from this
 * shape — there is no free-text hours value anywhere.
 */
export const SHOP_HOURS_SCHEDULE: Schedule = {
  mon: { open: '09:00', close: '22:00' },
  tue: { open: '09:00', close: '22:00' },
  wed: { open: '09:00', close: '22:00' },
  thu: { open: '09:00', close: '22:00' },
  fri: { open: '09:00', close: '22:00' },
  sat: { open: '09:00', close: '22:00' },
  sun: { open: '09:00', close: '14:00' },
};

/** "09:00" → "9 AM", "14:30" → "2:30 PM". Whole hours drop the ":00". */
export function formatClock(time: string): string {
  const [hRaw, mRaw] = time.split(':');
  const h = parseInt(hRaw, 10);
  const m = parseInt(mRaw ?? '0', 10);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hh} ${period}` : `${hh}:${String(m).padStart(2, '0')} ${period}`;
}

function isClosed(d: DayHours | undefined): boolean {
  return !d || d.closed === true || !d.open || !d.close;
}

function dayRange(d: DayHours): string {
  return `${formatClock(d.open!)} – ${formatClock(d.close!)}`;
}

/** Normalise anything read from settings into a complete, safe schedule. */
export function coerceSchedule(raw: unknown): Schedule {
  if (!raw || typeof raw !== 'object') return SHOP_HOURS_SCHEDULE;
  const source = raw as Record<string, unknown>;
  const out = {} as Schedule;
  for (const key of DAY_ORDER) {
    const entry = source[key];
    if (entry && typeof entry === 'object') {
      const e = entry as DayHours;
      out[key] = e.closed
        ? { closed: true }
        : typeof e.open === 'string' && typeof e.close === 'string'
          ? { open: e.open, close: e.close }
          : SHOP_HOURS_SCHEDULE[key];
    } else {
      out[key] = SHOP_HOURS_SCHEDULE[key];
    }
  }
  return out;
}

export interface HoursSegment {
  /** "Mon–Sat", or a single day's label when its hours stand alone. */
  label: string;
  /** "9:30 AM – 9:30 PM", or the closed label. */
  hours: string;
}

/**
 * The week collapsed into runs of days that share the same hours, kept as
 * separate label/hours pairs.
 *
 * Callers render these rather than a pre-joined string so they can hold each
 * time range together: "9:30 AM – 9:30 PM" contains two spaces the browser is
 * free to break at, which used to strand an orphan "AM –" at the end of a
 * line in the footer's narrow column.
 */
export function formatHoursSegments(schedule: Schedule, dict?: Dictionary): HoursSegment[] {
  const runs: { days: DayKey[]; text: string }[] = [];
  for (const key of DAY_ORDER) {
    const day = schedule[key];
    const text = isClosed(day) ? (dict?.common.closedLabel ?? 'Closed') : dayRange(day);
    const last = runs[runs.length - 1];
    if (last && last.text === text) last.days.push(key);
    else runs.push({ days: [key], text });
  }
  return runs.map(({ days, text }) => ({
    label:
      days.length === 1
        ? shortLabel(days[0], dict)
        : `${shortLabel(days[0], dict)}–${shortLabel(days[days.length - 1], dict)}`,
    hours: text,
  }));
}

/**
 * "Mon–Sat 9 AM – 10 PM · Sun 9 AM – 2 PM".
 * Consecutive days sharing identical hours collapse into one range.
 *
 * The flat string form, for contexts that need plain text (the admin settings
 * preview). Anything rendering to the page should use formatHoursSegments so
 * the ranges can be kept unbreakable.
 */
export function formatHoursSummary(schedule: Schedule, dict?: Dictionary): string {
  return formatHoursSegments(schedule, dict)
    .map(({ label, hours }) => `${label} ${hours}`)
    .join(' · ');
}

/** Seven rows for the contact page table. */
export function formatHoursDetailed(
  schedule: Schedule,
  dict?: Dictionary
): { day: string; hours: string; isSunday: boolean }[] {
  return DAY_ORDER.map((key) => ({
    day: longLabel(key, dict),
    hours: isClosed(schedule[key])
      ? (dict?.common.closedLabel ?? 'Closed')
      : dayRange(schedule[key]),
    isSunday: key === 'sun',
  }));
}

/** ISO-8601 day tokens for schema.org openingHoursSpecification. */
export function hoursSpecification(schedule: Schedule) {
  const SCHEMA_DAY: Record<DayKey, string> = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  };
  return DAY_ORDER.filter((k) => !isClosed(schedule[k])).map((k) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: SCHEMA_DAY[k],
    opens: schedule[k].open,
    closes: schedule[k].close,
  }));
}

export interface OpenStatus {
  state: 'open' | 'closing-soon' | 'closed';
  label: string;
}

/** Minutes since midnight, or null for an unparseable time. */
function toMinutes(time: string): number | null {
  const [h, m] = time.split(':');
  const hh = parseInt(h, 10);
  const mm = parseInt(m ?? '0', 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

/** Read wall-clock weekday and time in Asia/Kolkata, never the visitor's zone. */
export function istParts(now: Date): { dayIndex: number; minutes: number } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const weekday = get('weekday').toLowerCase().slice(0, 3);
  const dayIndex = Math.max(0, DAY_ORDER.indexOf(weekday as DayKey));
  const hour = parseInt(get('hour'), 10) || 0;
  const minute = parseInt(get('minute'), 10) || 0;
  return { dayIndex, minutes: hour * 60 + minute };
}

const CLOSING_SOON_MIN = 45;

/**
 * Current open/closed state in shop time.
 *
 * When closed, it walks forward up to seven days to name the next opening, so
 * the label is always actionable — "opens 9 AM", "opens tomorrow 9 AM", or
 * "opens Mon 9 AM" — rather than a bare "Closed".
 */
export function getOpenStatus(
  schedule: Schedule,
  now: Date = new Date(),
  dict?: Dictionary
): OpenStatus {
  const { dayIndex, minutes } = istParts(now);
  const todayKey = DAY_ORDER[dayIndex];
  const today = schedule[todayKey];

  if (!isClosed(today)) {
    const open = toMinutes(today.open!);
    const close = toMinutes(today.close!);
    if (open !== null && close !== null && minutes >= open && minutes < close) {
      const closeLabel = formatClock(today.close!);
      if (close - minutes <= CLOSING_SOON_MIN) {
        return {
          state: 'closing-soon',
          label: dict
            ? fill(dict.status.closingSoon, { time: closeLabel })
            : `Closing soon · ${closeLabel}`,
        };
      }
      return {
        state: 'open',
        label: dict
          ? fill(dict.status.openNow, { time: closeLabel })
          : `Open now · closes ${closeLabel}`,
      };
    }
    // Before opening time, still today.
    if (open !== null && minutes < open) {
      const openLabel = formatClock(today.open!);
      return {
        state: 'closed',
        label: dict
          ? fill(dict.status.opensAt, { time: openLabel })
          : `Closed · opens ${openLabel}`,
      };
    }
  }

  for (let step = 1; step <= 7; step++) {
    const key = DAY_ORDER[(dayIndex + step) % 7];
    const day = schedule[key];
    if (isClosed(day)) continue;
    const openLabel = formatClock(day.open!);
    if (dict) {
      return {
        state: 'closed',
        label:
          step === 1
            ? fill(dict.status.opensTomorrow, { time: openLabel })
            : fill(dict.status.opensOn, { day: shortLabel(key, dict), time: openLabel }),
      };
    }
    const when = step === 1 ? 'tomorrow ' : `${SHORT_LABEL[key]} `;
    return { state: 'closed', label: `Closed · opens ${when}${openLabel}` };
  }
  return { state: 'closed', label: dict?.status.closed ?? 'Closed' };
}
