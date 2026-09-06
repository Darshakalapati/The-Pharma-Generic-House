import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, MapPin, ArrowRight } from 'lucide-react';
import { IMG } from '@/lib/images';
import { getDictionary, getLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title:
    'Our Story — A Neighbourhood Pharmacy in Governerpeta | The Pharma Generic House',
  description:
    'How The Pharma Generic House came to serve Governerpeta, Vijayawada — genuine medicines, honest advice, and the same faces behind the counter.',
  path: '/about',
});


export default function AboutPage() {
  const dict = getDictionary(getLocale());
  const VALUES = dict.about.values.map((v, i) => ({
    icon: [ShieldCheck, HeartHandshake, MapPin][i],
    ...v,
  }));
  return (
    <>
      {/* Hero */}
      <section className="container-public pt-12 sm:pt-16 pb-8">
        <div className="max-w-3xl">
          <span className="eyebrow">{dict.about.eyebrow}</span>
          <h1 className="h-hero mt-4 text-balance">
            {dict.about.heading}
          </h1>
        </div>
      </section>

      {/* Long-form narrative — single column, max 65ch */}
      <section className="container-public mt-10 sm:mt-14">
        <div className="max-w-narrow mx-auto">
          <p className="text-[1.0625rem] leading-[1.8] text-ink">
            {dict.about.p1}
          </p>
          <p className="mt-5 text-[1.0625rem] leading-[1.8] text-ink-muted">
            {dict.about.p2}
          </p>
          <p className="mt-5 text-[1.0625rem] leading-[1.8] text-ink-muted">
            {dict.about.p3}
          </p>
          <p className="mt-5 text-[1.0625rem] leading-[1.8] text-ink-muted">
            {dict.about.p4}
          </p>
          <p className="mt-5 text-[1.0625rem] leading-[1.8] text-ink-muted">
            {dict.about.p5}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container-public mt-20 sm:mt-24">
        <div className="max-w-2xl">
          <span className="eyebrow">{dict.about.valuesEyebrow}</span>
          <h2 className="h-section mt-4">{dict.about.valuesHeading}</h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="card-soft p-7">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-plum-tint text-plum">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="h-card mt-5">{v.title}</h3>
              <p className="mt-2 text-[0.95rem] text-ink-muted leading-[1.65]">
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Full-bleed photo */}
      <section className="mt-20 sm:mt-28 border-y border-line">
        <div className="relative aspect-[16/7] bg-sand overflow-hidden">
          <Image
            src={IMG.pharmacy.interior}
            alt={dict.aboutTeaser.photoAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container-public mt-20 sm:mt-24 pb-16">
        <div className="max-w-narrow mx-auto text-center">
          <h2 className="h-section">{dict.about.closingHeading}</h2>
          <p className="mt-4 text-[1.0625rem] text-ink-muted leading-[1.7]">
            {dict.about.closingBody}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-plum">
              {dict.about.contactUs}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="link-underline link-plum text-[0.95rem]"
            >
              {dict.about.browseShelves}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
