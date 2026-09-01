'use client';

import * as React from 'react';
import Link from 'next/link';
import { getOpenStatus, type Schedule } from '@/lib/hours';
import { getDoctorAvailability, cn } from '@/lib/utils';
import { useT } from './i18n/language-provider';
import type { Doctor } from '@/lib/types';

const REFRESH_MS = 60_000;

/** Days until the next Sunday in shop time; 0 when today is Sunday. */
function daysUntilSunday(weekday: string): number {
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const i = order.indexOf(weekday);
  if (i < 0) return 0;
  return 6 - i;
}

/**
 * A live snapshot of the shop: open state, which doctors are in today, and how
 * far off Sunday's Test Day is.
 *
 * Everything resolves after mount in Asia/Kolkata — the page can be cached, so
 * a "today" computed on the server would go stale within hours and a
 * server/client mismatch would trip hydration.
 */
export function TodayCard({
  doctors,
  schedule,
  className,
}: {
  doctors: Doctor[];
  schedule: Schedule;
  className?: string;
}) {
  const { dict, locale } = useT();
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  if (!now) return null;

  const status = getOpenStatus(schedule, now, dict);
  const dateLabel = new Intl.DateTimeFormat(locale === 'te' ? 'te-IN' : 'en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(now);

  const weekday = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(now);

  // Doctors consulting today, earliest first.
  const todaysDoctors = doctors
    .filter((d) => !d.is_on_request)
    .map((d) => ({ doctor: d, availability: getDoctorAvailability(d, now, dict) }))
    .filter((x) => x.availability.state === 'today')
    .sort((a, b) =>
      (a.doctor.available_time_start ?? '').localeCompare(b.doctor.available_time_start ?? '')
    );

  const untilSunday = daysUntilSunday(weekday);
  const testDayLine =
    untilSunday === 0
      ? dict.today.testDayToday
      : untilSunday === 1
        ? dict.today.testDayTomorrow
        : dict.today.testDayIn.replace('{n}', String(untilSunday));

  const dotClass =
    status.state === 'open'
      ? 'bg-teal'
      : status.state === 'closing-soon'
        ? 'bg-[#D4A24C]'
        : 'bg-ink-faint';

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">{dict.today.eyebrow}</span>
        <span className="text-[0.75rem] text-ink-faint whitespace-nowrap">{dateLabel}</span>
      </div>

      <div className="mt-4 divide-y divide-line text-[0.875rem]">
        <p className="flex items-center gap-2 pb-3 text-ink">
          <span aria-hidden className={cn('block h-2 w-2 shrink-0 rounded-full', dotClass)} />
          {status.label}
        </p>

        {todaysDoctors.length === 0 ? (
          <p className="py-3 text-ink-muted">{dict.today.noDoctors}</p>
        ) : (
          todaysDoctors.map(({ doctor, availability }) => (
            <p key={doctor.id} className="flex flex-wrap gap-x-2 py-3 text-ink-muted">
              <span className="text-ink">{doctor.name}</span>
              {availability.timeRange && <span>{availability.timeRange}</span>}
            </p>
          ))
        )}

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-ink-muted">
          <span>{testDayLine}</span>
          <Link href="/tests" className="link-underline link-plum whitespace-nowrap">
            {dict.today.book}
          </Link>
        </p>
      </div>
    </div>
  );
}
