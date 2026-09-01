'use client';

import * as React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { WhatsAppGlyph } from './whatsapp-glyph';
import { useT } from './i18n/language-provider';
import { getOpenStatus, formatClock, type Schedule } from '@/lib/hours';
import { whatsappLink, cn } from '@/lib/utils';
import { PRESCRIPTION_WA_TEXT, PRESCRIPTION_WA_TEXT_TE } from '@/lib/constants';

interface HelperValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const Ctx = React.createContext<HelperValue | null>(null);

/** Lets the float, the sticky bar and the dock tile all trigger the same card. */
export function useWhatsAppHelper(): HelperValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error('useWhatsAppHelper must be used within WhatsAppHelperProvider');
  return ctx;
}

/**
 * A short triage step in front of WhatsApp.
 *
 * Sending someone straight to an empty chat makes them compose the first
 * message themselves; offering three prefilled intents means most people
 * arrive in the shop's inbox already saying what they need. The card also
 * states whether anyone is actually there, so an out-of-hours message comes
 * with the right expectation rather than silence.
 */
export function WhatsAppHelperProvider({
  whatsapp,
  schedule,
  replyNote,
  children,
}: {
  whatsapp: string;
  schedule: Schedule;
  /** Admin override; when set it is shown in both languages. */
  replyNote: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const value = React.useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <HelperCard whatsapp={whatsapp} schedule={schedule} replyNote={replyNote} />
    </Ctx.Provider>
  );
}

function HelperCard({
  whatsapp,
  schedule,
  replyNote,
}: {
  whatsapp: string;
  schedule: Schedule;
  replyNote: string;
}) {
  const { dict, locale } = useT();
  const { isOpen, close } = useWhatsAppHelper();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = React.useState<ReturnType<typeof getOpenStatus> | null>(null);
  const [nextOpen, setNextOpen] = React.useState<string>('');

  React.useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    setStatus(getOpenStatus(schedule, now, dict));
    // The opening time to quote when we're shut.
    const today = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
    }).format(now);
    const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
    const idx = order.indexOf(today.toLowerCase().slice(0, 3) as (typeof order)[number]);
    for (let step = 0; step <= 7; step++) {
      const day = schedule[order[(Math.max(0, idx) + step) % 7]];
      if (day && !day.closed && day.open) {
        setNextOpen(formatClock(day.open));
        break;
      }
    }
  }, [isOpen, schedule, dict]);

  // Esc and click-outside both close.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    // Deferred so the click that opened the card doesn't immediately close it.
    const id = window.setTimeout(() => document.addEventListener('click', onClick), 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
      window.clearTimeout(id);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  const rxText = locale === 'te' ? PRESCRIPTION_WA_TEXT_TE : PRESCRIPTION_WA_TEXT;
  const isOnline = status?.state === 'open' || status?.state === 'closing-soon';
  const note = replyNote.trim() || dict.whatsappHelper.replyNoteDefault;

  const chips: { label: string; message: string }[] = [
    { label: dict.whatsappHelper.chipOrder, message: rxText },
    { label: dict.whatsappHelper.chipTest, message: dict.whatsappHelper.msgTest },
    { label: dict.whatsappHelper.chipDoctor, message: dict.whatsappHelper.msgDoctor },
  ];

  return (
    <>
      {/* Scrim on phones, where the card becomes a bottom sheet. */}
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-ink/30 md:hidden"
        onClick={close}
      />
      <div
        ref={ref}
        role="dialog"
        aria-label={dict.whatsappHelper.openHelper}
        className={cn(
          'fixed z-[45] border border-line bg-bg-elevated shadow-elevated',
          'animate-in fade-in zoom-in-95 duration-200',
          // Bottom sheet on phones, anchored card above the float on desktop.
          'inset-x-0 bottom-0 rounded-t-2xl p-5',
          'md:inset-x-auto md:bottom-24 md:right-5 md:w-[320px] md:rounded-2xl'
        )}
        style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="" width={491} height={498} className="h-7 w-auto shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-serif font-medium text-[0.9375rem] leading-tight">
              The Pharma Generic House
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[0.75rem] text-ink-muted">
              <span
                aria-hidden
                className={cn(
                  'block h-1.5 w-1.5 shrink-0 rounded-full',
                  isOnline ? 'bg-teal' : 'bg-ink-faint'
                )}
              />
              {isOnline
                ? dict.whatsappHelper.online
                : dict.whatsappHelper.offlineAt.replace('{time}', nextOpen)}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={dict.whatsappHelper.close}
            className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-sand hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-[0.9375rem] text-ink">{dict.whatsappHelper.greeting}</p>
        <p className="mt-1 text-[0.8125rem] text-ink-muted">{note}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <a
              key={chip.label}
              href={whatsappLink(whatsapp, chip.message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="rounded-full border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-plum hover:text-plum"
            >
              {chip.label}
            </a>
          ))}
        </div>

        <a
          href={whatsappLink(whatsapp, dict.whatsappHelper.msgGeneric)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="btn-teal mt-4 w-full"
        >
          <WhatsAppGlyph className="h-4 w-4" />
          {dict.whatsappHelper.startChat}
        </a>
      </div>
    </>
  );
}
