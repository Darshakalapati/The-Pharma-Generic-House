'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { BookingModal, FieldError } from './booking-modal';
import { createClient } from '@/lib/supabase/client';
import {
  isValidPhoneIN,
  generateTimeSlots,
  formatTime12,
  dayOfWeek,
  whatsappLink,
  formatDate,
  formatSpecialty,
} from '@/lib/utils';
import { WhatsAppGlyph } from './whatsapp-glyph';
import type { Doctor } from '@/lib/types';

const formSchema = z.object({
  patient_name: z.string().min(2, 'Please enter your full name'),
  patient_phone: z.string().refine(isValidPhoneIN, 'Please enter a valid Indian phone number'),
  patient_age: z
    .string()
    .optional()
    .refine((v) => !v || (Number(v) > 0 && Number(v) < 120), 'Enter a valid age'),
  preferred_date: z.string().min(1, 'Please pick a date'),
  preferred_time: z.string().min(1, 'Please pick a time'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface Props {
  doctor: Doctor;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  whatsappNumber: string;
}

export function AppointmentDialog({ doctor, open, onOpenChange, whatsappNumber }: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const isOnRequest = doctor.is_on_request;
  const specialty = formatSpecialty(doctor.specialty);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  const submit = async (data: FormValues, andWhatsApp = false) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('appointments').insert({
        doctor_id: doctor.id,
        patient_name: data.patient_name.trim(),
        patient_phone: data.patient_phone.trim(),
        patient_age: data.patient_age ? Number(data.patient_age) : null,
        preferred_date: data.preferred_date,
        preferred_time: data.preferred_time,
        notes: data.notes || null,
        status: 'pending',
      });
      if (error) throw error;

      toast.success("Appointment requested. We'll confirm on WhatsApp shortly.");

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
      toast.error('Could not send. Please try again or WhatsApp us.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BookingModal
      open={open}
      onOpenChange={onOpenChange}
      eyebrow={isOnRequest ? 'Request appointment' : 'Book appointment'}
      title={doctor.name}
      subtitle={
        isOnRequest
          ? "Available on request — we'll confirm a time."
          : `${specialty} · ${doctor.available_days.join(', ')}`
      }
    >
      <form onSubmit={handleSubmit((d) => submit(d, false))} className="space-y-4">
        <div>
          <label htmlFor="ap-name" className="form-label">Patient name</label>
          <input
            id="ap-name"
            autoComplete="name"
            placeholder="Full name"
            {...register('patient_name')}
            className="input-field"
          />
          <FieldError msg={errors.patient_name?.message} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ap-phone" className="form-label">Phone</label>
            <input
              id="ap-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="10-digit mobile"
              {...register('patient_phone')}
              className="input-field"
            />
            <FieldError msg={errors.patient_phone?.message} />
          </div>
          <div>
            <label htmlFor="ap-age" className="form-label">Age (optional)</label>
            <input
              id="ap-age"
              type="number"
              inputMode="numeric"
              min={1}
              max={120}
              placeholder="e.g. 42"
              {...register('patient_age')}
              className="input-field"
            />
            <FieldError msg={errors.patient_age?.message} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="ap-date" className="form-label">Preferred date</label>
            <select id="ap-date" {...register('preferred_date')} className="input-field">
              <option value="">Pick a date</option>
              {upcomingDates.map((d) => (
                <option key={d.value} value={d.value} disabled={d.disabled}>
                  {d.label}
                  {d.disabled ? ' — unavailable' : ''}
                </option>
              ))}
            </select>
            <FieldError msg={errors.preferred_date?.message} />
          </div>
          <div>
            <label htmlFor="ap-time" className="form-label">Preferred time</label>
            <select id="ap-time" {...register('preferred_time')} className="input-field">
              <option value="">Pick a time</option>
              {(slots.length > 0
                ? slots
                : ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00']
              ).map((s) => (
                <option key={s} value={s}>
                  {formatTime12(s)}
                </option>
              ))}
            </select>
            <FieldError msg={errors.preferred_time?.message} />
          </div>
        </div>

        <div>
          <label htmlFor="ap-notes" className="form-label">Notes (optional)</label>
          <textarea
            id="ap-notes"
            rows={3}
            placeholder="Anything you'd like the doctor to know"
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
          <button type="submit" disabled={submitting} className="btn-plum sm:flex-1">
            {submitting
              ? 'Sending...'
              : isOnRequest
                ? 'Send Request'
                : 'Book Appointment'}
          </button>
        </div>
      </form>
    </BookingModal>
  );
}
