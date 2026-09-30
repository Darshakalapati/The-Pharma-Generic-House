'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CallbackForm } from './callback-form';
import { useT } from './i18n/language-provider';
import { telLink } from '@/lib/utils';
import type { Schedule } from '@/lib/hours';

/**
 * sessionStorage, not localStorage: the offer is suppressed for the rest of
 * this visit only. A new session sees it again, so the session itself is the
 * expiry and there is no timestamp to reason about. Any value left behind by
 * the old localStorage key is never read.
 */
const DISMISSED_KEY = 'callback_prompt_dismissed';
const TIME_TRIGGER_MS = 15_000;
const SCROLL_TRIGGER = 0.5;
/** How often to re-check once something is covering the screen. */
const RETRY_MS = 800;
const SUCCESS_CLOSE_MS = 3000;
/** ?preview_callback=1 — lets the owner see the prompt without incognito. */
const PREVIEW_PARAM = 'preview_callback';
const PREVIEW_DELAY_MS = 1000;

/**
 * True while a modal, sheet, search palette or mobile menu is on screen.
 *
 * Presence of `[role="dialog"]` is NOT enough. BookingModal and
 * VideoPlayerModal both stay mounted when closed so they can animate out, and
 * mark themselves `aria-hidden="true"` with opacity 0 instead of unmounting.
 * Matching on the role alone meant the home page always looked "busy" and this
 * card could never appear — so each candidate has to be checked for whether it
 * is actually being presented.
 */
function somethingIsOpen(): boolean {
  const dialogs = document.querySelectorAll('[role="dialog"]');
  for (let i = 0; i < dialogs.length; i++) {
    const el = dialogs[i] as HTMLElement;
    // Hidden from the accessibility tree — mounted, but not presented.
    if (el.getAttribute('aria-hidden') === 'true') continue;
    // display:none, or detached from the layout entirely.
    if (el.getClientRects().length === 0) continue;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') continue;
    // Faded out rather than unmounted.
    if (Number(style.opacity) === 0) continue;
    return true;
  }
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
  // Set during the first effect, before anything can be dismissed, so the
  // dismiss handler knows whether it is allowed to write to storage.
  const preview = React.useRef(false);

  const remember = React.useCallback(() => {
    // Preview mode is for looking at the thing; recording that it was seen
    // would hide it from the visitor it was actually meant for.
    if (preview.current) return;
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Storage blocked — it stays hidden for this page view regardless, and
      // reappearing on the next navigation is a far smaller cost than never
      // showing at all.
    }
  }, []);

  React.useEffect(() => {
    // Read from location rather than useSearchParams: this is a one-off check
    // that belongs in an effect anyway, and it keeps the page off the
    // client-rendering bailout that hook forces.
    const isPreview =
      new URLSearchParams(window.location.search).get(PREVIEW_PARAM) === '1';
    preview.current = isPreview;

    if (!isPreview) {
      let dismissed = false;
      try {
        dismissed = sessionStorage.getItem(DISMISSED_KEY) === '1';
      } catch {
        // Fail open. Treating blocked storage as "already dismissed" is how a
        // prompt silently never appears for a whole class of visitor, and the
        // worst case the other way is showing it once more this session.
        dismissed = false;
      }
      if (dismissed) return;
    }

    let timer: number | undefined;
    let retry: number | undefined;

    const reveal = () => {
      if (settled.current) return;
      // Wait out whatever is on top rather than stacking on it. One pending
      // retry at a time: while suppressed, every scroll event would otherwise
      // start its own chain of timers.
      if (somethingIsOpen()) {
        if (retry === undefined) {
          retry = window.setTimeout(() => {
            retry = undefined;
            reveal();
          }, RETRY_MS);
        }
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

    if (isPreview) {
      // No scroll or dwell requirement — just a beat, so the page has painted
      // before it slides in. Suppression still gates it inside reveal().
      timer = window.setTimeout(reveal, PREVIEW_DELAY_MS);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      timer = window.setTimeout(reveal, TIME_TRIGGER_MS);
    }

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
