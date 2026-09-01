'use client';

import * as React from 'react';
import { getDoctorAvailability, cn } from '@/lib/utils';
import { useT } from './i18n/language-provider';
import type { Doctor } from '@/lib/types';

/**
 * "Available today" / "Next: Wed" pill, rendered as the first row of a doctor
 * card's body.
 *
 * Deliberately NOT over the photograph — a badge pinned to the image covers
 * faces, which is the one thing the photo is there for. It sits in the card
 * body instead, above the specialty eyebrow.
 *
 * The row keeps a fixed height whatever it contains, including before mount
 * and for on-request doctors, so cards in a carousel or grid stay aligned.
 *
 * Availability is resolved in an effect because the page can be cached, and a
 * weekday computed on the server would go stale and trip hydration.
 */
export function DoctorAvailabilityBadge({
  doctor,
  className,
}: {
  doctor: Doctor;
  className?: string;
}) {
  const { dict } = useT();
  const [availability, setAvailability] = React.useState<ReturnType<
    typeof getDoctorAvailability
  > | null>(null);

  React.useEffect(() => {
    setAvailability(getDoctorAvailability(doctor, new Date(), dict));
  }, [doctor, dict]);

  // 28px pill + 8px gap, reserved even while empty.
  const row = cn('flex h-7 items-center mb-2', className);

  const pill =
    'inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 ' +
    'text-[0.75rem] font-medium leading-none whitespace-nowrap';

  if (doctor.is_on_request) {
    return (
      <div className={row}>
        <span className={cn(pill, 'border border-line bg-bg-elevated text-ink-muted')}>
          {dict.doctors.byRequest}
        </span>
      </div>
    );
  }

  if (!availability || availability.state === 'on_request') {
    return <div className={row} aria-hidden />;
  }

  const isToday = availability.state === 'today';

  return (
    <div className={row}>
      <span
        className={cn(
          pill,
          isToday
            ? 'bg-teal text-white'
            : 'border border-line bg-bg-elevated text-ink-muted'
        )}
      >
        {isToday && (
          <span aria-hidden className="block h-2 w-2 shrink-0 rounded-full bg-white" />
        )}
        <span className="truncate">
          {isToday ? dict.doctors.availableToday : `${dict.doctors.next}: ${availability.day}`}
          {availability.timeRange && (
            <span className="hidden sm:inline"> · {availability.timeRange}</span>
          )}
        </span>
      </span>
    </div>
  );
}
