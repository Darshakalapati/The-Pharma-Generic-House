import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  title,
  count,
  href,
  icon: Icon,
  tone = 'purple',
  accent = false,
}: {
  title: string;
  count: number;
  href: string;
  icon: LucideIcon;
  tone?: 'purple' | 'teal';
  /** Plum border for the one card that means somebody is waiting on us. */
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'surface-card p-5 sm:p-6 hover:shadow-card transition-shadow flex flex-col',
        accent && 'border-brand-purple'
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'grid h-10 w-10 place-items-center rounded-xl',
            tone === 'purple'
              ? 'bg-brand-purple/10 text-brand-purple'
              : 'bg-brand-teal/10 text-brand-teal-deep'
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {count > 0 && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-semibold',
              tone === 'purple'
                ? 'bg-brand-purple/10 text-brand-purple'
                : 'bg-brand-teal/15 text-brand-teal-deep'
            )}
          >
            New
          </span>
        )}
      </div>
      <p className="mt-5 font-serif text-4xl font-semibold tracking-tighter2 tabular-nums">
        {count}
      </p>
      <p className="text-sm text-brand-muted">{title}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-purple">
        View all <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
