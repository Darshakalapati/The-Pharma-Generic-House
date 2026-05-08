import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';
import { WhatsAppFloat } from '@/components/public/whatsapp-float';
import { AnnouncementBanner } from '@/components/public/announcement-banner';
import { getShopSettings } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import type { Announcement } from '@/lib/types';

async function getActiveAnnouncement(): Promise<Announcement | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return (data as Announcement | null) ?? null;
  } catch {
    return null;
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, announcement] = await Promise.all([
    getShopSettings(),
    getActiveAnnouncement(),
  ]);

  return (
    <div className="bg-bg text-ink">
      <AnnouncementBanner announcement={announcement} />
      <SiteNav shopPhone={settings.shop_phone} shopWhatsApp={settings.shop_whatsapp} />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsAppFloat phone={settings.shop_whatsapp} />
    </div>
  );
}
