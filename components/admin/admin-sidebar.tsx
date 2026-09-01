'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  ShoppingBag,
  MessageSquare,
  Pill,
  Stethoscope,
  Beaker,
  PlaySquare,
  Star,
  LayoutTemplate,
  Megaphone,
  Image as ImageIcon,
  Users,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from '@/components/public/logo';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/test-bookings', label: 'Test bookings', icon: Activity },
  { href: '/admin/enquiries', label: 'Product enquiries', icon: ShoppingBag },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/products', label: 'Products', icon: Pill, group: 'Manage' },
  { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/admin/tests', label: 'Tests', icon: Beaker },
  { href: '/admin/videos', label: 'Videos', icon: PlaySquare },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/hero-photos', label: 'Hero Photos', icon: ImageIcon },
  { href: '/admin/family', label: 'Family', icon: Users },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/promo-banners', label: 'Promo Banners', icon: LayoutTemplate },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
];

export function AdminSidebar({ counts }: { counts: { [k: string]: number } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const renderNav = () => (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {NAV.map((item, idx) => {
        const showGroup = item.group && (idx === 0 || NAV[idx - 1].group !== item.group);
        const count = counts[item.href] ?? 0;
        return (
          <React.Fragment key={item.href}>
            {showGroup && (
              <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                {item.group}
              </p>
            )}
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(item.href, item.exact)
                  ? 'bg-brand-purple text-brand-cream'
                  : 'text-brand-ink hover:bg-brand-cream-warm'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    'grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold',
                    isActive(item.href, item.exact)
                      ? 'bg-brand-cream text-brand-purple'
                      : 'bg-brand-teal/15 text-brand-teal-deep'
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          </React.Fragment>
        );
      })}
      <button
        onClick={signOut}
        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-ink hover:bg-brand-cream-warm"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between border-b border-brand-line bg-white px-4 h-14">
        <Logo />
        <button
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-brand-line"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden absolute inset-0 z-30 bg-brand-cream">
          {renderNav()}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-brand-line bg-white min-h-screen">
        <div className="px-5 h-16 flex items-center border-b border-brand-line">
          <Logo />
        </div>
        {renderNav()}
      </aside>
    </>
  );
}
