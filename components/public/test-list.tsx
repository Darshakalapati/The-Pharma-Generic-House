'use client';

import * as React from 'react';
import { useT } from './i18n/language-provider';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { TestBookingDialog } from './test-booking-dialog';
import { formatINR } from '@/lib/utils';
import { StaggerGrid, StaggerGridItem } from '@/components/public/motion/scroll-reveal';
import type { MedicalTest } from '@/lib/types';

export function TestList({
  tests,
  openTestId,
}: {
  tests: MedicalTest[];
  /** From /tests?book=<id> — used by search results to jump straight in. */
  openTestId?: string;
}) {
  const { dict } = useT();
  const [active, setActive] = React.useState<MedicalTest | null>(null);

  React.useEffect(() => {
    if (!openTestId) return;
    const match = tests.find((t) => t.id === openTestId);
    if (match) setActive(match);
  }, [openTestId, tests]);

  if (tests.length === 0) {
    return (
      <div className="card-soft p-12 text-center text-ink-muted">
        {dict.diagnostics.none}
      </div>
    );
  }

  return (
    <>
      <StaggerGrid inherit className="grid grid-cols-1 lg:grid-cols-2 gap-5" stagger={0.08}>
        {tests.map((t) => (
          <StaggerGridItem key={t.id} className="h-full">
          <article className="card-soft tap-settle p-7 flex flex-col h-full">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-teal-tint text-teal-deep shrink-0">
                <FlaskConical className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif font-medium text-[1.25rem] tracking-[-0.01em] leading-tight">
                  {t.name}
                </h3>
              </div>
            </div>
            {t.description && (
              <p className="mt-4 text-[0.95rem] text-ink-muted leading-[1.65]">
                {t.description}
              </p>
            )}

            <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
              {t.price != null && t.price > 0 ? (
                <p className="font-serif font-medium text-[1.125rem] text-plum">
                  {formatINR(t.price)}
                </p>
              ) : (
                <span className="text-[0.875rem] text-ink-muted">{dict.diagnostics.walkInFree}</span>
              )}
              <button
                onClick={() => setActive(t)}
                className="inline-flex items-center gap-1 text-[0.95rem] font-medium text-plum hover:text-plum-deep transition-colors"
              >
                {dict.diagnostics.bookTest}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </article>
          </StaggerGridItem>
        ))}
      </StaggerGrid>

      <TestBookingDialog
        test={active}
        open={!!active}
        onOpenChange={(v) => !v && setActive(null)}
      />
    </>
  );
}
