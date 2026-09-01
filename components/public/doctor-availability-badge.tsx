'use client';

import * as React from 'react';
import { getDoctorAvailability, cn } from '@/lib/utils';
import type { Doctor } from '@/lib/types';
import { useT } from './i18n/language-provider';

/**
 * "Available today" / "Next: Wed" marker, overlaid on a doctor's photo.
 *
 * Resolved in an effect rather than during render: the home page can be
 * statically cached, so a weekday computed on the server would be baked in and
 * go stale. Rendering nothing until mount also keeps the server and client
 * markup identical, so there is no hydration mismatch.
 *
 * It is absolutely positioned over the photo, so it adds no height and cannot
 * disturb the equal card heights in the carousel.
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

  if (!availability || availability.state === 'on_request') return null;

  const { state, day, timeRange } = availability;
  const isToday = state === 'today';

  return (
    <span
      className={cn(
        'absolute left-3 top-3 z-10 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5',
        'rounded-full px-2.5 py-1 text-[0.75rem] font-medium leading-none whitespace-nowrap',
        isToday
          ? 'bg-teal text-white'
          : 'border border-line bg-bg-elevated text-ink-muted',
        className
      )}
    >
      {isToday && (
        <span aria-hidden className="block h-2 w-2 shrink-0 rounded-full bg-white" />
      )}
      <span className="truncate">
        {isToday ? dict.doctors.availableToday : `${dict.doctors.next}: ${day}`}
        {/* The time range is the first thing to go on a narrow card. */}
        {timeRange && <span className="hidden sm:inline"> · {timeRange}</span>}
      </span>
    </span>
  );
}
