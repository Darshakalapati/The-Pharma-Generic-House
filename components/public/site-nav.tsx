'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, X, Menu } from 'lucide-react';
import { Logo } from './logo';
import { WhatsAppGlyph } from './whatsapp-glyph';
import { cn, whatsappLink, telLink } from '@/lib/utils';
import { SHOP_PHONE, SHOP_WHATSAPP } from '@/lib/constants';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/tests', label: 'Diagnostics' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

interface Props {
  shopPhone?: string;
  shopWhatsApp?: string;
}

export function SiteNav({ shopPhone = SHOP_PHONE, shopWhatsApp = SHOP_WHATSAPP }: Props) {
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
        <div className="container-public flex h-[72px] items-center justify-between">
          <Logo tagline mobileWordmark />

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href) || undefined}
                className={cn(
                  'link-underline text-[0.9375rem] font-medium transition-colors',
                  isActive(item.href) ? 'text-ink' : 'text-ink/80 hover:text-ink'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <a
              href={telLink(shopPhone)}
              className="btn-plum-outline h-10 px-4 text-[0.875rem]"
            >
              <Phone className="h-4 w-4" />
              Call us
            </a>
          </div>

          <button
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink hover:bg-sand transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 bg-bg-elevated transition-[opacity,transform] duration-300 ease-smooth flex flex-col',
          open
            ? 'opacity-100 pointer-events-auto translate-y-0'
            : 'opacity-0 pointer-events-none -translate-y-2'
        )}
        style={{ paddingTop: 'env(safe-area-inset-top, 0)' }}
      >
        <div className="container-public flex h-[72px] items-center justify-between border-b border-line">
          <Logo tagline mobileWordmark />
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-sand"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="container-public flex-1 overflow-y-auto pt-8 pb-6">
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
                  {item.label}
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
            Call
          </a>
          <a
            href={whatsappLink(shopWhatsApp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-teal"
          >
            <WhatsAppGlyph className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
