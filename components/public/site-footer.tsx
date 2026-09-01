import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { FooterWordmark } from './logo';
import { TiltCard } from './tilt-card';
import { SectionCurve } from './motion/section-curve';
import { SHOP_EMAIL, SHOP_ADDRESS_LINES, getMapsUrl, PRESCRIPTION_WA_TEXT, PRESCRIPTION_WA_TEXT_TE } from '@/lib/constants';
import { formatHoursSummary, type Schedule } from '@/lib/hours';
import { OpenStatus } from './open-status';
import { whatsappLink, telLink, cn } from '@/lib/utils';
import type { ShopSettings } from '@/lib/types';
import type { Dictionary, Locale } from '@/lib/i18n/types';

const COL_BROWSE: { key: keyof Dictionary['footer']['categories']; href: string }[] = [
  { key: 'general', href: '/products?cat=general' },
  { key: 'pharma', href: '/products?cat=pharma' },
  { key: 'ayurvedic', href: '/products?cat=ayurvedic' },
  { key: 'cosmetic', href: '/products?cat=cosmetic' },
];

const COL_SERVICES: { key: 'doctors' | 'diagnostics' | 'about'; href: string }[] = [
  { key: 'doctors', href: '/doctors' },
  { key: 'diagnostics', href: '/tests' },
  { key: 'about', href: '/about' },
];

/**
 * Giant wordmark at the foot of the page — shown whole, nothing cropped.
 *
 * "The Pharma Generic House" is 24 characters on a single nowrap line, so the
 * size stays viewport-proportional or the ends run off the screen.
 *
 * `line-height: 1.1` matters: Fraunces' ascent + descent exceed 1em, so a 1em
 * line box lets the glyphs spill past it — which the footer used to clip. The
 * extra 0.1 plus the block's padding keeps every letter inside its own box.
 */
const WORDMARK_SIZE = 'clamp(1.75rem, 6vw, 8rem)';

/**
 * Shell for the four footer columns. Declared once and applied to all four so
 * the radius and padding cannot drift apart. `h-full` makes each box fill its
 * grid row, so every box in a row ends on the same line regardless of how much
 * content it holds.
 *
 * Borderless at rest — the boxes are invisible rectangles that only exist to
 * align content. The background tint and hover elevation come from TiltCard.
 */
const COLUMN_BOX = 'h-full rounded-xl p-7';

/**
 * Contact rows are whole-row links — the icon is part of the target, not just
 * the text beside it. The underline is drawn on the text span only, so it
 * tracks the words rather than the full row width.
 */
const CONTACT_ROW =
  'group/row -mx-2 flex items-start gap-2.5 rounded-md px-2 py-1.5 cursor-pointer ' +
  'transition-colors hover:text-bg focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-teal-soft focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-ink';

const CONTACT_ICON =
  'h-4 w-4 mt-0.5 shrink-0 text-teal-soft transition-colors duration-200 ' +
  'group-hover/row:text-teal group-focus-visible/row:text-teal';

/** Teal underline drawing in from the left, matching the site's link pattern. */
const CONTACT_TEXT =
  'relative inline-block min-w-0 after:absolute after:left-0 after:right-0 after:-bottom-0.5 ' +
  "after:h-px after:bg-teal-soft after:origin-left after:scale-x-0 after:content-[''] " +
  'after:transition-transform after:duration-[250ms] after:ease-[cubic-bezier(0,0,0.2,1)] ' +
  'group-hover/row:after:scale-x-100 group-focus-visible/row:after:scale-x-100';

