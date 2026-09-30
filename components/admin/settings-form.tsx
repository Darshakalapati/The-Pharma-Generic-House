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
import { ImageUpload } from './image-upload';
import { GoogleRatingPill } from '@/components/public/google-rating';
import { resolveContrast } from '@/lib/contrast';
// Imported straight from the dictionary modules: lib/i18n pulls in
// next/headers, which a client component cannot touch.
import { en as EN_DICT } from '@/lib/i18n/dictionaries/en';
import { te as TE_DICT } from '@/lib/i18n/dictionaries/te';
import type { Locale } from '@/lib/i18n/types';
import { ASPECT } from '@/lib/image-crop';
import {
  DAY_ORDER,
  SHOP_HOURS_SCHEDULE,
  formatHoursSummary,
  type DayKey,
  type Schedule,
} from '@/lib/hours';
import type { ShopSettings } from '@/lib/types';

/** Placeholders, so the admin can see the wording they'd be replacing. */
const EN_DEFAULTS = EN_DICT.contrast;
const TE_DEFAULTS = TE_DICT.contrast;

const DAY_LABEL: Record<DayKey, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

const formSchema = z.object({
  shop_phone: z.string().min(1, 'Required'),
  shop_whatsapp: z.string().min(1, 'Required'),
  shop_address: z.string().min(1, 'Required'),
});
type FormValues = z.infer<typeof formSchema>;

