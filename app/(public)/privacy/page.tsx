import { SHOP_EMAIL, SHOP_PHONE } from '@/lib/constants';
import { getDictionary, getLocale } from '@/lib/i18n';

export const metadata = {
  title: 'Privacy',
  description:
    'What The Pharma Generic House collects, why, and how to have your information removed.',
};

const UPDATED = '17 August 2026';

export default function PrivacyPage() {
  const dict = getDictionary(getLocale());
  return (
    <>
      <section className="container-public pt-12 sm:pt-16 pb-8">
        <div className="max-w-3xl">
          <span className="eyebrow">{dict.legal.eyebrow}</span>
          <h1 className="h-hero mt-4 text-balance">{dict.legal.privacyTitle}</h1>
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
          <Block title="What we collect">
            <p>
              We only collect what you type into a form on this website. Depending on the
              form, that is your name, phone number, an optional email address, your age,
              an address when you ask for home sample collection, the message you write,
              and the list of products you add to an enquiry.
            </p>
            <p>
              We do not ask for and do not store medical records, prescriptions, or
              payment details on this website.
            </p>
          </Block>

          <Block title="Why we collect it">
            <p>
              Solely to reply to you and to fulfil what you asked for — confirming an
              appointment, arranging a lab test, checking whether a medicine is in stock,
              or answering a message. We do not sell it, rent it, or use it for
              advertising.
            </p>
          </Block>

          <Block title="Where it is stored">
            <p>
              Form submissions are stored in our database, hosted by Supabase. Access is
              limited to the shop.
            </p>
          </Block>

          <Block title="WhatsApp, maps, and reviews">
            <p>
              Buttons marked WhatsApp open WhatsApp on your own device with a message
              already typed. Nothing is sent until you press send, and we receive only
              what you choose to send.
            </p>
            <p>
              The contact page embeds a Google Maps view of the shop, and some pages link
              to our Google reviews. Google may set its own cookies and collect data when
              those load — that is governed by Google&apos;s privacy policy, not ours.
            </p>
          </Block>

          <Block title="Cookies and local storage">
            <p>
              We use no advertising or tracking cookies. Your browser&apos;s local storage
              holds two things: the enquiry list you build while browsing products, and a
              note of which announcement banner you have dismissed. Both stay on your
              device and can be cleared at any time from your browser settings.
            </p>
          </Block>

          <Block title="Payments">
            <p>
              No payments are taken on this website. Anything you buy is paid for at the
              shop.
            </p>
          </Block>

          <Block title="Keeping and deleting your information">
            <p>
              We keep enquiries and bookings for as long as we need them to serve you and
              to keep our own records. If you want your information removed, message or
              call us and we will delete it.
            </p>
          </Block>

          <Block title="Contact">
            <p>
              Questions about this policy, or a request to delete your information:{' '}
              <a href={`mailto:${SHOP_EMAIL}`} className="link-underline link-plum">
                {SHOP_EMAIL}
              </a>{' '}
              or {SHOP_PHONE}.
            </p>
          </Block>

          <Block title="Governing law">
            <p>This policy is governed by the laws of India.</p>
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
