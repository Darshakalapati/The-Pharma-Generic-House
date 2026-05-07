'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/lib/supabase/client';
import type { ShopSettings } from '@/lib/types';

const formSchema = z.object({
  shop_phone: z.string().min(1, 'Required'),
  shop_whatsapp: z.string().min(1, 'Required'),
  shop_address: z.string().min(1, 'Required'),
  shop_hours: z.string().min(1, 'Required'),
});
type FormValues = z.infer<typeof formSchema>;

export function SettingsForm({ settings }: { settings: ShopSettings }) {
  const router = useRouter();
  const [reservationOn, setReservationOn] = React.useState(settings.reservation_pickup_enabled);
  const [savingFlag, setSavingFlag] = React.useState(false);
  const [savingShop, setSavingShop] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shop_phone: settings.shop_phone,
      shop_whatsapp: settings.shop_whatsapp,
      shop_address: settings.shop_address,
      shop_hours: settings.shop_hours,
    },
  });

  const upsert = async (key: string, value: any) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
  };

  const toggleReservation = async (v: boolean) => {
    setReservationOn(v);
    setSavingFlag(true);
    try {
      await upsert('reservation_pickup_enabled', v);
      toast.success(v ? 'Reservation for pickup is now ON.' : 'Reservation for pickup is now OFF.');
      router.refresh();
    } catch (e: any) {
      toast.error('Could not save.');
      setReservationOn(!v);
    } finally {
      setSavingFlag(false);
    }
  };

  const submit = async (data: FormValues) => {
    setSavingShop(true);
    try {
      await Promise.all([
        upsert('shop_phone', data.shop_phone.trim()),
        upsert('shop_whatsapp', data.shop_whatsapp.trim()),
        upsert('shop_address', data.shop_address.trim()),
        upsert('shop_hours', data.shop_hours.trim()),
      ]);
      toast.success('Shop info updated.');
      router.refresh();
    } catch (e: any) {
      toast.error('Could not save.');
    } finally {
      setSavingShop(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Reservation toggle */}
      <section className="surface-card p-6">
        <h2 className="font-serif text-xl font-semibold">Customer features</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Toggle features that customers can use on the website.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-brand-line bg-brand-cream/40 p-4">
          <div className="max-w-xl">
            <Label className="text-base">Enable Reservation for Pickup</Label>
            <p className="mt-1 text-sm text-brand-muted">
              When ON, customers will see a &quot;Reserve for Pickup&quot; button on the
              products page in addition to WhatsApp and Enquiry. Reserved enquiries are
              tagged so you can spot them.
            </p>
          </div>
          <Switch
            checked={reservationOn}
            onCheckedChange={toggleReservation}
            disabled={savingFlag}
          />
        </div>
      </section>

      {/* Shop info */}
      <section className="surface-card p-6">
        <h2 className="font-serif text-xl font-semibold">Shop information</h2>
        <p className="mt-1 text-sm text-brand-muted">
          These appear in the website footer, contact page, and WhatsApp links.
        </p>

        <form onSubmit={handleSubmit(submit)} className="mt-5 space-y-4">
          <div>
            <Label htmlFor="shop_phone">Phone number (display)</Label>
            <Input
              id="shop_phone"
              placeholder="+91-XXXXXXXXXX"
              {...register('shop_phone')}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-brand-muted">
              How it&apos;s shown to customers. Include &quot;+91&quot; for clarity.
            </p>
            {errors.shop_phone && (
              <p className="mt-1 text-xs text-destructive">{errors.shop_phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="shop_whatsapp">WhatsApp number</Label>
            <Input
              id="shop_whatsapp"
              placeholder="91XXXXXXXXXX"
              {...register('shop_whatsapp')}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-brand-muted">
              Used in WhatsApp links. Format: country code + number, no plus or spaces. e.g.
              91XXXXXXXXXX.
            </p>
            {errors.shop_whatsapp && (
              <p className="mt-1 text-xs text-destructive">{errors.shop_whatsapp.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="shop_address">Address</Label>
            <Input
              id="shop_address"
              placeholder="Street, city, pincode"
              {...register('shop_address')}
              className="mt-1.5"
            />
            {errors.shop_address && (
              <p className="mt-1 text-xs text-destructive">{errors.shop_address.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="shop_hours">Shop hours</Label>
            <Input
              id="shop_hours"
              placeholder="Mon–Sat: 9 AM – 9 PM, Sun: 10 AM – 6 PM"
              {...register('shop_hours')}
              className="mt-1.5"
            />
            {errors.shop_hours && (
              <p className="mt-1 text-xs text-destructive">{errors.shop_hours.message}</p>
            )}
          </div>

          <Button type="submit" disabled={savingShop}>
            <Save className="h-4 w-4" />
            {savingShop ? 'Saving...' : 'Save shop info'}
          </Button>
        </form>
      </section>
    </div>
  );
}
