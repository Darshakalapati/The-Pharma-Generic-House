'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CallbackForm } from './callback-form';
import { useT } from './i18n/language-provider';
import { telLink } from '@/lib/utils';
import type { Schedule } from '@/lib/hours';

const SEEN_KEY = 'callback_prompt_seen';
const SEEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TIME_TRIGGER_MS = 15_000;
const SCROLL_TRIGGER = 0.5;
/** How often to re-check once something is covering the screen. */
const RETRY_MS = 800;
const SUCCESS_CLOSE_MS = 3000;

/** True while a modal, sheet, search palette or mobile menu is on screen. */
function somethingIsOpen(): boolean {
  if (document.querySelector('[role="dialog"]')) return true;
  // The enquiry cart and the mobile nav lock the page instead of using a
  // dialog role, so scroll-lock is the second tell.
  return document.body.style.overflow === 'hidden';
}

/**
 * A non-blocking callback offer, shown at most once a week per browser.
 *
 * Deliberately not a modal: no backdrop, no scroll lock, no focus trap. The
 * page stays completely usable behind it, which is both kinder and what keeps
 * it clear of Google's intrusive-interstitial penalty.
 */
export function CallbackSlideIn({
  phone,
  schedule,
}: {
  phone: string;
  schedule: Schedule;
}) {
  const { dict } = useT();
  const reduced = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const settled = React.useRef(false);

  const remember = React.useCallback(() => {
    try {
      localStorage.setItem(SEEN_KEY, String(Date.now()));
    } catch {
      // Storage blocked — nothing to remember, and we've already shown once
      // this page view, so it won't reappear until a reload.
    }
  }, []);

  React.useEffect(() => {
    let seen = false;
    try {
      const raw = localStorage.getItem(SEEN_KEY);
      // Same expiry shape as the announcement banner: a stored timestamp that
      // lapses, so the offer can come back after a week rather than never.
      seen = !!raw && Date.now() - Number(raw) < SEEN_TTL_MS;
    } catch {
      // Treat unreadable storage as seen: better silent than nagging.
      seen = true;
    }
    if (seen) return;

    let timer: number | undefined;
    let retry: number | undefined;

    const reveal = () => {
      if (settled.current) return;
      // Wait out whatever is on top rather than stacking on it.
      if (somethingIsOpen()) {
        retry = window.setTimeout(reveal, RETRY_MS);
        return;
      }
      settled.current = true;
      cleanup();
      setOpen(true);
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_TRIGGER) reveal();
    };

    function cleanup() {
      window.removeEventListener('scroll', onScroll);
      if (timer) window.clearTimeout(timer);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    timer = window.setTimeout(reveal, TIME_TRIGGER_MS);

    return () => {
      cleanup();
      if (retry) window.clearTimeout(retry);
    };
  }, []);

  const dismiss = () => {
    remember();
    setOpen(false);
  };

  const [before, after] = dict.callback.slideSub.split('{phone}');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // Bottom-left on desktop, clear of the WhatsApp float at bottom-right;
          // full width above the sticky action bar on phones. z-[45] puts it
          // over the float and the bar but under every dialog.
          className="fixed inset-x-4 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] z-[45] rounded-2xl border border-line bg-bg-elevated p-5 shadow-elevated md:inset-x-auto md:bottom-5 md:left-5 md:w-[320px]"
          role="region"
          aria-label={dict.callback.slideHeading}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label={dict.callback.dismiss}
            className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-md text-ink-faint transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="pr-10 font-serif font-medium text-[1.0625rem] leading-snug tracking-[-0.01em] text-ink">
            {dict.callback.slideHeading}
          </h2>
          <p className="mt-1.5 text-[0.875rem] text-ink-muted leading-[1.55]">
            {before}
            <a
              href={telLink(phone)}
              className="font-medium text-plum whitespace-nowrap hover:text-plum-deep"
            >
              {phone}
            </a>
            {after}
          </p>

          <div className="mt-4">
            <CallbackForm
              source="slidein"
              schedule={schedule}
              layout="stacked"
              onSuccess={() => {
                remember();
                window.setTimeout(() => setOpen(false), SUCCESS_CLOSE_MS);
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
