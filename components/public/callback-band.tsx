'use client';

import * as React from 'react';
import { Phone } from 'lucide-react';
import { CallbackForm } from './callback-form';
import { useT } from './i18n/language-provider';
import { telLink, cn } from '@/lib/utils';
import type { Schedule } from '@/lib/hours';

/**
 * Slim full-width band offering a callback — the counter-side equivalent of
 * "just ring us". Sits above the contact CTA on the home page and below the
 * three contact cards on /contact.
 */
export function CallbackBand({
  phone,
  schedule,
  className,
}: {
  /** Display form, e.g. "+91 98850 67198". */
  phone: string;
  schedule: Schedule;
  /** Vertical spacing, which differs between the two pages that use it. */
  className?: string;
}) {
  const { dict } = useT();

  // The sub-line carries the shop's number mid-sentence, and Telugu attaches
  // its case ending straight to it ("{phone}కి"), so the string is split on
  // the placeholder rather than assembled from fragments.
  const [before, after] = dict.callback.sub.split('{phone}');

  return (
    <section className={cn('border-y border-line bg-bg-elevated', className)}>
      <div className="container-public py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex items-start gap-4">
            <Phone aria-hidden className="mt-0.5 h-7 w-7 shrink-0 text-plum" strokeWidth={1.75} />
            <div className="min-w-0">
              <h2 className="font-serif font-medium text-[1.25rem] leading-snug tracking-[-0.01em] text-ink">
                {dict.callback.heading}
              </h2>
              <p className="mt-1.5 text-[0.9375rem] text-ink-muted leading-[1.6]">
                {before}
                <a
                  href={telLink(phone)}
                  className="font-medium text-plum whitespace-nowrap hover:text-plum-deep"
                >
                  {phone}
                </a>
                {after}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[380px]">
            <CallbackForm source="band" schedule={schedule} layout="inline" />
          </div>
        </div>
      </div>
    </section>
  );
}
