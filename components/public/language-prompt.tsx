'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useT } from './i18n/language-provider';
import { LOCALE_COOKIE } from '@/lib/i18n/types-client';

const SEEN_KEY = 'lang_prompt_seen';
const DELAY_MS = 2000;
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Offers Telugu once, to visitors whose browser already asks for it.
 *
 * Gated on three things together: no `lang` cookie (so a choice already made
 * is never second-guessed), no `lang_prompt_seen` flag, and a Telugu entry in
 * navigator.languages. Either button sets the flag, so this appears at most
 * once per browser — an unasked-for language switcher that nags would be worse
 * than none.
 */
export function LanguagePrompt() {
  const { dict } = useT();
  const router = useRouter();
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      // Storage blocked — treat as seen so we never nag.
      seen = true;
    }
    if (seen) return;
    if (document.cookie.includes(`${LOCALE_COOKIE}=`)) return;

    const wantsTelugu = (navigator.languages ?? [navigator.language]).some((l) =>
      l?.toLowerCase().startsWith('te')
    );
    if (!wantsTelugu) return;

    const id = window.setTimeout(() => setShow(true), DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  const remember = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      // ignore
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label={dict.langPrompt.question}
      // Sits above the mobile action bar so it is never half-hidden by it.
      className="fixed inset-x-4 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] z-[46] mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-line bg-bg-elevated px-4 py-3 shadow-elevated md:bottom-5"
    >
      <p className="min-w-0 flex-1 text-[0.9375rem] text-ink">{dict.langPrompt.question}</p>
      <button
        type="button"
        onClick={() => {
          document.cookie = `${LOCALE_COOKIE}=te;path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax`;
          remember();
          router.refresh();
        }}
        className="shrink-0 rounded-full bg-plum px-3 py-1.5 text-[0.8125rem] font-medium text-white"
      >
        {dict.langPrompt.yes}
      </button>
      <button
        type="button"
        onClick={remember}
        className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-ink-muted hover:border-plum hover:text-ink"
      >
        {dict.langPrompt.no}
      </button>
    </div>
  );
}
