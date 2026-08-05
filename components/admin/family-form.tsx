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
import { ImageUpload } from './image-upload';
import { ASPECT } from '@/lib/image-crop';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { FamilyMember } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(2, 'Role is required'),
  bio: z.string().min(10, 'Write a short paragraph about this person'),
  photo_url: z.string().optional(),
  quote_text: z.string().optional(),
  quote_attribution: z.string().optional(),
  display_order: z.string().optional(),
  is_active: z.boolean(),
  is_featured_quote: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;

export function FamilyForm({
  member,
  open,
  onOpenChange,
}: {
  member: FamilyMember | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(member),
  });

  React.useEffect(() => {
    if (open) reset(defaults(member));
  }, [open, member, reset]);

  const photoUrl = watch('photo_url');
  const name = watch('name');

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        name: data.name.trim(),
        role: data.role.trim(),
        bio: data.bio.trim(),
        photo_url: data.photo_url?.trim() || null,
        quote_text: data.quote_text?.trim() || null,
        quote_attribution: data.quote_attribution?.trim() || data.name.trim(),
        display_order: data.display_order ? Number(data.display_order) : 0,
        is_active: data.is_active,
        is_featured_quote: data.is_featured_quote,
      };

      if (member) {
        const { error } = await supabase
          .from('family_members')
          .update(payload)
          .eq('id', member.id);
        if (error) throw error;
        toast.success('Family member updated.');
      } else {
        const { error } = await supabase.from('family_members').insert(payload);
        if (error) throw error;
        toast.success('Family member added.');
      }
      router.refresh();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('Could not save. Have you run migration 0010 in Supabase?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{member ? 'Edit family member' : 'Add family member'}</DialogTitle>
          <DialogDescription>
            The active member with the lowest display order is the one featured on the
            home page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fm-name">Name</Label>
              <Input
                id="fm-name"
                placeholder="e.g. Uma Shankar Alapati"
                {...register('name')}
                className={cn('mt-1.5', errors.name && 'border-destructive')}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="fm-role">Role</Label>
              <Input
                id="fm-role"
                placeholder="e.g. Founder &amp; Pharmacist"
                {...register('role')}
                className={cn('mt-1.5', errors.role && 'border-destructive')}
              />
              {errors.role && (
                <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="fm-bio">Bio</Label>
            <Textarea
              id="fm-bio"
              rows={6}
              placeholder="How they came to the pharmacy, what they're known for, why customers trust them…"
              {...register('bio')}
              className={cn('mt-1.5', errors.bio && 'border-destructive')}
            />
            <p className="mt-1 text-xs text-brand-muted">
              A warm, human paragraph about this person. Keep it real and specific.
            </p>
            {errors.bio && (
              <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <Label>Photo</Label>
            <div className="mt-1.5">
              <ImageUpload
                value={photoUrl || null}
                onChange={(url) => setValue('photo_url', url ?? '', { shouldValidate: true })}
                folder="family"
                bucket="family-photos"
                pathLayout="flat"
                aspectRatio={ASPECT.familyPhoto}
                previewClassName="w-32"
              />
            </div>
            <p className="mt-1 text-xs text-brand-muted">
              A portrait works best — the home page crops to a tall 4:5 frame. Leave
              blank to show a &quot;Photograph coming soon&quot; placeholder.
            </p>
          </div>

          <div>
            <Label htmlFor="fm-quote">Quote text</Label>
            <Textarea
              id="fm-quote"
              rows={3}
              placeholder="e.g. We don&apos;t sell medicines. We sell healing."
              {...register('quote_text')}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-brand-muted">
              A short quote from this person to feature as a pull-quote on the home
              page. Leave blank if not used.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="fm-attr">Quote attribution</Label>
              <Input
                id="fm-attr"
                placeholder={name || 'Name shown under the quote'}
                {...register('quote_attribution')}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-brand-muted">
                Defaults to the name above.
              </p>
            </div>
            <div>
              <Label htmlFor="fm-order">Display order</Label>
              <Input
                id="fm-order"
                type="number"
                placeholder="0"
                {...register('display_order')}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-brand-muted">
                Lower numbers show first. The lowest active one is featured.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-brand-muted">
                  Turn off to hide without deleting.
                </p>
              </div>
              <Switch
                checked={watch('is_active')}
                onCheckedChange={(v) => setValue('is_active', v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
              <div className="pr-3">
                <Label>Show as Featured Quote</Label>
                <p className="text-xs text-brand-muted">
                  If on, this person&apos;s quote appears as the pull-quote in the family
                  section. Only one person should have this on at a time.
                </p>
              </div>
              <Switch
                checked={watch('is_featured_quote')}
                onCheckedChange={(v) => setValue('is_featured_quote', v)}
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
              {submitting ? 'Saving...' : member ? 'Save changes' : 'Add member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaults(m: FamilyMember | null): FormValues {
  return {
    name: m?.name ?? '',
    role: m?.role ?? '',
    bio: m?.bio ?? '',
    photo_url: m?.photo_url ?? '',
    quote_text: m?.quote_text ?? '',
    quote_attribution: m?.quote_attribution ?? '',
    display_order: m?.display_order != null ? String(m.display_order) : '0',
    is_active: m?.is_active ?? true,
    is_featured_quote: m?.is_featured_quote ?? false,
  };
}
