'use client';

import * as React from 'react';
import { Magnetic } from '@/components/public/motion/magnetic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { BookingModal, FieldError } from './booking-modal';
import { submitAppointment } from '@/app/(public)/actions';
import {
  isValidPhoneIN,
  generateTimeSlots,
  formatTime12,
  dayOfWeek,
  whatsappLink,
  formatDate,
  formatSpecialty,
  formatDays,
  getDoctorAvailability,
} from '@/lib/utils';
import { WhatsAppGlyph } from './whatsapp-glyph';
import type { Doctor } from '@/lib/types';
import { useT } from './i18n/language-provider';

/** Error keys, resolved to the visitor's language at render time. */
const formSchema = z.object({
  patient_name: z.string().min(2, 'nameRequired'),
  patient_phone: z.string().refine(isValidPhoneIN, 'invalidPhone'),
  patient_age: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) > 0 && Number(v) < 120), 'invalidAge'),
  preferred_date: z.string().min(1, 'required'),
  preferred_time: z.string().min(1, 'required'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface Props {
  doctor: Doctor;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  whatsappNumber: string;
  /** Chosen from a suggested-time chip; prefills date and time. */
  presetSlot?: { date: string; time: string } | null;
}

export function AppointmentDialog({
  doctor,
  open,
  onOpenChange,
  whatsappNumber,
  presetSlot = null,
}: Props) {
  const { dict } = useT();
  const [submitting, setSubmitting] = React.useState(false);
  // Resolved after mount for the same reason as the card badge: "today" must
  // never be baked into a cached render.
  const [availability, setAvailability] = React.useState<ReturnType<
    typeof getDoctorAvailability
  > | null>(null);
  React.useEffect(() => {
    setAvailability(getDoctorAvailability(doctor, new Date(), dict));
  }, [doctor, dict]);
  const isOnRequest = doctor.is_on_request;
  const specialty = formatSpecialty(doctor.specialty, dict);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { preferred_date: '', preferred_time: '' },
  });

  const slots = React.useMemo(() => {
    if (!doctor.available_time_start || !doctor.available_time_end) return [];
    return generateTimeSlots(
      doctor.available_time_start,
      doctor.available_time_end,
      doctor.slot_duration_minutes ?? 30
    );
  }, [doctor]);

  const upcomingDates = React.useMemo(() => {
    const out: { value: string; label: string; disabled: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dow = dayOfWeek(d);
      const allowed = isOnRequest ? true : doctor.available_days.includes(dow);
      const iso = d.toISOString().slice(0, 10);
      out.push({
        value: iso,
        label: `${formatDate(d)} · ${dow}`,
        disabled: !allowed,
      });
    }
    return out;
  }, [doctor.available_days, isOnRequest]);

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  // A suggested-time chip wins over the default; otherwise start the picker on
  // today when the doctor genuinely consults today.
  React.useEffect(() => {
    if (!open) return;
    if (presetSlot) {
      setValue('preferred_date', presetSlot.date);
      setValue('preferred_time', presetSlot.time);
      return;
    }
    if (availability?.state !== 'today') return;
    const today = upcomingDates[0];
    if (today && !today.disabled) {
      setValue('preferred_date', today.value);
    }
  }, [open, presetSlot, availability, upcomingDates, setValue]);

  const submit = async (data: FormValues, andWhatsApp = false) => {
    setSubmitting(true);
    try {
      const res = await submitAppointment({
        doctor_id: doctor.id,
        patient_name: data.patient_name.trim(),
        patient_phone: data.patient_phone.trim(),
        patient_age: data.patient_age ? Number(data.patient_age) : null,
        preferred_date: data.preferred_date,
        preferred_time: data.preferred_time,
        notes: data.notes || null,
      });
      if (!res.ok) throw new Error(res.error);

      toast.success(dict.forms.successAppointment);

      if (andWhatsApp) {
        const msg = [
          `Appointment request — ${doctor.name}`,
          `${data.preferred_date} at ${formatTime12(data.preferred_time)}`,
          `Patient: ${data.patient_name}`,
          data.patient_age ? `Age: ${data.patient_age}` : '',
          data.notes ? `Notes: ${data.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        window.open(whatsappLink(whatsappNumber, msg), '_blank');
      }

      reset();
      onOpenChange(false);
    } catch {
      toast.error(dict.forms.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BookingModal
      open={open}
      onOpenChange={onOpenChange}
      eyebrow={isOnRequest ? dict.doctors.requestEyebrow : dict.doctors.bookEyebrow}
      title={doctor.name}
      subtitle={
        isOnRequest
          ? dict.doctors.onRequestNote
          : `${specialty} · ${formatDays(doctor.available_days, dict)}`
      }
    >
      {presetSlot && (
        <p className="mb-4 text-[0.875rem] text-ink-muted">{dict.doctors.suggestedNote}</p>
      )}
      {availability && availability.state !== 'on_request' && (
        <p
          className={
            availability.state === 'today'
              ? 'mb-4 text-[0.9375rem] font-medium text-teal-deep'
              : 'mb-4 text-[0.9375rem] text-ink-muted'
          }
        >
          {availability.state === 'today'
            ? `${dict.doctors.availableTodayAt}${availability.timeRange ? `, ${availability.timeRange}` : ''}`
            : `${dict.doctors.nextAvailable}: ${availability.day}`}
        </p>
      )}
      <form onSubmit={handleSubmit((d) => submit(d, false))} className="space-y-4">
        <div>
          <label htmlFor="ap-name" className="form-label">{dict.forms.name}</label>
          <input
            id="ap-name"
            autoComplete="name"
            placeholder={dict.forms.fullName}
            {...register('patient_name')}
            className="input-field"
          />
          <FieldError msg={errors.patient_name?.message} dict={dict} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ap-phone" className="form-label">{dict.forms.phone}</label>
            <input
              id="ap-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={dict.forms.phonePlaceholder}
              {...register('patient_phone')}
              className="input-field"
            />
            <FieldError msg={errors.patient_phone?.message} dict={dict} />
          </div>
          <div>
            <label htmlFor="ap-age" className="form-label">{dict.forms.age}</label>
            <input
              id="ap-age"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              placeholder={dict.forms.agePlaceholder}
              {...register('patient_age')}
              className="input-field"
            />
            <FieldError msg={errors.patient_age?.message} dict={dict} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="ap-date" className="form-label">{dict.forms.date}</label>
            <select id="ap-date" {...register('preferred_date')} className="input-field">
              <option value="">{dict.forms.pickDate}</option>
              {upcomingDates.map((d) => (
                <option key={d.value} value={d.value} disabled={d.disabled}>
                  {d.label}
                  {d.disabled ? ` — ${dict.forms.unavailable}` : ''}
                </option>
              ))}
            </select>
            <FieldError msg={errors.preferred_date?.message} dict={dict} />
          </div>
          <div>
            <label htmlFor="ap-time" className="form-label">{dict.forms.time}</label>
            <select id="ap-time" {...register('preferred_time')} className="input-field">
              <option value="">{dict.forms.pickTime}</option>
              {(slots.length > 0
                ? slots
                : ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00']
              ).map((s) => (
                <option key={s} value={s}>
                  {formatTime12(s)}
                </option>
              ))}
            </select>
            <FieldError msg={errors.preferred_time?.message} dict={dict} />
          </div>
        </div>

        <div>
          <label htmlFor="ap-notes" className="form-label">{dict.forms.notes}</label>
          <textarea
            id="ap-notes"
            rows={3}
            placeholder={dict.forms.notesPlaceholder}
            {...register('notes')}
            className="input-field"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-line">
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit((d) => submit(d, true))}
            className="btn-plum-outline sm:flex-1"
          >
            <WhatsAppGlyph className="h-4 w-4" />
            Send & WhatsApp
          </button>
          <Magnetic className="sm:flex-1">
          <button type="submit" disabled={submitting} className="btn-plum w-full">
            {submitting
              ? dict.forms.sending
              : isOnRequest
                ? dict.doctors.request
                : dict.doctors.book}
          </button>
          </Magnetic>
        </div>
      </form>
    </BookingModal>
  );
}
