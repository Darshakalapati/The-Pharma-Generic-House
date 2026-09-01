import Link from 'next/link';
import Image from 'next/image';
import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';
import { WhatsAppGlyph } from '@/components/public/whatsapp-glyph';
import { getShopSettings, getSchedule } from '@/lib/settings';
import { getDictionary, getLocale } from '@/lib/i18n';
import { LanguageProvider } from '@/components/public/i18n/language-provider';
import { whatsappLink } from '@/lib/utils';

export const metadata = { title: 'Page not found' };

const LINKS: { href: string; key: 'home' | 'products' | 'contact' }[] = [
  { href: '/', key: 'home' },
  { href: '/products', key: 'products' },
  { href: '/contact', key: 'contact' },
];

/**
 * Branded 404. Lives at the app root rather than inside the (public) group, so
 * it renders the nav and footer itself to match the rest of the site.
 */
export default async function NotFound() {
  const locale = getLocale();
  const dict = getDictionary(locale);
  const [settings, schedule] = await Promise.all([getShopSettings(), getSchedule()]);

  return (
    <LanguageProvider dict={dict} locale={locale}>
      <div className={`site-grain bg-bg text-ink${locale === 'te' ? ' lang-te' : ''}`}>
      <SiteNav
        shopPhone={settings.shop_phone}
        shopWhatsApp={settings.shop_whatsapp}
        schedule={schedule}
      />

      <main className="container-public flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <Image
          src="/logo.png"
          alt=""
          width={491}
          height={498}
          className="h-[72px] w-auto"
        />
        <h1 className="h-section mt-8 text-balance">{dict.notFound.heading}</h1>
        <p className="mt-4 text-[1.0625rem] text-ink-muted leading-[1.7]">
          {dict.notFound.line}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.95rem]">
          {LINKS.map((l, i) => (
            <span key={l.href} className="inline-flex items-center gap-4">
              {i > 0 && (
                <span aria-hidden className="text-ink-faint">
                  ·
                </span>
              )}
              <Link href={l.href} className="link-underline link-plum">
                {dict.notFound[l.key]}
              </Link>
            </span>
          ))}
        </div>

        <a
          href={whatsappLink(settings.shop_whatsapp, 'Hello, I have a question.')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-teal mt-8"
        >
          <WhatsAppGlyph className="h-4 w-4" />
          {dict.notFound.whatsappCta}
        </a>
      </main>

      <SiteFooter settings={settings} schedule={schedule} dict={dict} locale={locale} />
      </div>
    </LanguageProvider>
  );
}
