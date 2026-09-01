'use client';

import * as React from 'react';
import Image from 'next/image';
import { Calendar, Clock, IndianRupee, ArrowRight } from 'lucide-react';
import { AppointmentDialog } from './appointment-dialog';
import { resolveDoctorPhoto } from '@/lib/images';
import { DoctorAvailabilityBadge } from './doctor-availability-badge';
import { useT } from './i18n/language-provider';
import { DoctorSlots } from './doctor-slots';
import type { Slot } from '@/lib/slots';
import { formatINR, formatTime12, formatSpecialty, formatDays } from '@/lib/utils';
import { StaggerGrid, StaggerGridItem } from '@/components/public/motion/scroll-reveal';
import type { Doctor } from '@/lib/types';

export function DoctorList({
  doctors,
  whatsappNumber,
  openDoctorId,
  openDate,
  openTime,
}: {
  doctors: Doctor[];
  whatsappNumber: string;
  /** From /doctors?book=<id>&date=&time= — opens that doctor prefilled. */
  openDoctorId?: string;
  openDate?: string;
  openTime?: string;
}) {
  const { dict } = useT();
  const [active, setActive] = React.useState<Doctor | null>(null);
  const [preset, setPreset] = React.useState<Slot | null>(null);

  React.useEffect(() => {
    if (!openDoctorId) return;
    const match = doctors.find((d) => d.id === openDoctorId);
    if (!match) return;
    setActive(match);
    if (openDate && openTime) {
      setPreset({ date: openDate, time: openTime, label: '' });
    }
  }, [openDoctorId, openDate, openTime, doctors]);

  if (doctors.length === 0) {
    return (
      <div className="card-soft p-12 text-center text-ink-muted">
        {dict.doctors.none}
      </div>
    );
  }

  return (
    <>
      <StaggerGrid inherit className="space-y-6 sm:space-y-7" stagger={0.08}>
        {doctors.map((d) => (
          <StaggerGridItem key={d.id}>
            <DoctorCard
              doctor={d}
              onBook={() => {
                setPreset(null);
                setActive(d);
              }}
              onPickSlot={(slot) => {
                setPreset(slot);
                setActive(d);
              }}
            />
          </StaggerGridItem>
        ))}
      </StaggerGrid>

      {active && (
        <AppointmentDialog
          doctor={active}
          open={!!active}
          onOpenChange={(v) => {
            if (!v) {
              setActive(null);
              setPreset(null);
            }
          }}
          presetSlot={preset}
          whatsappNumber={whatsappNumber}
        />
      )}
    </>
  );
}

function DoctorCard({
  doctor,
  onBook,
  onPickSlot,
}: {
  doctor: Doctor;
  onBook: () => void;
  onPickSlot: (slot: Slot) => void;
}) {
  const { dict } = useT();
  const specialty = formatSpecialty(doctor.specialty, dict);
  const photo = resolveDoctorPhoto(doctor.photo_url, doctor.name);

  return (
    <article className="card-soft tap-settle overflow-hidden">
      <div className="grid md:grid-cols-12">
        {/* Photo */}
        <div className="relative md:col-span-4 aspect-[4/3] md:aspect-auto md:min-h-[280px] bg-sand">
          <DoctorAvailabilityBadge doctor={doctor} />
          {photo && (
            <Image
              src={photo}
              alt={doctor.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          )}
        </div>

        {/* Info */}
        <div className="md:col-span-8 p-6 sm:p-8 flex flex-col">
          <span className="eyebrow eyebrow--teal">
            {doctor.is_on_request ? dict.doctors.byRequest : specialty}
          </span>
          <h2 className="mt-2 font-serif font-medium text-[clamp(1.5rem,2.5vw,1.75rem)] tracking-[-0.015em] leading-tight">
            {doctor.name}
          </h2>
          {doctor.qualifications?.trim() && (
            <p className="mt-1 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-ink-muted">
              {doctor.qualifications}
            </p>
          )}
          {doctor.bio && (
            <p className="mt-3 text-[1rem] text-ink-muted leading-[1.7] max-w-[60ch]">
              {doctor.bio}
            </p>
          )}

          {/* Schedule row */}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
            {doctor.is_on_request ? (
              <p className="text-ink-muted">
                {dict.doctors.onRequestNote}
              </p>
            ) : (
              <>
                {doctor.available_days.length > 0 && (
                  <p className="inline-flex items-center gap-2 text-ink-muted">
                    <Calendar className="h-4 w-4 text-plum/70" />
                    <span>
                      <span className="text-ink">{dict.doctors.days}</span> {formatDays(doctor.available_days, dict)}
                    </span>
                  </p>
                )}
                {doctor.available_time_start && doctor.available_time_end && (
                  <p className="inline-flex items-center gap-2 text-ink-muted">
                    <Clock className="h-4 w-4 text-plum/70" />
                    <span>
                      <span className="text-ink">{dict.doctors.time}</span>{' '}
                      {formatTime12(doctor.available_time_start)} –{' '}
                      {formatTime12(doctor.available_time_end)}
                    </span>
                  </p>
                )}
                {doctor.consultation_fee != null && (
                  <p className="inline-flex items-center gap-2 text-ink-muted">
                    <IndianRupee className="h-4 w-4 text-plum/70" />
                    <span>
                      <span className="text-ink">{dict.doctors.fee}</span> {formatINR(doctor.consultation_fee)}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>

          <DoctorSlots doctor={doctor} onPick={onPickSlot} />

          <div className="mt-4">
            <button onClick={onBook} className="btn-plum">
              {doctor.is_on_request ? dict.doctors.request : dict.doctors.book}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