export function SiteFooter({
  settings,
  schedule,
  dict,
  locale = 'en',
}: {
  settings: ShopSettings;
  schedule: Schedule;
  dict: Dictionary;
  locale?: Locale;
}) {
  const rxText = locale === 'te' ? PRESCRIPTION_WA_TEXT_TE : PRESCRIPTION_WA_TEXT;
  return (
    // pb clears the fixed mobile action bar so footer content is never hidden behind it.
    <footer className="relative bg-ink text-bg pb-[72px] md:pb-0">
      {/* The dark band rises to meet the page rather than starting on a hard
          line. Positioned absolutely above the footer's own top edge: a
          negative margin here would collapse with the footer's margin and drag
          the whole element up instead of just the curve. */}
      <SectionCurve
        variant="dome"
        color="var(--ink)"
        className="absolute inset-x-0 -top-6 md:-top-10 h-6 md:h-10"
      />
      <div className="container-public pt-16 pb-0">
        <div>
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="The Pharma Generic House"
              width={491}
              height={498}
              className="h-12 w-auto sm:h-14 shrink-0"
            />
            <FooterWordmark className="text-bg" />
          </div>
          <p className="mt-3 text-[0.95rem] text-bg/70 max-w-md">
            {dict.footer.tagline}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Shop column */}
          <TiltCard className={COLUMN_BOX}>
            <h3 className="eyebrow eyebrow--teal text-[0.7rem]">{dict.footer.shop}</h3>
            <ul className="mt-5 space-y-1 text-[0.9375rem] text-bg/70">
              <li>
                <a
                  href={getMapsUrl(settings.shop_address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={dict.contact.openInMaps}
                  className={CONTACT_ROW}
                >
                  <MapPin className={CONTACT_ICON} />
                  <span className={CONTACT_TEXT}>
                    {SHOP_ADDRESS_LINES.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={telLink(settings.shop_phone)}
                  aria-label={dict.footer.call}
                  className={CONTACT_ROW}
                >
                  <Phone className={CONTACT_ICON} />
                  <span className={CONTACT_TEXT}>{settings.shop_phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(settings.shop_whatsapp, rxText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={dict.contact.openWhatsapp}
                  className={CONTACT_ROW}
                >
                  <MessageCircle className={CONTACT_ICON} />
                  <span className={CONTACT_TEXT}>{dict.footer.whatsappUs}</span>
                </a>
              </li>
              <li>
                <Link href="/contact#hours" className={CONTACT_ROW}>
                  <Clock className={CONTACT_ICON} />
                  <span className="min-w-0">
                    <span className={cn('block', CONTACT_TEXT)}>
                      {formatHoursSummary(schedule, dict)}
                    </span>
                    <OpenStatus
                      schedule={schedule}
                      className="mt-2 border-bg/20 text-bg/70"
                    />
                  </span>
                </Link>
              </li>
            </ul>
          </TiltCard>

          {/* Browse */}
          <TiltCard className={COLUMN_BOX}>
            <h3 className="eyebrow eyebrow--teal text-[0.7rem]">{dict.footer.browse}</h3>
            <ul className="mt-5 space-y-1 text-[0.9375rem] text-bg/70">
              {COL_BROWSE.map((l) => (
                <li key={l.key}>
                  <Link href={l.href} className={CONTACT_ROW}>
                    <span className={CONTACT_TEXT}>{dict.footer.categories[l.key]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </TiltCard>

          {/* Services */}
          <TiltCard className={COLUMN_BOX}>
            <h3 className="eyebrow eyebrow--teal text-[0.7rem]">{dict.footer.services}</h3>
            <ul className="mt-5 space-y-1 text-[0.9375rem] text-bg/70">
              {COL_SERVICES.map((l) => (
                <li key={l.key}>
                  <Link href={l.href} className={CONTACT_ROW}>
                    <span className={CONTACT_TEXT}>{dict.nav[l.key]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </TiltCard>

          {/* Get in touch */}
          <TiltCard className={COLUMN_BOX}>
            <h3 className="eyebrow eyebrow--teal text-[0.7rem]">{dict.footer.getInTouch}</h3>
            <ul className="mt-5 space-y-1 text-[0.9375rem] text-bg/70">
              <li>
                <Link href="/contact" className={CONTACT_ROW}>
                  <span className={CONTACT_TEXT}>{dict.footer.contactForm}</span>
                </Link>
              </li>
              <li>
                <a
                  href={whatsappLink(settings.shop_whatsapp, rxText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={dict.contact.openWhatsapp}
                  className={CONTACT_ROW}
                >
                  <span className={CONTACT_TEXT}>{dict.nav.whatsapp}</span>
                </a>
              </li>
              <li>
                <a
                  href={telLink(settings.shop_phone)}
                  aria-label={dict.footer.call}
                  className={CONTACT_ROW}
                >
                  <span className={CONTACT_TEXT}>{dict.footer.call}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${SHOP_EMAIL}`} className={CONTACT_ROW}>
                  <span className={cn(CONTACT_TEXT, 'break-words')}>{SHOP_EMAIL}</span>
                </a>
              </li>
            </ul>
          </TiltCard>
        </div>

        <div className="mt-14 pt-4 border-t border-bg/15 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8rem] text-bg/55">
            <span>{dict.footer.rights}</span>
            <Link href="/privacy" className="hover:text-bg transition-colors">
              {dict.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:text-bg transition-colors">
              {dict.footer.terms}
            </Link>
          </div>
          <p className="font-serif italic font-normal text-[0.9375rem] text-teal-soft">
            {dict.footer.bottomTagline}
          </p>
        </div>
      </div>

      {/* Giant wordmark — decorative watermark, shown in full. In normal flow
          below the copyright row, so it sizes to the height of the type. */}
      <div
        aria-hidden
        className="pointer-events-none select-none flex justify-center pt-3 pb-5"
      >
        <span
          className="font-serif whitespace-nowrap text-center"
          style={{
            fontSize: WORDMARK_SIZE,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--bg)',
            opacity: 0.16,
          }}
        >
          The Pharma Generic House
        </span>
      </div>
    </footer>
  );
}
