import {
  ScrollReveal,
  ScrollRevealItem,
} from '@/components/public/motion/scroll-reveal';
import { HerbSprigAccent } from '@/components/public/botanical-accents';
import { cn } from '@/lib/utils';
import type { Dictionary } from '@/lib/i18n/types';


export function DiagnosticsHowItWorks({ dict }: { dict: Dictionary }) {
  const STEPS = dict.diagnostics.steps;
  return (
    <ScrollReveal as="section" className="mt-20 sm:mt-24 bg-bg-elevated border-y border-line">
      <div className="container-public relative py-12 lg:py-20">
        <HerbSprigAccent className="right-2 top-6" />

        <ScrollRevealItem as="div" className="text-center">
          <span className="eyebrow eyebrow--teal">{dict.diagnostics.howEyebrow}</span>
          <h2 className="h-section mt-4">{dict.diagnostics.howHeading}</h2>
          <p className="mt-4 text-[1.0625rem] text-ink-muted">{dict.diagnostics.howSub}</p>
        </ScrollRevealItem>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <ScrollRevealItem
              key={step.title}
              as="div"
              className={cn(
                'relative flex flex-col items-center text-center p-8',
                // Hairline divider between columns, desktop only.
                i > 0 &&
                  "lg:before:content-[''] lg:before:absolute lg:before:left-0 lg:before:top-1/2 lg:before:-translate-y-1/2 lg:before:h-[60%] lg:before:w-px lg:before:bg-line"
              )}
            >
              <span className="font-serif font-normal text-[3rem] leading-none text-plum">
                {i + 1}
              </span>
              <h3 className="mt-4 font-serif font-medium text-[1.375rem] tracking-[-0.01em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] text-ink-muted leading-[1.5] max-w-[30ch]">
                {step.body}
              </p>
            </ScrollRevealItem>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
