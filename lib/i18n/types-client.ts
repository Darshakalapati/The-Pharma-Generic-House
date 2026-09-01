export { LOCALES, DEFAULT_LOCALE } from './types';
export type { Locale, Dictionary } from './types';

/** Duplicated from lib/i18n/index.ts, which imports next/headers and so cannot
 *  be pulled into a client bundle. */
export const LOCALE_COOKIE = 'lang';
