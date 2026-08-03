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

export function SiteFooter({ settings }: { settings: ShopSettings }) {
  return (
    <footer className="mt-24 bg-ink text-bg">
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

        <div className="mt-14 pt-6 border-t border-bg/15 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between text-[0.8rem] text-bg/55">
          <span>© 2026 The Pharma Generic House. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/contact" className="hover:text-bg transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-bg transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
