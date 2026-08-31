import { PageHeader } from '@/components/admin/page-header';
import { SettingsForm } from '@/components/admin/settings-form';
import { getShopSettings, getSchedule } from '@/lib/settings';

export const metadata = { title: 'Settings' };

export default async function AdminSettingsPage() {
  const [settings, schedule] = await Promise.all([getShopSettings(), getSchedule()]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Update shop info and toggle customer-facing features."
      />
      <SettingsForm settings={settings} schedule={schedule} />
    </div>
  );
}
