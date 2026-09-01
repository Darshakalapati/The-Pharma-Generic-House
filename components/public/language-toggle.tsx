'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useT } from './i18n/language-provider';
import { LOCALE_COOKIE } from '@/lib/i18n/types-client';
import { cn } from '@/lib/utils';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * One-tap language switch.
 *
 * Writes the cookie and calls router.refresh(), which re-renders the server
 * components with the other dictionary in place — no full page reload, and no
 * client-side copy of both languages.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { dict, locale } = useT();
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const switchLanguage = () => {
    const next = locale === 'en' ? 'te' : 'en';
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${ONE_YEAR_SECONDS};samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <button
      type="button"
      onClick={switchLanguage}
      aria-label={dict.toggle.ariaLabel}
      disabled={pending}
      className={cn(
        'inline-flex items-center rounded-full border border-line bg-bg-elevated',
        'px-3 py-[5px] text-[0.8125rem] font-medium text-ink-muted whitespace-nowrap',
        'transition-colors hover:border-plum hover:text-ink disabled:opacity-60',
        className
      )}
    >
      {dict.toggle.switchTo}
    </button>
  );
}
