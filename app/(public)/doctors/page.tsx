import { createClient } from '@/lib/supabase/server';
import { getShopSettings } from '@/lib/settings';
import { getDictionary, getLocale } from '@/lib/i18n';
import { DoctorList } from '@/components/public/doctor-list';
import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import type { Doctor } from '@/lib/types';

export const metadata = {
  title: 'Doctors',
  description:
    'Book consultations with our resident Nadi specialist, physiotherapist, or homeopath at The Pharma Generic House.',
};

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams?: { book?: string; date?: string; time?: string };
}) {
  const dict = getDictionary(getLocale());
  const supabase = createClient();
  const settings = await getShopSettings();

  const { data } = await supabase
    .from('doctors')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  const doctors: Doctor[] = data ?? [];

  return (
    <>
      <ScrollReveal as="section" className="container-public pt-12 sm:pt-16 pb-8">
        <ScrollRevealItem as="div" className="max-w-2xl">
          <span className="eyebrow">{dict.doctors.pageEyebrow}</span>
          <h1 className="h-hero mt-4 text-balance">{dict.doctors.pageHeading}</h1>
          <p className="mt-5 text-[1.0625rem] text-ink-muted leading-[1.7]">
            {dict.doctors.pageSub}
          </p>
        </ScrollRevealItem>
      </ScrollReveal>

      <ScrollReveal as="section" className="container-public mt-6 sm:mt-10 pb-16">
        <ScrollRevealItem>
          <DoctorList
            doctors={doctors}
            whatsappNumber={settings.shop_whatsapp}
            openDoctorId={searchParams?.book}
            openDate={searchParams?.date}
            openTime={searchParams?.time}
          />
        </ScrollRevealItem>
      </ScrollReveal>
    </>
  );
}
