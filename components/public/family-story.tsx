import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import { KenBurnsPhoto } from '@/components/public/ken-burns-photo';
import { BottleAccent } from '@/components/public/botanical-accents';
import type { FamilyMember } from '@/lib/types';
import type { Dictionary } from '@/lib/i18n/types';

/** Very slow, very small — 30 seconds for a 5% zoom on the portrait. */
const PORTRAIT_CYCLE_MS = 30000;
const PORTRAIT_ZOOM = 1.05;

/**
 * Shown when `family_members` is empty or unreachable (migration 0010 not yet
 * applied), so the section reads correctly on a fresh database. Migration 0010
 * seeds exactly this content.
 */
const FALLBACK: Pick<FamilyMember, 'name' | 'role' | 'bio' | 'quote_text' | 'quote_attribution'> = {
  name: 'Uma Shankar Alapati',
  role: 'Founder',
  bio: 'Uma Shankar Alapati brings over 27 years of medical experience and years of running The Pharma Generic House. He built the pharmacy to translate that experience into something Vijayawada families could rely on — trusted medicines, personal advice, and honest care. Every prescription he fills carries that experience behind it. That is why customers come back, and why they bring their neighbours.',
  quote_text: 'We don’t sell medicines. We sell healing.',
  quote_attribution: 'Uma Shankar Alapati',
};

export function FamilyStory({
  member,
  dict,
}: {
  member: FamilyMember | null;
  dict: Dictionary;
}) {
  const name = member?.name?.trim() || FALLBACK.name;
  const bio = member?.bio?.trim() || FALLBACK.bio;
  const photo = member?.photo_url?.trim() || null;

  // The pull-quote only appears for the member flagged as the featured quote —
  // and only if they actually have one written.
  const quote =
    member == null
      ? FALLBACK.quote_text
      : member.is_featured_quote
        ? member.quote_text?.trim() || null
        : null;
  const attribution =
    member == null
      ? FALLBACK.quote_attribution
      : member.quote_attribution?.trim() || member.name;

  return (
    <ScrollReveal as="section" className="container-public relative py-16 lg:py-24">
      <BottleAccent className="right-0 top-6" />

      <ScrollRevealItem as="div" className="max-w-3xl">
        <span className="eyebrow">{dict.founder.eyebrow}</span>
        <h2 className="h-section mt-4 text-balance">{dict.founder.heading}</h2>
        <p className="mt-6 font-serif italic font-normal text-[1.5rem] leading-[1.4] text-ink-muted text-pretty">
          {dict.founder.subhead}
        </p>
      </ScrollRevealItem>

      <div className="mt-12 grid lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Portrait */}
        <ScrollRevealItem as="div" className="lg:col-span-5">
          {photo ? (
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-line shadow-card bg-sand">
              <KenBurnsPhoto
                slides={[{ id: member?.id ?? 'portrait', image_url: photo, alt_text: name }]}
                cycleMs={PORTRAIT_CYCLE_MS}
                zoomScale={PORTRAIT_ZOOM}
                fallbackAlt={name}
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          ) : (
            <div className="aspect-[4/5] rounded-2xl border border-line bg-sand grid place-items-center">
              <span className="font-serif italic text-[1.0625rem] text-ink-muted">
                {dict.founder.photoComingSoon}
              </span>
            </div>
          )}
        </ScrollRevealItem>

        {/* Bio and pull-quote — the pull-quote closes the section */}
        <ScrollRevealItem as="div" className="lg:col-start-7 lg:col-span-6">
          <p className="text-[1.0625rem] text-ink leading-[1.7] max-w-[55ch]">{bio}</p>

          {quote && (
            <figure className="mt-10 py-8 border-y border-line max-w-[40ch]">
              <blockquote className="font-serif italic font-light text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.3] text-plum text-balance">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 text-[0.875rem] uppercase tracking-[0.12em] text-ink-muted">
                — {attribution}
              </figcaption>
            </figure>
          )}
        </ScrollRevealItem>
      </div>
    </ScrollReveal>
  );
}
