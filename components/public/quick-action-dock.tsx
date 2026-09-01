import Link from 'next/link';
import { Pill, Stethoscope, FlaskConical, MessageCircle, ArrowRight } from 'lucide-react';
import { TodayCard } from './today-card';
import { AskTile } from './ask-tile';
import type { Dictionary } from '@/lib/i18n/types';
import type { Schedule } from '@/lib/hours';
import type { Doctor } from '@/lib/types';

const TILE_ICONS = [Pill, Stethoscope, FlaskConical, MessageCircle];

/**
 * The four things people actually come here to do, surfaced immediately under
 * the hero so nobody has to hunt through the page for them.
 *
 * Sits below the hero with normal section spacing — nothing is layered over
 * the hero photograph.
 */
const TILE_CLASS =
  'group flex min-h-[72px] items-center gap-3 rounded-xl border border-line ' +
  'px-4 py-3 text-left transition-[transform,border-color,box-shadow] duration-200 ' +
  'hover:-translate-y-0.5 hover:border-plum hover:shadow-soft focus-visible:border-plum';

export function QuickActionDock({
  doctors,
  schedule,
  dict,
}: {
  doctors: Doctor[];
  schedule: Schedule;
  dict: Dictionary;
}) {
  const hrefs = ['/products', '/doctors', '/tests'];

  return (
    <section className="container-public mt-10">
      <div className="rounded-2xl border border-line bg-bg-elevated p-6 shadow-card">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <h2 className="font-serif font-medium text-[1.25rem] tracking-[-0.01em]">
              {dict.dock.heading}
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {dict.dock.tiles.map((tile, i) => {
                const Icon = TILE_ICONS[i];
                const inner = (
                  <>
                    <Icon className="h-[22px] w-[22px] shrink-0 text-plum" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif font-medium text-[1.0625rem] leading-snug">
                        {tile.label}
                      </span>
                      <span className="mt-0.5 block text-[0.8125rem] text-ink-muted leading-snug">
                        {tile.helper}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-plum transition-transform group-hover:translate-x-1" />
                  </>
                );

                // The last tile opens the WhatsApp helper instead of navigating.
                return i === 3 ? (
                  <AskTile key={tile.label} className={TILE_CLASS}>
                    {inner}
                  </AskTile>
                ) : (
                  <Link key={tile.label} href={hrefs[i]} className={TILE_CLASS}>
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Hairline divider on desktop; the card simply stacks on mobile. */}
          <div className="lg:col-span-4 lg:border-l lg:border-line lg:pl-8">
            <TodayCard doctors={doctors} schedule={schedule} />
          </div>
        </div>
      </div>
    </section>
  );
}
