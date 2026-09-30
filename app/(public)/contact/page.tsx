import { Phone, MapPin, ArrowRight, Clock } from 'lucide-react';
import { ContactForm } from '@/components/public/contact-form';
import { WhatsAppGlyph } from '@/components/public/whatsapp-glyph';
import { getShopSettings, getSchedule } from '@/lib/settings';
import { whatsappLink, telLink } from '@/lib/utils';
import { SHOP_EMAIL, SHOP_ADDRESS_LINES, getMapsUrl } from '@/lib/constants';
import { formatHoursDetailed } from '@/lib/hours';
import { OpenStatus } from '@/components/public/open-status';
import { CallbackBand } from '@/components/public/callback-band';
import { getDictionary, getLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title:
    'Contact & Directions — Governerpeta, Vijayawada | The Pharma Generic House',
  description:
    'Call, WhatsApp or visit us opposite Golden Pavilion, Governerpeta, Vijayawada. Opening hours, directions and a message form.',
  path: '/contact',
});

export default async function ContactPage() {
  const dict = getDictionary(getLocale());
  const [settings, schedule] = await Promise.all([getShopSettings(), getSchedule()]);
  const hoursRows = formatHoursDetailed(schedule, dict);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    settings.shop_address
  )}&output=embed`;

  return (
    <>
      {/* Hero */}
      <section className="container-public pt-12 sm:pt-16 pb-8">
        <div className="max-w-2xl">
          <span className="eyebrow">{dict.contact.eyebrow}</span>
          <h1 className="h-hero mt-4 text-balance">{dict.contact.heading}</h1>
          <p className="mt-5 text-[1.0625rem] text-ink-muted leading-[1.7]">
            {dict.contact.sub}
          </p>
        </div>
      </section>

      {/* Three contact cards */}
      <section className="container-public mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a href={telLink(settings.shop_phone)} className="card-soft p-7 group">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-plum-tint text-plum">
              <Phone className="h-5 w-5" />
            </span>
            <p className="eyebrow mt-5">{dict.contact.callUsEyebrow}</p>
            <p className="mt-2 font-serif font-medium text-[1.25rem] tracking-[-0.005em] break-all">
              {settings.shop_phone}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[0.875rem] font-medium text-plum">
              {dict.contact.tapToCall}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          <a
            href={whatsappLink(settings.shop_whatsapp, 'Hello, I have a question.')}
            target="_blank"
            rel="noopener noreferrer"
            className="card-soft p-7 group"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-teal-tint text-teal-deep">
              <WhatsAppGlyph className="h-5 w-5" />
            </span>
            <p className="eyebrow eyebrow--teal mt-5">{dict.contact.whatsappMsgEyebrow}</p>
            <p className="mt-2 font-serif font-medium text-[1.25rem] tracking-[-0.005em] break-all">
              {settings.shop_phone}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[0.875rem] font-medium text-teal-deep">
              {dict.contact.openChat}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          <a
            href={getMapsUrl(settings.shop_address)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={dict.contact.openInMaps}
            className="card-soft p-7 group"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-plum-tint text-plum">
              <MapPin className="h-5 w-5" />
            </span>
            <p className="eyebrow mt-5">{dict.contact.visitEyebrow}</p>
            <p className="mt-2 font-serif font-medium text-[1.0625rem] tracking-[-0.005em] leading-snug">
              {SHOP_ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[0.875rem] font-medium text-plum">
              {dict.contact.getDirections}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </section>

      {/* Order on call */}
      <CallbackBand
        phone={settings.shop_phone}
        schedule={schedule}
        className="mt-16 sm:mt-20"
      />

      {/* Contact form */}
      <section className="container-public mt-20 sm:mt-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-5">
            <span className="eyebrow">{dict.contact.sendEyebrow}</span>
            <h2 className="h-section mt-4">{dict.contact.sendHeading}</h2>
            <p className="mt-5 text-[1rem] text-ink-muted leading-[1.7]">
              {dict.contact.sendSub}
            </p>

            <div id="hours" className="mt-8 scroll-mt-28">
              <div className="flex flex-wrap items-center gap-3">
                <p className="inline-flex items-center gap-2 eyebrow">
                  <Clock className="h-4 w-4 text-plum" />
                  {dict.contact.shopHours}
                </p>
                <OpenStatus schedule={schedule} />
              </div>
              <dl className="mt-4 border-t border-line">
                {hoursRows.map((row) => {
                  const isSunday = row.isSunday;
                  return (
                    <div
                      key={row.day}
                      className="flex items-baseline justify-between gap-4 py-3 border-b border-line"
                    >
                      <dt
                        className={
                          isSunday
                            ? 'text-[0.95rem] font-medium text-teal-deep'
                            : 'text-[0.95rem] text-ink'
                        }
                      >
                        {row.day}
                        {isSunday && (
                          <span className="ml-2 eyebrow eyebrow--teal text-[0.65rem]">
                            {dict.diagnostics.testDay}
                          </span>
                        )}
                      </dt>
                      <dd
                        className={
                          isSunday
                            ? 'text-[0.95rem] font-medium text-teal-deep whitespace-nowrap'
                            : 'text-[0.95rem] text-ink-muted whitespace-nowrap'
                        }
                      >
                        {row.hours}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="card-soft p-6 sm:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="container-public mt-20 sm:mt-24 pb-16">
        <div className="rounded-2xl overflow-hidden border border-line">
          <iframe
            title={dict.contact.mapTitle}
            src={mapEmbedUrl}
            className="h-[360px] sm:h-[420px] w-full border-0 map-soft"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
