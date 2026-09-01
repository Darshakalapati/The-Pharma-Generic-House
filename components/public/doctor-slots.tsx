'use client';

import * as React from 'react';
import { getNextAvailableSlots, type Slot } from '@/lib/slots';
import { useT } from './i18n/language-provider';
import { cn } from '@/lib/utils';
import type { Doctor } from '@/lib/types';

/**
 * Up to three bookable times under a doctor's schedule line.
 *
 * Resolved after mount for the same reason as the availability badge: "today"
 * cannot be baked into a cached page. The row reserves its height whether or
 * not slots are found, so cards in the carousel stay the same height.
 */
export function DoctorSlots({
  doctor,
  onPick,
  className,
}: {
  doctor: Doctor;
  onPick: (slot: Slot) => void;
  className?: string;
}) {
  const { dict } = useT();
  const [slots, setSlots] = React.useState<Slot[] | null>(null);

  React.useEffect(() => {
    setSlots(getNextAvailableSlots(doctor, new Date(), 3, dict));
  }, [doctor, dict]);

  // Fixed min-height keeps sibling cards aligned through every state.
  if (doctor.is_on_request) {
    return (
      <div className={cn('min-h-[3.75rem] pt-3', className)}>
        <p className="text-[0.8125rem] text-ink-muted">{dict.doctors.byRequest}</p>
      </div>
    );
  }

  return (
    <div className={cn('min-h-[3.75rem] pt-3', className)}>
      {slots && slots.length > 0 && (
        <>
          <p className="eyebrow text-[0.625rem]">{dict.common.suggestedTimes}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {slots.map((slot) => (
              <button
                key={`${slot.date}-${slot.time}`}
                type="button"
                onClick={() => onPick(slot)}
                className="rounded-full border border-line px-2.5 py-1 text-[0.75rem] font-medium text-ink transition-colors hover:border-plum hover:text-plum"
              >
                {slot.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
