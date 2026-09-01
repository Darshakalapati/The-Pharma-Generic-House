import { cookies } from 'next/headers';
import { en } from './dictionaries/en';
import { te } from './dictionaries/te';
import { DEFAULT_LOCALE, type Dictionary, type Locale } from './types';

export * from './types';
export const LOCALE_COOKIE = 'lang';

const DICTIONARIES: Record<Locale, Dictionary> = { en, te };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * The visitor's language, read server-side from the cookie.
 *
 * Anything without the cookie — a first-time visitor, and every crawler —
 * gets English, so the indexed version of the site stays English and there is
 * never a flash of the wrong language on first paint.
 */
export function getLocale(): Locale {
  try {
    const value = cookies().get(LOCALE_COOKIE)?.value;
    return value === 'te' ? 'te' : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** Replace {token} placeholders, e.g. t(dict.status.openNow, { time: '10 PM' }). */
export function t(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match
  );
}
