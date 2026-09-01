import { SHOP_EMAIL, SHOP_PHONE } from '@/lib/constants';
import { getDictionary, getLocale } from '@/lib/i18n';

export const metadata = {
  title: 'Terms',
  description:
    'The terms on which The Pharma Generic House provides this website, enquiries, appointments, and lab test bookings.',
};

const UPDATED = '17 August 2026';

export default function TermsPage() {
  const dict = getDictionary(getLocale());
  return (
    <>
      <section className="container-public pt-12 sm:pt-16 pb-8">
        <div className="max-w-3xl">
          <span className="eyebrow">{dict.legal.eyebrow}</span>
          <h1 className="h-hero mt-4 text-balance">{dict.legal.termsTitle}</h1>
          <p className="mt-5 text-[1.0625rem] text-ink-muted leading-[1.7]">
            Last updated: {UPDATED}
          </p>
          {dict.legal.teNotice && (
            <p className="mt-4 rounded-xl border border-line bg-bg-elevated px-4 py-3 text-[0.9375rem] text-ink-muted">
              {dict.legal.teNotice}
            </p>
          )}
        </div>
      </section>

      <section className="container-public mt-6 sm:mt-10 pb-16">
        <div className="max-w-narrow mx-auto">
          <Block title="This website is informational">
            <p>
              It tells you what we stock, which doctors visit, and which lab tests we can
              arrange. It is not an online store, and nothing here is an offer to sell.
            </p>
          </Block>

          <Block title="Enquiries are not orders">
            <p>
              Adding products to an enquiry and sending it to us starts a conversation. It
              is not a confirmed order and it does not reserve stock. An order exists only
              once the shop has replied and confirmed it.
            </p>
          </Block>

          <Block title="Prices and availability">
            <p>
              Prices and stock shown on this website are indicative and are confirmed at
              the shop. They can change without notice.
            </p>
          </Block>

          <Block title="Prescription medicines">
            <p>
              Prescription medicines are dispensed in person, at the shop, only against a
              valid prescription from a registered medical practitioner. Sending us a
              photograph of a prescription helps us check availability and price — it is
              not itself a purchase, and it does not oblige us to dispense.
            </p>
          </Block>

          <Block title="Appointments and lab tests">
            <p>
              Appointment and test bookings made here are requests. We confirm each one
              by phone or WhatsApp. Visiting doctors keep their own schedules, which can
              change.
            </p>
            <p>
              Lab tests are collected on our premises or at your home and are processed by
              ThyroCare. We are an associate of ThyroCare, not the testing laboratory.
              Results, their accuracy, and their turnaround are ThyroCare&apos;s.
            </p>
          </Block>

          <Block title="Not medical advice">
            <p>
              Nothing on this website is medical advice or a diagnosis. Our staff can help
              you understand what a doctor has prescribed, but always consult a qualified
              practitioner about your own condition or treatment.
            </p>
          </Block>

          <Block title="Intellectual property">
            <p>
              The name, logo, text, photographs, and design of this website belong to The
              Pharma Generic House and may not be copied or reused without permission.
            </p>
          </Block>

          <Block title="Limitation of liability">
            <p>
              We take care to keep this website accurate, but we do not guarantee it is
              free of errors or always available. To the extent permitted by law, we are
              not liable for loss arising from relying on information published here.
              Nothing in these terms limits liability that cannot be limited by law.
            </p>
          </Block>

          <Block title="Contact">
            <p>
              Questions about these terms:{' '}
              <a href={`mailto:${SHOP_EMAIL}`} className="link-underline link-plum">
                {SHOP_EMAIL}
              </a>{' '}
              or {SHOP_PHONE}.
            </p>
          </Block>

          <Block title="Governing law">
            <p>These terms are governed by the laws of India.</p>
          </Block>
        </div>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-8 mt-8 first:border-t-0 first:pt-0 first:mt-0">
      <h2 className="font-serif font-medium text-[1.375rem] tracking-[-0.015em]">{title}</h2>
      <div className="mt-3 space-y-4 text-[1.0625rem] leading-[1.8] text-ink-muted">
        {children}
      </div>
    </div>
  );
}
