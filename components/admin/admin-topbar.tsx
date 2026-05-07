import { Bell } from 'lucide-react';

export function AdminTopbar({
  email,
  newCount,
}: {
  email: string;
  newCount: number;
}) {
  return (
    <div className="hidden lg:flex h-16 items-center justify-between border-b border-brand-line bg-white px-6">
      <div>
        <p className="text-sm text-brand-muted">Welcome back</p>
        <p className="text-base font-medium text-brand-ink">{email}</p>
      </div>
      <div className="relative">
        <Bell className="h-5 w-5 text-brand-muted" />
        {newCount > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-purple px-1 text-[11px] font-semibold text-brand-cream">
            {newCount}
          </span>
        )}
      </div>
    </div>
  );
}
