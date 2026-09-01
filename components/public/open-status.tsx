'use client';

import * as React from 'react';
import { getOpenStatus, type Schedule } from '@/lib/hours';
import { useT } from './i18n/language-provider';
import { cn } from '@/lib/utils';

const REFRESH_MS = 60_000;

/**
 * Live "Open now" pill.
 *
 * The status is computed from wall-clock time in Asia/Kolkata, never the
 * visitor's own zone — a customer in London still sees whether the shop in
 * Vijayawada is open. It renders nothing until after mount, because the server
 * and the client would otherwise disagree about "now" and React would flag a
 * hydration mismatch.
 */
export function OpenStatus({
  schedule,
  className,
  compact = false,
}: {
  schedule: Schedule;
  className?: string;
  /** Laptop tier: shorten the label to keep the nav row on one line. The full
   *  wording stays in the title attribute so nothing is lost. */
  compact?: boolean;
}) {
  const { dict } = useT();
  const [status, setStatus] = React.useState<ReturnType<typeof getOpenStatus> | null>(
    null
  );

  React.useEffect(() => {
    const tick = () => setStatus(getOpenStatus(schedule, new Date(), dict));
    tick();
    const id = window.setInterval(tick, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [schedule, dict]);

  if (!status) return null;

  // "Open now · closes 10 PM" -> "Open · 10 PM"; the other states drop their
  // trailing detail entirely.
  const compactLabel =
    status.state === 'open'
      ? status.label.replace(/^([^·]+)·\s*\S+\s*/, (_m, head) => `${head.trim().split(' ')[0]} · `)
      : status.label.split('·')[0].trim();

  const dotClass =
    status.state === 'open'
      ? 'bg-teal'
      : status.state === 'closing-soon'
        ? 'bg-[#D4A24C]'
        : 'bg-ink-faint';

  return (
    <span
      title={status.label}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-line',
        'px-2.5 py-1 text-[0.8125rem] font-medium text-ink-muted whitespace-nowrap',
        className
      )}
    >
      <span aria-hidden className={cn('block h-2 w-2 rounded-full shrink-0', dotClass)} />
      {compact ? (
        <>
          <span className="xl:hidden">{compactLabel}</span>
          <span className="hidden xl:inline">{status.label}</span>
        </>
      ) : (
        status.label
      )}
    </span>
  );
}
