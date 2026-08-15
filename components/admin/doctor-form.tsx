'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from './image-upload';
import { ASPECT } from '@/lib/image-crop';
import { DOCTOR_SPECIALTIES, WEEKDAYS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Doctor } from '@/lib/types';

/** Sentinel for the dropdown's "Other…" row — never stored in the database. */
const OTHER = '__other__';
const CUSTOM_MAX = 40;

const KNOWN_SPECIALTIES: string[] = DOCTOR_SPECIALTIES.map((s) => s.value);

const formSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    // Free text now — either a built-in value or the OTHER sentinel.
    specialty: z.string().min(1, 'Pick a specialty'),
    specialty_custom: z.string().max(CUSTOM_MAX, 'Keep it under 40 characters').optional(),
    bio: z.string().optional(),
    consultation_fee: z.string().optional(),
    available_time_start: z.string().optional(),
    available_time_end: z.string().optional(),
    slot_duration_minutes: z.string().optional(),
    is_active: z.boolean(),
    is_on_request: z.boolean(),
  })
  // "Other…" is only a valid choice once it has been named.
  .refine((v) => v.specialty !== OTHER || !!v.specialty_custom?.trim(), {
    path: ['specialty_custom'],
    message: 'Enter the specialty name',
  });
type FormValues = z.infer<typeof formSchema>;

export function DoctorForm({
  doctor,
  open,
  onOpenChange,
}: {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(doctor?.photo_url ?? null);
  const [days, setDays] = React.useState<string[]>(doctor?.available_days ?? []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(doctor),
  });

  React.useEffect(() => {
    if (open) {
      reset(defaults(doctor));
      setPhotoUrl(doctor?.photo_url ?? null);
      setDays(doctor?.available_days ?? []);
    }
  }, [open, doctor, reset]);

  const toggleDay = (d: string) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload: any = {
        name: data.name.trim(),
        // Built-ins keep their lowercase values for backward compatibility;
        // "Other…" stores exactly what the admin typed.
        specialty:
          data.specialty === OTHER
            ? (data.specialty_custom ?? '').trim()
            : data.specialty,
        bio: data.bio?.trim() || null,
        photo_url: photoUrl,
        consultation_fee: data.consultation_fee ? Number(data.consultation_fee) : null,
        available_days: days,
        available_time_start: data.available_time_start || null,
        available_time_end: data.available_time_end || null,
        slot_duration_minutes: data.slot_duration_minutes
          ? Number(data.slot_duration_minutes)
          : 30,
        is_active: data.is_active,
        is_on_request: data.is_on_request,
      };
      if (doctor) {
        const { error } = await supabase.from('doctors').update(payload).eq('id', doctor.id);
        if (error) throw error;
        toast.success('Doctor updated.');
      } else {
        const { error } = await supabase.from('doctors').insert(payload);
        if (error) throw error;
        toast.success('Doctor added.');
      }
      router.refresh();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error('Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Edit doctor' : 'Add doctor'}</DialogTitle>
          <DialogDescription>
            Set the doctor&apos;s details and the days/times they&apos;re available.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label>Photo</Label>
            <div className="mt-1.5">
              <ImageUpload
                value={photoUrl}
                onChange={setPhotoUrl}
                folder="doctors"
                aspectRatio={ASPECT.doctorPhoto}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Dr. Ramesh Iyer"
                {...register('name')}
                className={cn('mt-1.5', errors.name && 'border-destructive')}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label>Specialty</Label>
              <div className="mt-1.5">
                <Select
                  value={watch('specialty')}
                  onValueChange={(v) => setValue('specialty', v, { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCTOR_SPECIALTIES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER}>Other…</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {watch('specialty') === OTHER && (
            <div>
              <Label htmlFor="specialty-custom">Specialty name</Label>
              <Input
                id="specialty-custom"
                maxLength={CUSTOM_MAX}
                placeholder="e.g., Dermatology, Ayurveda, General Physician"
                {...register('specialty_custom')}
                className={cn('mt-1.5', errors.specialty_custom && 'border-destructive')}
              />
              <p className="mt-1 text-xs text-brand-muted">
                Shown to customers exactly as you type it.
              </p>
              {errors.specialty_custom && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.specialty_custom.message}
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Short bio for the doctor card."
              {...register('bio')}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="consultation_fee">Consultation fee (₹)</Label>
            <Input
              id="consultation_fee"
              type="number"
              min={0}
              placeholder="e.g. 500"
              {...register('consultation_fee')}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-brand-muted">
              Leave blank if not applicable.
            </p>
          </div>

          <div>
            <Label>Available days</Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WEEKDAYS.map((d) => (
                <label
                  key={d.value}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer',
                    days.includes(d.value)
                      ? 'border-brand-purple bg-brand-purple/5'
                      : 'border-brand-line bg-white hover:bg-brand-cream-warm'
                  )}
                >
                  <Checkbox
                    checked={days.includes(d.value)}
                    onCheckedChange={() => toggleDay(d.value)}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="available_time_start">Start time</Label>
              <Input
                id="available_time_start"
                type="time"
                {...register('available_time_start')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="available_time_end">End time</Label>
              <Input
                id="available_time_end"
                type="time"
                {...register('available_time_end')}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="slot_duration_minutes">Slot length (mins)</Label>
              <Input
                id="slot_duration_minutes"
                type="number"
                min={5}
                placeholder="30"
                {...register('slot_duration_minutes')}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-brand-muted">Show this doctor on the website.</p>
              </div>
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(v) => setValue('is_active', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
              <div>
                <Label>Available on request only</Label>
                <p className="text-xs text-brand-muted">
                  Hides days/times. Customers send a request and you arrange the slot.
                </p>
              </div>
              <Switch
                checked={watch('is_on_request')}
                onCheckedChange={(v) => setValue('is_on_request', v)}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : doctor ? 'Save changes' : 'Add doctor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(d: Doctor | null): FormValues {
  return {
    name: d?.name ?? '',
    // A stored value outside the built-in three means this doctor has a custom
    // specialty — reopen the form on "Other…" with the text already filled in.
    specialty: d
      ? KNOWN_SPECIALTIES.includes(d.specialty)
        ? d.specialty
        : OTHER
      : 'nadi',
    specialty_custom:
      d && !KNOWN_SPECIALTIES.includes(d.specialty) ? d.specialty : '',
    bio: d?.bio ?? '',
    consultation_fee: d?.consultation_fee != null ? String(d.consultation_fee) : '',
    available_time_start: d?.available_time_start ?? '',
    available_time_end: d?.available_time_end ?? '',
    slot_duration_minutes: d?.slot_duration_minutes ? String(d.slot_duration_minutes) : '30',
    is_active: d?.is_active ?? true,
    is_on_request: d?.is_on_request ?? false,
  };
}
