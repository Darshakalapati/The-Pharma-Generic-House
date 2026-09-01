'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { getMapsUrl, SHOP_ADDRESS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Faq } from '@/lib/types';
import type { Locale } from '@/lib/i18n/types';

/**
 * One question open at a time, with a real height transition.
 *
 * Heights are measured from the content rather than animated to `auto`, which
 * CSS cannot interpolate — so the panel opens smoothly at any answer length.
 */
export function FaqAccordion({ faqs, locale }: { faqs: Faq[]; locale: Locale }) {
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div className="border-t border-line">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        // Fall back to English whenever a Telugu field is empty.
        const question = (locale === 'te' && faq.question_te?.trim()) || faq.question;
        const answer = (locale === 'te' && faq.answer_te?.trim()) || faq.answer;

        return (
          <div key={faq.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              aria-expanded={isOpen}
              className="flex w-full items-start gap-4 py-5 text-left"
            >
              <span className="min-w-0 flex-1 font-serif font-medium text-[1.125rem] leading-snug text-ink">
                {question}
              </span>
              <ChevronDown
                className={cn(
                  'mt-1 h-4 w-4 shrink-0 text-plum transition-transform duration-300',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <AnswerPanel open={isOpen}>
              <p className="pb-5 pr-8 text-[1rem] leading-[1.7] text-ink-muted">
                <AnswerText text={answer} />
              </p>
            </AnswerPanel>
          </div>
        );
      })}
    </div>
  );
}

function AnswerPanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    if (!ref.current) return;
    const measure = () => setHeight(ref.current?.scrollHeight ?? 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div
      className="overflow-hidden transition-[height,opacity] duration-300 ease-out"
      style={{ height: open ? height : 0, opacity: open ? 1 : 0 }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

/** Turns the shop address inside an answer into a Maps link. */
function AnswerText({ text }: { text: string }) {
  const idx = text.indexOf(SHOP_ADDRESS);
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <a
        href={getMapsUrl(SHOP_ADDRESS)}
        target="_blank"
        rel="noopener noreferrer"
        className="link-underline link-plum"
      >
        {SHOP_ADDRESS}
      </a>
      {text.slice(idx + SHOP_ADDRESS.length)}
    </>
  );
}
