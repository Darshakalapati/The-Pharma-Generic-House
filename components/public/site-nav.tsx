'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, X, Menu } from 'lucide-react';
import { Logo } from './logo';
import { WhatsAppGlyph } from './whatsapp-glyph';
import { cn, whatsappLink, telLink } from '@/lib/utils';
import { SHOP_PHONE, SHOP_WHATSAPP } from '@/lib/constants';
import { OpenStatus } from './open-status';
import { LanguageToggle } from './language-toggle';
import { SearchButton } from './search-button';
import { useT } from './i18n/language-provider';
import type { Schedule } from '@/lib/hours';

/** Labels resolve from the dictionary at render time. */
const NAV: { href: string; key: 'home' | 'products' | 'doctors' | 'diagnostics' | 'about' | 'contact' }[] = [
  { href: '/', key: 'home' },
  { href: '/products', key: 'products' },
  { href: '/doctors', key: 'doctors' },
  { href: '/tests', key: 'diagnostics' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
];

interface Props {
  shopPhone?: string;
  shopWhatsApp?: string;
  schedule: Schedule;
}

export function SiteNav({
  shopPhone = SHOP_PHONE,
  shopWhatsApp = SHOP_WHATSAPP,
  schedule,
}: Props) {
  const { dict } = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        style={{ top: 'var(--banner-height, 0px)' }}
        className={cn(
          'sticky z-30 transition-[box-shadow,border-color,background-color,backdrop-filter] duration-300 ease-out',
          scrolled
            ? 'border-b border-line shadow-[0_1px_0_rgba(31,26,31,0.04)] bg-[rgba(255,255,255,0.85)] backdrop-blur-[8px]'
            : 'border-b border-transparent bg-bg-elevated'
        )}
      >
        {/* Three zones, no absolute positioning: the left and right blocks
            keep their intrinsic width and the links take whatever is left, so
            nothing can ever ride over anything else. */}
        <div className="container-public flex h-[72px] items-center gap-4">
          {/* LEFT — brand */}
          <div className="shrink-0">
            <Logo mobileWordmark compact />
          </div>

          {/* CENTRE — links */}
          <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-center gap-6 xl:gap-8 2xl:gap-10">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href) || undefined}
                className={cn(
                  'link-underline whitespace-nowrap font-medium transition-colors',
                  'text-[0.9375rem]',
                  isActive(item.href) ? 'text-ink' : 'text-ink/80 hover:text-ink'
                )}
              >
                {dict.nav[item.key]}
              </Link>
            ))}
          </nav>

          {/* RIGHT — controls */}
          <div className="hidden lg:flex shrink-0 items-center gap-2">
            <SearchButton className="h-10 w-10" />
            <a
              href={telLink(shopPhone)}
              className="btn-plum-outline h-10 px-4 text-[0.875rem] whitespace-nowrap"
            >
              <Phone className="h-4 w-4" />
              {dict.nav.callUs}
            </a>
          </div>

          {/* Hamburger takes over below lg, so tablets and small laptops get
              the overlay rather than a cramped row. */}
          <SearchButton className="lg:hidden ml-auto h-11 w-11" />

          <button
            aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-sand transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-40 bg-bg-elevated transition-[opacity,transform] duration-300 ease-smooth flex flex-col',
          open
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-2'
        )}
        style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}
      >
        <div className="container-public flex h-[72px] items-center justify-between border-b border-line">
          <Logo tagline mobileWordmark taglineText={dict.hero.estTagline} />
          <button
            aria-label={dict.nav.closeMenu}
            onClick={() => setOpen(false)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-sand"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="container-public pt-4 flex flex-col gap-3">
          <LanguageToggle className="w-full justify-center py-2.5" />
          <OpenStatus schedule={schedule} />
        </div>

        <nav className="container-public flex-1 overflow-y-auto pt-6 pb-6">
          <ul className="flex flex-col gap-1">
            {NAV.map((item, i) => (
              <li
                key={item.href}
                className={cn(
                  'transition-all duration-300 ease-smooth',
                  open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                )}
                style={{ transitionDelay: open ? `${80 + i * 50}ms` : '0ms' }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'block py-3 font-serif font-medium text-[1.625rem] tracking-[-0.015em]',
                    isActive(item.href) ? 'text-plum' : 'text-ink'
                  )}
                >
                  {dict.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom action row — call + whatsapp */}
        <div
          className="container-public border-t border-line py-5 grid grid-cols-2 gap-3"
          style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0))' }}
        >
          <a href={telLink(shopPhone)} className="btn-plum-outline">
            <Phone className="h-4 w-4" />
            {dict.nav.call}
          </a>
          <a
            href={whatsappLink(shopWhatsApp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-teal"
          >
            <WhatsAppGlyph className="h-4 w-4" />
            {dict.nav.whatsapp}
          </a>
        </div>
      </div>
    </>
  );
}
