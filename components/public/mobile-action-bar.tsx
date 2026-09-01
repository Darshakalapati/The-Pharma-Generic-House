import { Phone } from 'lucide-react';
import { WhatsAppGlyph } from './whatsapp-glyph';
import { whatsappLink, telLink } from '@/lib/utils';
import { PRESCRIPTION_WA_TEXT, PRESCRIPTION_WA_TEXT_TE } from '@/lib/constants';
import { getDictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/types';

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
export function MobileActionBar({
  phone,
  whatsapp,
  locale,
}: {
  phone: string;
  whatsapp: string;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const rxText = locale === 'te' ? PRESCRIPTION_WA_TEXT_TE : PRESCRIPTION_WA_TEXT;
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
        <a
          href={whatsappLink(whatsapp, rxText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 items-center justify-center gap-2 bg-teal text-white text-[0.9375rem] font-semibold"
        >
          <span className="wa-pulse inline-flex rounded-full">
            <WhatsAppGlyph className="h-[18px] w-[18px]" />
          </span>
          {dict.nav.whatsapp}
        </a>
      </div>
    </div>
  );
}
