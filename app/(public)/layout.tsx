import { SiteNav } from '@/components/public/site-nav';
import { SiteFooter } from '@/components/public/site-footer';
import { WhatsAppFloat } from '@/components/public/whatsapp-float';
import { getShopSettings } from '@/lib/settings';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getShopSettings();

  return (
    <div className="bg-bg text-ink">
      <SiteNav shopPhone={settings.shop_phone} shopWhatsApp={settings.shop_whatsapp} />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter settings={settings} />
      <WhatsAppFloat phone={settings.shop_whatsapp} />
    </div>
  );
}