export function SettingsForm({
  settings,
  schedule: initialSchedule,
}: {
  settings: ShopSettings;
  schedule: Schedule;
}) {
  const router = useRouter();
  const [reservationOn, setReservationOn] = React.useState(settings.reservation_pickup_enabled);
  const [savingFlag, setSavingFlag] = React.useState(false);
  const [savingShop, setSavingShop] = React.useState(false);
  const [schedule, setSchedule] = React.useState<Schedule>(initialSchedule ?? SHOP_HOURS_SCHEDULE);
  const [savingHours, setSavingHours] = React.useState(false);
  const [diagnosticsPhoto, setDiagnosticsPhoto] = React.useState<string | null>(
    settings.diagnostics_photo_url || null
  );
  const [aboutPhoto, setAboutPhoto] = React.useState<string | null>(
    settings.about_photo_url || null
  );
  const [savingPhotos, setSavingPhotos] = React.useState(false);
  const [googleRating, setGoogleRating] = React.useState(
    settings.google_rating != null ? String(settings.google_rating) : ''
  );
  const [googleCount, setGoogleCount] = React.useState(
    settings.google_review_count != null ? String(settings.google_review_count) : ''
  );
  const [savingGoogle, setSavingGoogle] = React.useState(false);
  const [replyNote, setReplyNote] = React.useState(settings.whatsapp_reply_note ?? '');
  const [savingNote, setSavingNote] = React.useState(false);
  const [contrast, setContrast] = React.useState({
    line1_en: settings.contrast_line1_en ?? '',
    line2_en: settings.contrast_line2_en ?? '',
    line1_te: settings.contrast_line1_te ?? '',
    line2_te: settings.contrast_line2_te ?? '',
  });
  const [savingContrast, setSavingContrast] = React.useState(false);

  const parsedRating = googleRating.trim() === '' ? null : Number(googleRating);
  const parsedCount = googleCount.trim() === '' ? null : Number(googleCount);

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
    },
  });

  const saveHours = async () => {
    setSavingHours(true);
    try {
      await upsert('shop_hours_schedule', schedule);
      toast.success('Opening hours saved.');
      router.refresh();
    } catch {
      toast.error('Could not save hours. Have you run migration 0014 in Supabase?');
    } finally {
      setSavingHours(false);
    }
  };

  const saveWhatsapp = async () => {
    setSavingNote(true);
    try {
      await upsert('whatsapp_reply_note', replyNote.trim());
      toast.success('WhatsApp note saved.');
      router.refresh();
    } catch {
      toast.error('Could not save. Have you run migration 0016 in Supabase?');
    } finally {
      setSavingNote(false);
    }
  };

  const saveGoogle = async () => {
    if (parsedRating !== null && (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5)) {
      toast.error('Rating must be between 1 and 5.');
      return;
    }
    if (parsedCount !== null && (!Number.isFinite(parsedCount) || parsedCount < 0)) {
      toast.error('Number of reviews must be a positive whole number.');
      return;
    }
    setSavingGoogle(true);
    try {
      await upsert('google_rating', parsedRating);
      await upsert('google_review_count', parsedCount === null ? null : Math.round(parsedCount));
      toast.success('Google rating saved.');
      router.refresh();
    } catch {
      toast.error('Could not save. Have you run migration 0015 in Supabase?');
    } finally {
      setSavingGoogle(false);
    }
  };

  const saveContrast = async () => {
    setSavingContrast(true);
    try {
      await Promise.all([
        upsert('contrast_line1_en', contrast.line1_en.trim()),
        upsert('contrast_line2_en', contrast.line2_en.trim()),
        upsert('contrast_line1_te', contrast.line1_te.trim()),
        upsert('contrast_line2_te', contrast.line2_te.trim()),
      ]);
      toast.success('Highlight statement saved.');
      router.refresh();
    } catch {
      toast.error('Could not save. Have you run migration 0018 in Supabase?');
    } finally {
      setSavingContrast(false);
    }
  };

  const savePhotos = async () => {
    setSavingPhotos(true);
    try {
      await upsert('diagnostics_photo_url', diagnosticsPhoto ?? '');
      await upsert('about_photo_url', aboutPhoto ?? '');
      toast.success('Site photos saved.');
      router.refresh();
    } catch {
      toast.error('Could not save photos.');
    } finally {
      setSavingPhotos(false);
    }
  };

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

          <Button type="submit" disabled={savingShop}>
            <Save className="h-4 w-4" />
            {savingShop ? 'Saving...' : 'Save shop info'}
          </Button>
        </form>
      </section>

      {/* Opening hours — the single source every public hours string reads. */}
      <section className="surface-card p-6 sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-brand-ink">Opening hours</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Every hours line on the website — the trust bar, footer, contact page and the
          live &ldquo;Open now&rdquo; badge — is generated from this one schedule.
        </p>

        <div className="mt-5 divide-y divide-brand-line border-y border-brand-line">
          {DAY_ORDER.map((key) => {
            const day = schedule[key];
            const closed = day?.closed === true;
            return (
              <div
                key={key}
                className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="w-28 shrink-0 text-sm font-medium text-brand-ink">
                  {DAY_LABEL[key]}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="time"
                    aria-label={`${DAY_LABEL[key]} opening time`}
                    value={day?.open ?? '09:00'}
                    disabled={closed}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], open: e.target.value, closed: false },
                      }))
                    }
                    className="w-32"
                  />
                  <span className="text-brand-muted text-sm">to</span>
                  <Input
                    type="time"
                    aria-label={`${DAY_LABEL[key]} closing time`}
                    value={day?.close ?? '22:00'}
                    disabled={closed}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], close: e.target.value, closed: false },
                      }))
                    }
                    className="w-32"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-brand-muted sm:ml-auto">
                  Closed
                  <Switch
                    checked={closed}
                    onCheckedChange={(v) =>
                      setSchedule((prev) => ({
                        ...prev,
                        [key]: v
                          ? { closed: true }
                          : { open: prev[key]?.open ?? '09:00', close: prev[key]?.close ?? '22:00' },
                      }))
                    }
                  />
                </label>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-brand-muted">
          Customers will see: <span className="text-brand-ink">{formatHoursSummary(schedule)}</span>
        </p>

        <Button className="mt-5" disabled={savingHours} onClick={saveHours}>
          <Save className="h-4 w-4" />
          {savingHours ? 'Saving...' : 'Save opening hours'}
        </Button>
      </section>

      {/* Admin-managed photos for the two remaining stock-image sections. */}
      <section className="surface-card p-6 sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-brand-ink">Site photos</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Replace the stock photography on the home page with your own. Leave a slot empty
          to keep the built-in image.
        </p>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <div>
            <Label>Diagnostics section photo</Label>
            <p className="mt-1 mb-2 text-xs text-brand-muted">
              e.g., the ThyroCare sample collection setup
            </p>
            <ImageUpload
              value={diagnosticsPhoto}
              onChange={setDiagnosticsPhoto}
              folder="site"
              bucket="site-photos"
              pathLayout="flat"
              aspectRatio={4 / 3}
              previewClassName="w-44"
            />
          </div>
          <div>
            <Label>About section photo</Label>
            <p className="mt-1 mb-2 text-xs text-brand-muted">e.g., your shop interior</p>
            <ImageUpload
              value={aboutPhoto}
              onChange={setAboutPhoto}
              folder="site"
              bucket="site-photos"
              pathLayout="flat"
              aspectRatio={4 / 3}
              previewClassName="w-44"
            />
          </div>
        </div>

        <Button className="mt-5" disabled={savingPhotos} onClick={savePhotos}>
          <Save className="h-4 w-4" />
          {savingPhotos ? 'Saving...' : 'Save site photos'}
        </Button>
      </section>

      {/* WhatsApp helper note. */}
      <section className="surface-card p-6 sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-brand-ink">WhatsApp</h2>
        <p className="mt-1 text-sm text-brand-muted">
          The reassurance line shown in the WhatsApp helper card on the website.
        </p>
        <div className="mt-5">
          <Label htmlFor="wa_note">Reply note</Label>
          <Input
            id="wa_note"
            placeholder="We usually reply within 15 minutes."
            value={replyNote}
            onChange={(e) => setReplyNote(e.target.value)}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-brand-muted">
            Leave blank to use the built-in wording, which is translated. Anything you
            type here is shown as-is in both languages.
          </p>
        </div>
        <Button className="mt-5" disabled={savingNote} onClick={saveWhatsapp}>
          <Save className="h-4 w-4" />
          {savingNote ? 'Saving...' : 'Save WhatsApp note'}
        </Button>
      </section>

      {/* Google rating — display-only figures copied from the Business Profile. */}
      <section className="surface-card p-6 sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-brand-ink">Google rating</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Copy these from your Google Business Profile. Update every month or two —
          customers trust current numbers.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="google_rating">Rating</Label>
            <Input
              id="google_rating"
              type="number"
              step="0.1"
              min={1}
              max={5}
              placeholder="4.8"
              value={googleRating}
              onChange={(e) => setGoogleRating(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="google_review_count">Number of reviews</Label>
            <Input
              id="google_review_count"
              type="number"
              min={0}
              step={1}
              placeholder="120"
              value={googleCount}
              onChange={(e) => setGoogleCount(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-brand-muted font-medium mb-2">
            Preview
          </p>
          {parsedRating && parsedCount ? (
            <GoogleRatingPill rating={parsedRating} count={parsedCount} />
          ) : (
            <p className="text-xs text-brand-muted">
              Leave either field blank and the badge stays hidden on the website.
            </p>
          )}
        </div>

        <Button className="mt-5" disabled={savingGoogle} onClick={saveGoogle}>
          <Save className="h-4 w-4" />
          {savingGoogle ? 'Saving...' : 'Save Google rating'}
        </Button>
      </section>

      {/* Highlight statement — the two-line band on the home page. */}
      <section className="surface-card p-6 sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-brand-ink">
          Highlight statement
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Shown on the home page between the numbers and the founder story. Leave a
          language&apos;s pair blank to use the built-in wording for that language —
          blank Telugu falls back to the built-in Telugu, never to English.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <ContrastField
            id="contrast_line1_en"
            label="Small line (English)"
            value={contrast.line1_en}
            placeholder={EN_DEFAULTS.line1}
            onChange={(v) => setContrast((c) => ({ ...c, line1_en: v }))}
          />
          <ContrastField
            id="contrast_line2_en"
            label="Main line (English)"
            value={contrast.line2_en}
            placeholder={EN_DEFAULTS.line2}
            counted
            onChange={(v) => setContrast((c) => ({ ...c, line2_en: v }))}
          />
          <ContrastField
            id="contrast_line1_te"
            label="Small line (Telugu)"
            value={contrast.line1_te}
            placeholder={TE_DEFAULTS.line1}
            onChange={(v) => setContrast((c) => ({ ...c, line1_te: v }))}
          />
          <ContrastField
            id="contrast_line2_te"
            label="Main line (Telugu)"
            value={contrast.line2_te}
            placeholder={TE_DEFAULTS.line2}
            counted
            onChange={(v) => setContrast((c) => ({ ...c, line2_te: v }))}
          />
        </div>

        {/* Preview uses the same resolver the website does, so what is shown
            here is exactly what a visitor gets — including the fallbacks and
            the hidden state. */}
        <div className="mt-6 space-y-4">
          <ContrastPreview label="English preview" locale="en" values={contrast} />
          <ContrastPreview label="Telugu preview" locale="te" values={contrast} />
        </div>

        <Button className="mt-5" disabled={savingContrast} onClick={saveContrast}>
          <Save className="h-4 w-4" />
          {savingContrast ? 'Saving...' : 'Save highlight statement'}
        </Button>
      </section>
    </div>
  );
}

const MAIN_LINE_GUIDE = 90;

function ContrastField({
  id,
  label,
  value,
  placeholder,
  counted = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  /** Show the soft character guide. Advisory only — nothing is enforced. */
  counted?: boolean;
  onChange: (v: string) => void;
}) {
  const over = counted && value.trim().length > MAIN_LINE_GUIDE;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5"
      />
      {counted && (
        <p className={`mt-1 text-xs ${over ? 'text-brand-purple' : 'text-brand-muted'}`}>
          {value.trim().length}/{MAIN_LINE_GUIDE} characters
          {over ? ' — long lines wrap to three rows on a phone.' : ''}
        </p>
      )}
    </div>
  );
}

function ContrastPreview({
  label,
  locale,
  values,
}: {
  label: string;
  locale: Locale;
  values: { line1_en: string; line2_en: string; line1_te: string; line2_te: string };
}) {
  const { line1, line2 } = resolveContrast(locale === 'te' ? TE_DICT : EN_DICT, locale, {
    contrast_line1_en: values.line1_en,
    contrast_line2_en: values.line2_en,
    contrast_line1_te: values.line1_te,
    contrast_line2_te: values.line2_te,
  });

  return (
    <div>
      <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-brand-muted">
        {label}
      </p>
      {line2 ? (
        <div
          className={`rounded-xl border border-brand-line bg-white px-5 py-7 text-center${
            locale === 'te' ? ' lang-te' : ''
          }`}
        >
          <div className="mx-auto max-w-[46ch]">
            {line1 && (
              <p className="text-[1.0625rem] leading-[1.6] text-ink-muted">{line1}</p>
            )}
            <p className="mt-3 font-serif font-medium text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.25] tracking-[-0.015em] text-ink">
              {line2}
            </p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-brand-line px-5 py-6 text-xs text-brand-muted">
          The section is hidden on the website: this language has a small line but no
          main line. Clear both to bring the built-in wording back.
        </p>
      )}
    </div>
  );
}
