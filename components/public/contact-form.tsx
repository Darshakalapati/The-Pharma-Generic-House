'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Magnetic } from '@/components/public/motion/magnetic';
import { createClient } from '@/lib/supabase/client';
import { isValidPhoneIN } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  phone: z.string().refine(isValidPhoneIN, 'Please enter a valid Indian phone number'),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, 'Please enter a valid email'),
  message: z.string().min(5, 'Please write a message'),
});
type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('contact_messages').insert({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        message: data.message.trim(),
        status: 'new',
      });
      if (error) throw error;
      toast.success("Thank you. We'll be in touch shortly.");
      reset();
    } catch {
      toast.error('Could not send. Please try again or WhatsApp us.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ct-name" className="form-label">Your name</label>
          <input
            id="ct-name"
            autoComplete="name"
            placeholder="Full name"
            {...register('name')}
            className="input-field"
          />
          {errors.name && (
            <p className="mt-1.5 text-[0.78rem] text-plum">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="ct-phone" className="form-label">Phone</label>
          <input
            id="ct-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile"
            {...register('phone')}
            className="input-field"
          />
          {errors.phone && (
            <p className="mt-1.5 text-[0.78rem] text-plum">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="ct-email" className="form-label">Email (optional)</label>
        <input
          id="ct-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
          className="input-field"
        />
        {errors.email && (
          <p className="mt-1.5 text-[0.78rem] text-plum">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="ct-message" className="form-label">Message</label>
        <textarea
          id="ct-message"
          rows={5}
          placeholder="How can we help?"
          {...register('message')}
          className="input-field"
        />
        {errors.message && (
          <p className="mt-1.5 text-[0.78rem] text-plum">{errors.message.message}</p>
        )}
      </div>

      <Magnetic className="w-full sm:w-auto">
      <button type="submit" disabled={submitting} className="btn-plum w-full">
        <Send className="h-4 w-4" />
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
      </Magnetic>
    </form>
  );
}
