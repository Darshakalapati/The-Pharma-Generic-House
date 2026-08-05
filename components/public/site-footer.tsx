import Link from 'next/link';
import Image from 'next/image';
import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { FooterWordmark } from './logo';
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

export function SiteFooter({ settings }: { settings: ShopSettings }) {
  return (
    <footer className="relative bg-ink text-bg">
      <div className="container-public pt-16 pb-10">
        <div>
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="The Pharma Generic House"
              width={512}
              height={512}
              className="h-12 w-auto sm:h-14 shrink-0"
            />
            <FooterWordmark className="text-bg" />
          </div>
          <p className="mt-3 text-[0.95rem] text-bg/70 max-w-md">
            Your trusted neighbourhood pharmacy. Vijayawada.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Shop column */}
          <div>
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
          </div>

          {/* Browse */}
          <div>
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
          </div>

          {/* Services */}
          <div>
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
          </div>

          {/* Get in touch */}
          <div>
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
                <a href={`mailto:${SHOP_EMAIL}`} className="hover:text-bg transition-colors break-all">
                  {SHOP_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-7 border-t border-bg/15 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
        className="pointer-events-none select-none flex justify-center pt-6 pb-5"
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
