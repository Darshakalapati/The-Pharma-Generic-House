import type { Dictionary, Locale } from '@/lib/i18n/types';
import type { ShopSettings } from '@/lib/types';

export type ContrastSettings = Pick<
  ShopSettings,
  'contrast_line1_en' | 'contrast_line2_en' | 'contrast_line1_te' | 'contrast_line2_te'
>;

/**
 * Resolve the home-page highlight statement for one language.
 *
 * Lives here, free of any component or server import, so the public band and
 * the admin preview can share one rule — a preview that disagreed with the
 * site would be worse than no preview.
 *
 * The pair is treated as a unit. While both fields are empty the admin hasn't
 * touched this language, so the built-in wording shows — and because each
 * language resolves against its own dictionary, blank Telugu gives the Telugu
 * default rather than English.
 *
 * Once either field is set the admin is in charge, and an empty main line is
 * then read as "don't show this" rather than "use the default". That is the
 * only way to switch the section off from the admin panel.
 */
export function resolveContrast(
  dict: Dictionary,
  locale: Locale,
  settings: ContrastSettings
): { line1: string; line2: string } {
  const line1 = (locale === 'te' ? settings.contrast_line1_te : settings.contrast_line1_en).trim();
  const line2 = (locale === 'te' ? settings.contrast_line2_te : settings.contrast_line2_en).trim();
  const customised = line1 !== '' || line2 !== '';
  return customised
    ? { line1, line2 }
    : { line1: dict.contrast.line1, line2: dict.contrast.line2 };
}
