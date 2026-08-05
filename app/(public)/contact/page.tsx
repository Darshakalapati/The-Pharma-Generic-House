import { Phone, MapPin, ArrowRight, Clock } from 'lucide-react';
import { ContactForm } from '@/components/public/contact-form';
import { WhatsAppGlyph } from '@/components/public/whatsapp-glyph';
import { getShopSettings } from '@/lib/settings';
import { whatsappLink, telLink } from '@/lib/utils';
import { SHOP_EMAIL, SHOP_HOURS_DETAILED } from '@/lib/constants';

export const metadata = {
  title: 'Contact',
  description:
    'Reach The Pharma Generic House by phone, WhatsApp, or visit our shop in Vijayawada.',
};

export default async function ContactPage() {
  const settings = await getShopSettings();
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    settings.shop_address
  )}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    settings.shop_address
  )}&output=embed`;

  return (
    <>
      {/* Hero */}
      <section className="container-public pt-12 sm:pt-16 pb-8">
        <div className="max-w-2xl">
          <span className="eyebrow">Get in touch</span>
          <h1 className="h-hero mt-4 text-balance">Reach us anytime.</h1>
          <p className="mt-5 text-[1.0625rem] text-ink-muted leading-[1.7]">
            We respond quickly. Call, message, or come to the shop.
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
            <p className="eyebrow mt-5">Call us</p>
            <p className="mt-2 font-serif font-medium text-[1.25rem] tracking-[-0.005em] break-all">
              {settings.shop_phone}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[0.875rem] font-medium text-plum">
              Tap to call
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
            <p className="eyebrow eyebrow--teal mt-5">Message on WhatsApp</p>
            <p className="mt-2 font-serif font-medium text-[1.25rem] tracking-[-0.005em] break-all">
              {settings.shop_phone}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[0.875rem] font-medium text-teal-deep">
              Open chat
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-soft p-7 group"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-plum-tint text-plum">
              <MapPin className="h-5 w-5" />
            </span>
            <p className="eyebrow mt-5">Come to the shop</p>
            <p className="mt-2 font-serif font-medium text-[1.0625rem] tracking-[-0.005em] leading-snug">
              {settings.shop_address}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-[0.875rem] font-medium text-plum">
              Get directions
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </section>

      {/* Contact form */}
      <section className="container-public mt-20 sm:mt-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-5">
            <span className="eyebrow">Send a message</span>
            <h2 className="h-section mt-4">Send us a message.</h2>
            <p className="mt-5 text-[1rem] text-ink-muted leading-[1.7]">
              We&apos;ll reply on WhatsApp or by phone within a few hours during shop
              hours. For urgent needs, please call directly.
            </p>

            <div className="mt-8">
              <p className="inline-flex items-center gap-2 eyebrow">
                <Clock className="h-4 w-4 text-plum" />
                Shop hours
              </p>
              <dl className="mt-4 border-t border-line">
                {SHOP_HOURS_DETAILED.map((row) => {
                  const isSunday = row.day === 'Sunday';
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
                            Test day
                          </span>
                        )}
                      </dt>
                      <dd
                        className={
                          isSunday
                            ? 'text-[0.95rem] font-medium text-teal-deep'
                            : 'text-[0.95rem] text-ink-muted'
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
            title="Map showing The Pharma Generic House location"
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
