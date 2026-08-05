import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, HeartHandshake, MapPin, ArrowRight } from 'lucide-react';
import { IMG } from '@/lib/images';

export const metadata = {
  title: 'About',
  description:
    'A trusted pharmacy in Vijayawada, with you for the long term. Trusted medicines, honest advice, and quality healthcare.',
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust',
    body: 'We stock only verified, properly sourced medicines from reputable suppliers.',
  },
  {
    icon: HeartHandshake,
    title: 'Care',
    body: 'Personal advice from people who know you by name. Not a chain. Not a website.',
  },
  {
    icon: MapPin,
    title: 'Access',
    body: 'Medicines, doctors, and lab tests — all in one place, in your neighbourhood.',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="container-public pt-12 sm:pt-16 pb-8">
        <div className="max-w-3xl">
          <span className="eyebrow">Our story</span>
          <h1 className="h-hero mt-4 text-balance">
            A trusted pharmacy, with you for the long term.
          </h1>
        </div>
      </section>

      {/* Long-form narrative — single column, max 65ch */}
      <section className="container-public mt-10 sm:mt-14">
        <div className="max-w-narrow mx-auto">
          <p className="text-[1.0625rem] leading-[1.8] text-ink">
            The Pharma Generic House began as a small neighbourhood medical store in
            Vijayawada with one simple goal — to make trusted medicines, honest advice,
            and quality healthcare accessible to everyone who walks in.
          </p>
          <p className="mt-5 text-[1.0625rem] leading-[1.8] text-ink-muted">
            Today, the shop is run by people who know most of their customers by
            name, remember which children need the cherry-flavoured cough syrup, and
            won&apos;t hesitate to suggest a generic when it works just as well as the
            brand.
          </p>
          <p className="mt-5 text-[1.0625rem] leading-[1.8] text-ink-muted">
            Our shelves carry general medicines for everyday needs, prescription pharma
            including cold-chain stored items, classical Ayurvedic preparations, and a
            curated selection of cosmetic and personal care brands — all chosen with
            care.
          </p>
          <p className="mt-5 text-[1.0625rem] leading-[1.8] text-ink-muted">
            Alongside the shelves, we host visiting doctors through the week — a Nadi
            specialist on Mondays, Wednesdays, and Fridays; a physiotherapist on
            Tuesdays, Thursdays, and Saturdays; and a homeopath available on request.
            Sundays are for diagnostics — a certified ThyroCare technician runs our
            Sunday Test Day from 9 AM to 1 PM, and can visit homes across Vijayawada on
            other days too.
          </p>
          <p className="mt-5 text-[1.0625rem] leading-[1.8] text-ink-muted">
            We&apos;re here for the long term — same shop, same people, same shelves
            you can rely on.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container-public mt-20 sm:mt-24">
        <div className="max-w-2xl">
          <span className="eyebrow">What we stand for</span>
          <h2 className="h-section mt-4">Three things we don&apos;t compromise on.</h2>
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
            alt="Inside The Pharma Generic House"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container-public mt-20 sm:mt-24 pb-16">
        <div className="max-w-narrow mx-auto text-center">
          <h2 className="h-section">Come visit, or send us a message.</h2>
          <p className="mt-4 text-[1.0625rem] text-ink-muted leading-[1.7]">
            We&apos;re open six days a week, with doctors on rotation through the week
            and a Sunday lab day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact" className="btn-plum">
              Contact us
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="link-underline link-plum text-[0.95rem]"
            >
              Browse the shelves →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
