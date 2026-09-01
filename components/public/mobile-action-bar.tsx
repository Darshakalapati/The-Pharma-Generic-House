'use client';

import { Phone } from 'lucide-react';
import { WhatsAppGlyph } from './whatsapp-glyph';
import { telLink } from '@/lib/utils';
import { useT } from './i18n/language-provider';
import { useWhatsAppHelper } from './whatsapp-helper';

/**
 * Fixed Call / WhatsApp bar, phones only.
 *
 * Replaces the floating WhatsApp circle below `md` — a full-width pair of
 * thumb-height targets is easier to hit one-handed than a 48px circle, and it
 * surfaces the phone number too.
 *
 * Sits at z-30: above page content, but below the mobile menu and the enquiry
 * cart overlay (z-40) and every dialog (z-50), so an open drawer always covers
 * it rather than fighting it for taps.
 */
export function MobileActionBar({ phone }: { phone: string }) {
  const { dict } = useT();
  const { open } = useWhatsAppHelper();
  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg-elevated"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-2">
        <a
          href={telLink(phone)}
          className="inline-flex h-14 items-center justify-center gap-2 bg-bg-elevated text-plum text-[0.9375rem] font-semibold"
        >
          <Phone className="h-[18px] w-[18px]" />
          {dict.nav.call}
        </a>
        <button
          type="button"
          onClick={open}
          className="inline-flex h-14 items-center justify-center gap-2 bg-teal text-white text-[0.9375rem] font-semibold"
        >
          <span className="wa-pulse inline-flex rounded-full">
            <WhatsAppGlyph className="h-[18px] w-[18px]" />
          </span>
          {dict.nav.whatsapp}
        </button>
      </div>
    </div>
  );
}
