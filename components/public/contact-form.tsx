'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { Magnetic } from '@/components/public/motion/magnetic';
import { useT } from './i18n/language-provider';
import { submitContactMessage } from '@/app/(public)/actions';
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
  const { dict } = useT();
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
      const res = await submitContactMessage({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        message: data.message.trim(),
      });
      if (!res.ok) throw new Error(res.error);
      toast.success("Thank you. We'll be in touch shortly.");
      reset();
    } catch {
      toast.error(dict.forms.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ct-name" className="form-label">{dict.forms.name}</label>
          <input
            id="ct-name"
            autoComplete="name"
            placeholder={dict.forms.fullName}
            {...register('name')}
            className="input-field"
          />
          {errors.name && (
            <p className="mt-1.5 text-[0.78rem] text-plum">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="ct-phone" className="form-label">{dict.forms.phone}</label>
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
        <label htmlFor="ct-email" className="form-label">{dict.forms.emailOpt}</label>
        <input
          id="ct-email"
          type="email"
          autoComplete="email"
          placeholder={dict.forms.emailPlaceholder}
          {...register('email')}
          className="input-field"
        />
        {errors.email && (
          <p className="mt-1.5 text-[0.78rem] text-plum">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="ct-message" className="form-label">{dict.forms.message}</label>
        <textarea
          id="ct-message"
          rows={5}
          placeholder={dict.forms.messagePlaceholder}
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
        {submitting ? dict.forms.sending : dict.forms.sendMessage}
      </button>
      </Magnetic>
    </form>
  );
}
