import { PageHeader } from '@/components/admin/page-header';
import { SettingsForm } from '@/components/admin/settings-form';
import { getShopSettings } from '@/lib/settings';

export const metadata = { title: 'Settings' };

export default async function AdminSettingsPage() {
  const settings = await getShopSettings();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Settings"
        description="Update shop info and toggle customer-facing features."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
