'use client';

import * as React from 'react';
import Image from 'next/image';
import { Calendar, Clock, IndianRupee, ArrowRight } from 'lucide-react';
import { AppointmentDialog } from './appointment-dialog';
import { resolveDoctorPhoto } from '@/lib/images';
import { formatINR, formatTime12, formatSpecialty } from '@/lib/utils';
import { StaggerGrid, StaggerGridItem } from '@/components/public/motion/scroll-reveal';
import type { Doctor } from '@/lib/types';

export function DoctorList({
  doctors,
  whatsappNumber,
}: {
  doctors: Doctor[];
  whatsappNumber: string;
}) {
  const [active, setActive] = React.useState<Doctor | null>(null);

  if (doctors.length === 0) {
    return (
      <div className="card-soft p-12 text-center text-ink-muted">
        No doctors are listed at the moment.
      </div>
    );
  }

  return (
    <>
      <StaggerGrid inherit className="space-y-6 sm:space-y-7" stagger={0.08}>
        {doctors.map((d) => (
          <StaggerGridItem key={d.id}>
            <DoctorCard doctor={d} onBook={() => setActive(d)} />
          </StaggerGridItem>
        ))}
      </StaggerGrid>

      {active && (
        <AppointmentDialog
          doctor={active}
          open={!!active}
          onOpenChange={(v) => !v && setActive(null)}
          whatsappNumber={whatsappNumber}
        />
      )}
    </>
  );
}

function DoctorCard({ doctor, onBook }: { doctor: Doctor; onBook: () => void }) {
  const specialty = formatSpecialty(doctor.specialty);
  const photo = resolveDoctorPhoto(doctor.photo_url, doctor.name);

  return (
    <article className="card-soft tap-settle overflow-hidden">
      <div className="grid md:grid-cols-12">
        {/* Photo */}
        <div className="relative md:col-span-4 aspect-[4/3] md:aspect-auto md:min-h-[280px] bg-sand">
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
            {doctor.is_on_request ? 'By Request' : specialty}
          </span>
          <h2 className="mt-2 font-serif font-medium text-[clamp(1.5rem,2.5vw,1.75rem)] tracking-[-0.015em] leading-tight">
            {doctor.name}
          </h2>
          {doctor.bio && (
            <p className="mt-3 text-[1rem] text-ink-muted leading-[1.7] max-w-[60ch]">
              {doctor.bio}
            </p>
          )}

          {/* Schedule row */}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[0.9375rem]">
            {doctor.is_on_request ? (
              <p className="text-ink-muted">
                Available on request — we&apos;ll confirm a time.
              </p>
            ) : (
              <>
                {doctor.available_days.length > 0 && (
                  <p className="inline-flex items-center gap-2 text-ink-muted">
                    <Calendar className="h-4 w-4 text-plum/70" />
                    <span>
                      <span className="text-ink">Days:</span> {doctor.available_days.join(', ')}
                    </span>
                  </p>
                )}
                {doctor.available_time_start && doctor.available_time_end && (
                  <p className="inline-flex items-center gap-2 text-ink-muted">
                    <Clock className="h-4 w-4 text-plum/70" />
                    <span>
                      <span className="text-ink">Time:</span>{' '}
                      {formatTime12(doctor.available_time_start)} –{' '}
                      {formatTime12(doctor.available_time_end)}
                    </span>
                  </p>
                )}
                {doctor.consultation_fee != null && (
                  <p className="inline-flex items-center gap-2 text-ink-muted">
                    <IndianRupee className="h-4 w-4 text-plum/70" />
                    <span>
                      <span className="text-ink">Fee:</span> {formatINR(doctor.consultation_fee)}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>

          <div className="mt-6">
            <button onClick={onBook} className="btn-plum">
              {doctor.is_on_request ? 'Request Appointment' : 'Book Appointment'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
