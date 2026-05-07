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
import { DOCTOR_SPECIALTIES, WEEKDAYS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Doctor, DoctorSpecialty } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  specialty: z.enum(['nadi', 'physiotherapy', 'homeopathy']),
  bio: z.string().optional(),
  consultation_fee: z.string().optional(),
  available_time_start: z.string().optional(),
  available_time_end: z.string().optional(),
  slot_duration_minutes: z.string().optional(),
  is_active: z.boolean(),
  is_on_request: z.boolean(),
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
        specialty: data.specialty,
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
              <ImageUpload value={photoUrl} onChange={setPhotoUrl} folder="doctors" />
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
                  onValueChange={(v) => setValue('specialty', v as DoctorSpecialty)}
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

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
    specialty: (d?.specialty as DoctorSpecialty) ?? 'nadi',
    bio: d?.bio ?? '',
    consultation_fee: d?.consultation_fee != null ? String(d.consultation_fee) : '',
    available_time_start: d?.available_time_start ?? '',
    available_time_end: d?.available_time_end ?? '',
    slot_duration_minutes: d?.slot_duration_minutes ? String(d.slot_duration_minutes) : '30',
    is_active: d?.is_active ?? true,
    is_on_request: d?.is_on_request ?? false,
  };
}
