import Link from 'next/link';
import { Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PromoBanner } from '@/lib/types';

interface Props {
  banner: PromoBanner;
  /**
   * When true, the entire banner is rendered as a link wrapper if a
   * button_link is set. Defaults to true for the live home-page banner;
   * the admin live preview passes `false` to keep the preview non-clickable.
   */
  clickableSurface?: boolean;
  className?: string;
}

/**
 * Renders a single promo banner. Used by both the public carousel on the
 * home page and the admin live preview. Pure presentational — no client
 * hooks — so it works in either context.
 */
export function PromoBannerCard({ banner, clickableSurface = true, className }: Props) {
  if (banner.banner_type === 'image') {
    return <ImageBanner banner={banner} clickableSurface={clickableSurface} className={className} />;
  }
  return <TextBanner banner={banner} className={className} />;
}

const ASPECT =
  // 4:3 mobile, 16:9 tablet, 21:9 desktop
  'aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]';

function ImageBanner({
  banner,
  clickableSurface,
  className,
}: {
  banner: PromoBanner;
  clickableSurface: boolean;
  className?: string;
}) {
  const hasButton = !!(banner.button_label && banner.button_link);
  const imageAlt = banner.title;
  const Surface = clickableSurface && banner.button_link ? 'a' : 'div';

  return (
    <Surface
      {...(Surface === 'a'
        ? {
            href: banner.button_link!,
            // Open external links in a new tab; keep internal paths in-app.
            ...(/^https?:/.test(banner.button_link ?? '')
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {}),
          }
        : {})}
      className={cn(
        'relative block w-full overflow-hidden rounded-2xl bg-sand shadow-card',
        ASPECT,
        clickableSurface && banner.button_link && 'group cursor-pointer',
        className
      )}
    >
      {banner.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.image_url}
          alt={imageAlt}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      {hasButton && (
        <>
          {/* Bottom-only gradient for button readability over busy images */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 via-black/15 to-transparent"
          />
          <span className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
            <span className="inline-flex items-center justify-center h-10 px-5 rounded-md border border-plum bg-bg-elevated text-plum text-[0.9375rem] font-medium transition-colors group-hover:bg-plum group-hover:text-white">
              {banner.button_label}
            </span>
          </span>
        </>
      )}
    </Surface>
  );
}

function TextBanner({ banner, className }: { banner: PromoBanner; className?: string }) {
  const style = banner.background_style;

  // Background + text colors per style.
  const bgClass =
    style === 'plum'
      ? 'bg-plum text-white'
      : style === 'teal'
        ? 'bg-teal text-white'
        : 'bg-bg-elevated text-ink';

  // Decorative pill icon — white on coloured bg, plum on cream.
  const decorTone =
    style === 'cream' ? 'text-plum opacity-[0.08]' : 'text-white opacity-15';

  // Subheading colour
  const subClass = style === 'cream' ? 'text-ink-muted' : 'text-white/85';

  // Button: contrast inversion per background.
  const buttonClass =
    style === 'plum'
      ? 'bg-bg-elevated text-plum border-bg-elevated hover:bg-transparent hover:text-white hover:border-white'
      : style === 'teal'
        ? 'bg-bg-elevated text-teal-deep border-bg-elevated hover:bg-transparent hover:text-white hover:border-white'
        : 'bg-plum text-white border-plum hover:bg-plum-deep hover:border-plum-deep';

  const hasButton = !!(banner.button_label && banner.button_link);

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl shadow-card',
        ASPECT,
        bgClass,
        className
      )}
    >
      {/* Decorative pill icon — right side on desktop, hidden on mobile */}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-6 -bottom-10 sm:right-4 sm:-bottom-6 lg:right-10 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2',
          decorTone
        )}
      >
        <Pill
          strokeWidth={1.25}
          className="w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] lg:w-[340px] lg:h-[340px]"
        />
      </span>

      {/* Content — text-left on tablet+, centered on mobile */}
      <div className="relative h-full flex items-center">
        <div className="w-full p-8 sm:p-10 lg:p-12 lg:pr-[40%] flex flex-col items-center text-center sm:items-start sm:text-left max-w-3xl">
          {banner.headline && (
            <h3 className="font-serif font-medium text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.015em]">
              {banner.headline}
            </h3>
          )}
          {banner.subheading && (
            <p className={cn('mt-4 max-w-[50ch] text-[1.0625rem] leading-[1.5]', subClass)}>
              {banner.subheading}
            </p>
          )}
          {hasButton && (
            <Link
              href={banner.button_link!}
              {...(/^https?:/.test(banner.button_link ?? '')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className={cn(
                'mt-6 inline-flex items-center justify-center h-11 px-5 rounded-md border text-[0.9375rem] font-medium transition-colors',
                buttonClass
              )}
            >
              {banner.button_label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
