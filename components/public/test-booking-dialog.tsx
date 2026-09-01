'use client';

import * as React from 'react';
import { Magnetic } from '@/components/public/motion/magnetic';
import { useT } from './i18n/language-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Store, Home } from 'lucide-react';
import { BookingModal, FieldError } from './booking-modal';
import { createClient } from '@/lib/supabase/client';
import { isValidPhoneIN, formatDate, dayOfWeek, cn, formatINR } from '@/lib/utils';
import type { MedicalTest } from '@/lib/types';

const formSchema = z.object({
  patient_name: z.string().min(2, 'nameRequired'),
  patient_phone: z.string().refine(isValidPhoneIN, 'invalidPhone'),
  patient_address: z.string().optional(),
  preferred_date: z.string().min(1, 'required'),
  collection_type: z.enum(['shop', 'home']),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function TestBookingDialog({
  test,
  open,
  onOpenChange,
}: {
  test: MedicalTest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { dict } = useT();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { collection_type: 'shop' },
  });

  React.useEffect(() => {
    if (!open) reset({ collection_type: 'shop' });
  }, [open, reset]);

  const collectionType = watch('collection_type');

  const dates = React.useMemo(() => {
    const out: { value: string; label: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dow = dayOfWeek(d);
      out.push({
        value: d.toISOString().slice(0, 10),
        label: `${formatDate(d)}${dow === 'Sun' ? ' · Test Day' : ''}`,
      });
    }
    return out;
  }, []);

  const submit = async (data: FormValues) => {
    if (!test) return;
    if (data.collection_type === 'home' && !data.patient_address?.trim()) {
      toast.error(dict.forms.addressRequired);
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('test_bookings').insert({
        test_id: test.id,
        patient_name: data.patient_name.trim(),
        patient_phone: data.patient_phone.trim(),
        patient_address: data.patient_address?.trim() || null,
        preferred_date: data.preferred_date,
        collection_type: data.collection_type,
        status: 'pending',
        notes: data.notes || null,
      });
      if (error) throw error;
      toast.success("Test booking received. We'll confirm by WhatsApp.");
      reset();
      onOpenChange(false);
    } catch {
      toast.error(dict.forms.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  if (!test) return null;

  return (
    <BookingModal
      open={open}
      onOpenChange={onOpenChange}
      eyebrow="Book a test"
      title={test.name}
      subtitle={test.price != null && test.price > 0 ? formatINR(test.price) : 'Walk-in'}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {/* Collection toggle */}
        <div>
          <label className="form-label">{dict.forms.whereCollect}</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue('collection_type', 'shop')}
              className={cn(
                'inline-flex items-center justify-center gap-2 h-11 rounded-md border text-[0.9375rem] font-medium transition-all',
                collectionType === 'shop'
                  ? 'bg-plum text-white border-plum'
                  : 'bg-bg-elevated text-ink border-line hover:border-plum hover:text-plum'
              )}
            >
              <Store className="h-4 w-4" />
              At the shop
            </button>
            <button
              type="button"
              onClick={() => setValue('collection_type', 'home')}
              className={cn(
                'inline-flex items-center justify-center gap-2 h-11 rounded-md border text-[0.9375rem] font-medium transition-all',
                collectionType === 'home'
                  ? 'bg-plum text-white border-plum'
                  : 'bg-bg-elevated text-ink border-line hover:border-plum hover:text-plum'
              )}
            >
              <Home className="h-4 w-4" />
              Home collection
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="tb-name" className="form-label">{dict.forms.fullName}</label>
          <input
            id="tb-name"
            autoComplete="name"
            placeholder={dict.forms.fullName}
            {...register('patient_name')}
            className="input-field"
          />
          <FieldError msg={errors.patient_name?.message} dict={dict} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="tb-phone" className="form-label">{dict.forms.phone}</label>
            <input
              id="tb-phone"
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
            <label htmlFor="tb-date" className="form-label">{dict.forms.date}</label>
            <select id="tb-date" {...register('preferred_date')} className="input-field">
              <option value="">{dict.forms.pickDate}</option>
              {dates.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <FieldError msg={errors.preferred_date?.message} dict={dict} />
          </div>
        </div>

        {collectionType === 'home' && (
          <div>
            <label htmlFor="tb-address" className="form-label">{dict.forms.homeAddress}</label>
            <textarea
              id="tb-address"
              rows={2}
              placeholder={dict.forms.addressPlaceholder}
              {...register('patient_address')}
              className="input-field"
            />
          </div>
        )}

        <div>
          <label htmlFor="tb-notes" className="form-label">{dict.forms.notes}</label>
          <textarea
            id="tb-notes"
            rows={2}
            placeholder={dict.forms.notesPlaceholder}
            {...register('notes')}
            className="input-field"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-line">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="btn-plum-outline sm:flex-1"
          >
            Cancel
          </button>
          <Magnetic className="sm:flex-1">
          <button type="submit" disabled={submitting} className="btn-plum w-full">
            {submitting ? dict.forms.sending : dict.diagnostics.bookTest}
          </button>
          </Magnetic>
        </div>
      </form>
    </BookingModal>
  );
}
