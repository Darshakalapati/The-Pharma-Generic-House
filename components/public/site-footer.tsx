import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { FooterWordmark } from './logo';
import { TiltCard } from './tilt-card';
import { SectionCurve } from './motion/section-curve';
import { SHOP_EMAIL } from '@/lib/constants';
import { whatsappLink, telLink } from '@/lib/utils';
import type { ShopSettings } from '@/lib/types';

const COL_BROWSE = [
  { label: 'General Medicine', href: '/products?cat=general' },
  { label: 'Pharma', href: '/products?cat=pharma' },
  { label: 'Ayurvedic', href: '/products?cat=ayurvedic' },
  { label: 'Cosmetic', href: '/products?cat=cosmetic' },
];

const COL_SERVICES = [
  { label: 'Doctors', href: '/doctors' },
  { label: 'Diagnostics', href: '/tests' },
  { label: 'About us', href: '/about' },
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

export function SiteFooter({ settings }: { settings: ShopSettings }) {
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
            Your trusted neighbourhood pharmacy. Vijayawada.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Shop column */}
          <TiltCard className={COLUMN_BOX}>
            <h3 className="eyebrow eyebrow--teal text-[0.7rem]">Shop</h3>
            <ul className="mt-5 space-y-3 text-[0.9375rem] text-bg/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 text-teal-soft shrink-0" />
                <span>{settings.shop_address}</span>
              </li>
              <li>
                <a href={telLink(settings.shop_phone)} className="flex items-start gap-2.5 hover:text-bg transition-colors">
                  <Phone className="h-4 w-4 mt-0.5 text-teal-soft shrink-0" />
                  <span>{settings.shop_phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink(settings.shop_whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 hover:text-bg transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mt-0.5 text-teal-soft shrink-0" />
                  <span>WhatsApp us</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 mt-0.5 text-teal-soft shrink-0" />
                <span>{settings.shop_hours}</span>
              </li>
            </ul>
          </TiltCard>

          {/* Browse */}
          <TiltCard className={COLUMN_BOX}>
            <h3 className="eyebrow eyebrow--teal text-[0.7rem]">Browse</h3>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-bg/70">
              {COL_BROWSE.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-bg transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </TiltCard>

          {/* Services */}
          <TiltCard className={COLUMN_BOX}>
            <h3 className="eyebrow eyebrow--teal text-[0.7rem]">Services</h3>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-bg/70">
              {COL_SERVICES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-bg transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </TiltCard>

          {/* Get in touch */}
          <TiltCard className={COLUMN_BOX}>
            <h3 className="eyebrow eyebrow--teal text-[0.7rem]">Get in touch</h3>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-bg/70">
              <li>
                <Link href="/contact" className="hover:text-bg transition-colors">
                  Contact form
                </Link>
              </li>
              <li>
                <a
                  href={whatsappLink(settings.shop_whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-bg transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={telLink(settings.shop_phone)} className="hover:text-bg transition-colors">
                  Call
                </a>
              </li>
              <li>
                <a href={`mailto:${SHOP_EMAIL}`} className="hover:text-bg transition-colors break-words">
                  {SHOP_EMAIL}
                </a>
              </li>
            </ul>
          </TiltCard>
        </div>

        <div className="mt-14 pt-4 border-t border-bg/15 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8rem] text-bg/55">
            <span>© 2026 The Pharma Generic House</span>
            <Link href="/contact" className="hover:text-bg transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-bg transition-colors">
              Terms
            </Link>
          </div>
          <p className="font-serif italic font-normal text-[0.9375rem] text-teal-soft">
            Medicines, doctors, tests — under one roof.
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
