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
}: {
  schedule: Schedule;
  className?: string;
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

  const dotClass =
    status.state === 'open'
      ? 'bg-teal'
      : status.state === 'closing-soon'
        ? 'bg-[#D4A24C]'
        : 'bg-ink-faint';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-line',
        'px-2.5 py-1 text-[0.8125rem] font-medium text-ink-muted whitespace-nowrap',
        className
      )}
    >
      <span aria-hidden className={cn('block h-2 w-2 rounded-full shrink-0', dotClass)} />
      {status.label}
    </span>
  );
}
