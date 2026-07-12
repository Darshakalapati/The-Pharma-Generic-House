'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, ShoppingBag, Send, Package, Plus, Minus } from 'lucide-react';
import { useEnquiryCart } from './enquiry-cart-context';
import { createClient } from '@/lib/supabase/client';
import { whatsappLink, isValidPhoneIN, cn } from '@/lib/utils';
import { WhatsAppGlyph } from './whatsapp-glyph';

const formSchema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  phone: z.string().refine(isValidPhoneIN, 'Please enter a valid Indian phone number'),
});
type FormValues = z.infer<typeof formSchema>;

interface Props {
  whatsappNumber: string;
  reservationEnabled: boolean;
}

export function EnquiryCartPanel({ whatsappNumber, reservationEnabled }: Props) {
  const { items, open, setOpen, count, setQty, remove, clear } = useEnquiryCart();
  const [submitting, setSubmitting] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [submitMode, setSubmitMode] = React.useState<'submit' | 'reserve'>('submit');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const buildWhatsAppMessage = () => {
    const lines = [
      `Hello, I'd like to enquire about the following from The Pharma Generic House:`,
      '',
      ...items.map((i, idx) => `${idx + 1}. ${i.product_name} — qty ${i.quantity}`),
      '',
      'Please confirm availability.',
    ];
    return lines.join('\n');
  };

  const handleWhatsApp = () => {
    if (items.length === 0) return;
    window.open(whatsappLink(whatsappNumber, buildWhatsAppMessage()), '_blank');
  };

  const onSubmit = async (data: FormValues) => {
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('enquiries').insert({
        customer_name: data.name.trim(),
        customer_phone: data.phone.trim(),
        items: items.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
        })),
        status: 'new',
        notes: submitMode === 'reserve' ? 'Reservation for pickup' : null,
      });
      if (error) throw error;
      toast.success(
        submitMode === 'reserve'
          ? "Items reserved. We'll WhatsApp to confirm pickup."
          : "Enquiry sent. We'll be in touch on WhatsApp shortly."
      );
      clear();
      reset();
      setShowForm(false);
      setOpen(false);
    } catch {
      toast.error('Could not submit. Please try again or use WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating cart trigger */}
      {count > 0 && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open enquiry"
          className="fixed bottom-5 right-[calc(72px+env(safe-area-inset-right,0))] sm:right-[calc(80px+env(safe-area-inset-right,0))] z-40 inline-flex items-center gap-2 rounded-full bg-plum text-white px-5 py-3 text-[0.9375rem] font-medium shadow-elevated hover:bg-plum-deep transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Enquiry</span>
          <span aria-hidden className="text-white/50">·</span>
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-plum-deep text-[0.78rem] px-1.5">
            {count}
          </span>
        </button>
      )}

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer */}
      <aside
        aria-hidden={!open}
        aria-label="Your enquiry"
        className={cn(
          'fixed right-0 top-0 z-50 h-[100dvh] w-full sm:max-w-[420px] bg-bg-elevated border-l border-line shadow-elevated flex flex-col transition-transform duration-350 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-serif font-medium text-[1.5rem] tracking-[-0.015em]">
              Your Enquiry
            </h2>
            <p className="mt-1 text-[0.875rem] text-ink-muted">
              {count === 0
                ? 'No items yet'
                : `${count} item${count === 1 ? '' : 's'} ready`}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-sand hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-6 py-16 text-center text-ink-muted">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-ink-faint" />
              <p className="text-[0.95rem]">
                Your enquiry list is empty.
                <br />
                Add items from the products page.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.product_id} className="flex items-start gap-3 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[0.95rem] leading-snug truncate">
                      {it.product_name}
                    </p>
                    <div className="mt-3 inline-flex items-center border border-line rounded-md overflow-hidden">
                      <button
                        aria-label="Decrease"
                        onClick={() => setQty(it.product_id, it.quantity - 1)}
                        className="grid h-9 w-9 place-items-center text-ink-muted hover:bg-sand hover:text-ink transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 min-w-[2rem] text-center text-[0.95rem] font-medium border-x border-line py-1.5">
                        {it.quantity}
                      </span>
                      <button
                        aria-label="Increase"
                        onClick={() => setQty(it.product_id, it.quantity + 1)}
                        className="grid h-9 w-9 place-items-center text-ink-muted hover:bg-sand hover:text-ink transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    aria-label="Remove"
                    onClick={() => remove(it.product_id)}
                    className="grid h-9 w-9 place-items-center text-ink-faint hover:text-plum hover:bg-plum-tint rounded-md transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="border-t border-line bg-bg-elevated px-6 py-5 space-y-3">
            {showForm ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="enq-name" className="form-label">Your name</label>
                  <input
                    id="enq-name"
                    autoComplete="name"
                    {...register('name')}
                    className="input-field"
                    placeholder="Full name"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-[0.78rem] text-plum">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="enq-phone" className="form-label">Phone</label>
                  <input
                    id="enq-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    {...register('phone')}
                    className="input-field"
                    placeholder="10-digit mobile"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-[0.78rem] text-plum">{errors.phone.message}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-plum-outline flex-1"
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={submitMode === 'reserve' ? 'btn-plum flex-1' : 'btn-plum flex-1'}
                  >
                    {submitting
                      ? 'Sending...'
                      : submitMode === 'reserve'
                        ? 'Reserve'
                        : 'Send Enquiry'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <button onClick={handleWhatsApp} className="btn-teal w-full">
                  <WhatsAppGlyph className="h-4 w-4" />
                  Send via WhatsApp
                </button>
                <button
                  onClick={() => {
                    setSubmitMode('submit');
                    setShowForm(true);
                  }}
                  className="btn-plum-outline w-full"
                >
                  <Send className="h-4 w-4" />
                  Submit Enquiry
                </button>
                {reservationEnabled && (
                  <button
                    onClick={() => {
                      setSubmitMode('reserve');
                      setShowForm(true);
                    }}
                    className="btn-plum w-full"
                  >
                    <Package className="h-4 w-4" />
                    Reserve for Pickup
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
