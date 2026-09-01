import { PageHeader } from '@/components/admin/page-header';
import { FaqsManager } from '@/components/admin/faqs-manager';
import { createClient } from '@/lib/supabase/server';
import type { Faq } from '@/lib/types';

export const metadata = { title: 'FAQs' };

export default async function AdminFaqsPage() {
  const supabase = createClient();
  const { data } = await supabase.from('faqs').select('*');

  return (
    <div>
      <PageHeader
        title="FAQs"
        description="Questions and answers shown on the home page. Telugu versions are optional — when blank, the English text is shown to Telugu readers too."
      />
      <FaqsManager faqs={(data as Faq[] | null) ?? []} />
    </div>
  );
}
