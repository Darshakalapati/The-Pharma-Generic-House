'use client';

import * as React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { submitCallbackRequest } from '@/app/(public)/actions';
import { getOpenStatus, nextOpeningClock, type Schedule } from '@/lib/hours';
import { useT } from './i18n/language-provider';
import { cn } from '@/lib/utils';

/** Both entry points share this form, so validation and copy can't drift. */
export function CallbackForm({
  source,
  schedule,
  layout,
  onSuccess,
}: {
  source: 'band' | 'slidein';
  schedule: Schedule;
  /** `inline` sits the button beside the field from sm up; `stacked` never does. */
  layout: 'inline' | 'stacked';
  /** Fired once, after the success state is shown. */
  onSuccess?: () => void;
}) {
  const { dict } = useT();
  const reduced = useReducedMotion();
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);
  const honeypot = React.useRef<HTMLInputElement | null>(null);

  const inputId = `callback-${source}`;

  /**
   * Resolved at submit time, not render time: "are we open" depends on the
   * clock, and computing it during render would make the server and client
   * disagree on a cached page.
   */
  const successMessage = () => {
    const status = getOpenStatus(schedule, new Date(), dict);
    if (status.state === 'open' || status.state === 'closing-soon') {
      return dict.callback.successOpen;
    }
    const time = nextOpeningClock(schedule, new Date());
    return time
      ? dict.callback.successClosed.replace('{time}', time)
      : dict.callback.successOpen;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    // Cheap client-side gate so an obvious typo doesn't need a round trip.
    // The server re-checks; this is not the validation that counts.
    if (value.replace(/\D/g, '').length !== 10) {
      setError(dict.callback.invalid);
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitCallbackRequest(value, source, honeypot.current?.value);
      if (!res.ok) {
        setError(dict.callback.invalid);
        return;
      }
      setDone(successMessage());
      onSuccess?.();
    } catch {
      setError(dict.callback.invalid);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <motion.p
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="flex items-start gap-2.5 text-[0.9375rem] text-ink"
        role="status"
      >
        <span
          aria-hidden
          className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal text-white"
        >
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        {done}
      </motion.p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative w-full">
      <div
        className={cn(
          'flex flex-col gap-3',
          layout === 'inline' && 'sm:flex-row sm:items-start'
        )}
      >
        <div className={cn('min-w-0', layout === 'inline' && 'sm:flex-1')}>
          <label htmlFor={inputId} className="sr-only">
            {dict.callback.placeholder}
          </label>
          {/* The +91 is part of the field's frame rather than the value, so
              there is nothing for the visitor to delete by accident and the
              ten digits they type are the ten digits we store. */}
          <div
            className={cn(
              'flex h-12 items-center rounded-md border bg-bg-elevated transition-colors',
              'focus-within:ring-2 focus-within:ring-plum/30',
              error ? 'border-plum focus-within:border-plum' : 'border-line focus-within:border-plum'
            )}
          >
            <span
              aria-hidden
              className="select-none border-r border-line px-3 text-[0.9375rem] text-ink-muted"
            >
              +91
            </span>
            <input
              id={inputId}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              value={value}
              onChange={(e) => {
                setValue(e.target.value.replace(/\D/g, '').slice(0, 10));
                if (error) setError(null);
              }}
              placeholder={dict.callback.placeholder}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className="min-w-0 flex-1 bg-transparent px-3 text-[0.9375rem] text-ink outline-none placeholder:text-ink-faint"
            />
          </div>
        </div>

        {/* Bots fill every field they find. Hidden from sight, from the
            accessibility tree and from tab order — a real visitor can't reach
            it, so anything in it came from a script. */}
        <input
          ref={honeypot}
          type="text"
          name="company"
          tabIndex={-1}
          aria-hidden
          autoComplete="off"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'btn-plum h-12 w-full shrink-0',
            layout === 'inline' && 'sm:w-auto'
          )}
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? dict.callback.submitting : dict.callback.submit}
        </button>
      </div>

      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-[0.8125rem] text-plum">
          {error}
        </p>
      )}
    </form>
  );
}
