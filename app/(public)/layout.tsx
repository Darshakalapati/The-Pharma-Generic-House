import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';
import { WhatsAppFloat } from '@/components/public/whatsapp-float';
import { MobileActionBar } from '@/components/public/mobile-action-bar';
import { PageWipe } from '@/components/public/motion/page-wipe';
import { AnnouncementBanner } from '@/components/public/announcement-banner';
import { PublicMain } from '@/components/public/motion/public-main';
import { getShopSettings, getSchedule } from '@/lib/settings';
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
  const [settings, announcement, schedule] = await Promise.all([
    getShopSettings(),
    getActiveAnnouncement(),
    getSchedule(),
  ]);

  return (
    // `site-grain` lays a fixed paper-grain overlay over the public site only —
    // the admin panel uses its own root and stays clean.
    <div className="site-grain bg-bg text-ink">
      <AnnouncementBanner announcement={announcement} />
      <SiteNav shopPhone={settings.shop_phone} shopWhatsApp={settings.shop_whatsapp} schedule={schedule} />
      <PublicMain>{children}</PublicMain>
      <SiteFooter settings={settings} schedule={schedule} />
      <WhatsAppFloat phone={settings.shop_whatsapp} />
      <MobileActionBar phone={settings.shop_phone} whatsapp={settings.shop_whatsapp} />
      <PageWipe />
    </div>
  );
}
