import { cn } from '@/lib/utils';

/**
 * Sketched botanical/apothecary accents — the kind of line drawing you'd find
 * in the margin of an old pharmacopoeia. Purely decorative: absolutely
 * positioned, aria-hidden, non-interactive, and hidden below `lg` where the
 * space is needed for content.
 *
 * Each accent inherits colour from `currentColor` (set to plum here) at 8%
 * opacity — present enough to feel drawn, faint enough that you have to look.
 * The caller supplies the position via `className`; the parent section needs
 * `relative` for it to anchor against.
 */
function Accent({
  viewBox,
  className,
  children,
}: {
  viewBox: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'pointer-events-none absolute hidden lg:block select-none text-plum opacity-[0.08]',
        className
      )}
    >
      {children}
    </svg>
  );
}

/** A single leaf with a central vein and branching side veins. */
export function LeafAccent({ className }: { className?: string }) {
  return (
    <Accent viewBox="0 0 100 132" className={cn('w-[120px]', className)}>
      {/* Blade */}
      <path d="M52 6C76 32 84 68 56 104C30 72 30 36 52 6Z" />
      {/* Midrib and stem */}
      <path d="M52 12C54 40 55 74 56 104" />
      <path d="M56 104C57 114 55 122 52 128" />
      {/* Side veins — right */}
      <path d="M53 30C62 34 68 40 71 47" />
      <path d="M54 52C64 56 70 62 73 70" />
      <path d="M55 74C63 78 68 84 70 91" />
      {/* Side veins — left */}
      <path d="M53 34C44 38 38 45 35 52" />
      <path d="M54 56C45 60 39 67 36 74" />
      <path d="M55 78C48 82 43 88 41 94" />
    </Accent>
  );
}

/** Mortar with a pestle resting against the rim. */
export function MortarPestleAccent({ className }: { className?: string }) {
  return (
    <Accent viewBox="0 0 100 100" className={cn('w-[100px]', className)}>
      {/* Rim */}
      <path d="M18 42C18 36 32 32 50 32C68 32 82 36 82 42" />
      <path d="M18 42C18 48 32 52 50 52C68 52 82 48 82 42" />
      {/* Bowl */}
      <path d="M20 45C22 72 32 88 50 88C68 88 78 72 80 45" />
      {/* Foot */}
      <path d="M37 88L35 94" />
      <path d="M63 88L65 94" />
      <path d="M31 95H69" />
      {/* Pestle */}
      <path d="M53 49C60 38 68 25 74 14" />
      <path d="M70 10C73 6 79 7 80 11C81 15 77 18 73 16" />
    </Accent>
  );
}

/** Corked apothecary bottle with a blank label. */
export function BottleAccent({ className }: { className?: string }) {
  return (
    <Accent viewBox="0 0 100 126" className={cn('w-[92px]', className)}>
      {/* Cork */}
      <path d="M43 7C43 5 45 4 50 4C55 4 57 5 57 7V17C57 19 55 20 50 20C45 20 43 19 43 17Z" />
      {/* Neck */}
      <path d="M45 20V32" />
      <path d="M55 20V32" />
      {/* Shoulders and body */}
      <path d="M45 32C36 36 28 44 28 58V100C28 112 34 118 50 118C66 118 72 112 72 100V58C72 44 64 36 55 32" />
      {/* Label */}
      <path d="M34 70H66" />
      <path d="M34 88H66" />
      <path d="M34 70V88" />
      <path d="M66 70V88" />
      <path d="M44 79H56" />
      <path d="M50 73V85" />
    </Accent>
  );
}

/** Three leaves and a bud on a single stem. */
export function HerbSprigAccent({ className }: { className?: string }) {
  return (
    <Accent viewBox="0 0 100 122" className={cn('w-[100px]', className)}>
      {/* Stem */}
      <path d="M50 118C50 90 52 60 55 18" />
      {/* Lower leaf, left */}
      <path d="M51 92C40 90 32 82 30 72C40 72 49 79 51 92Z" />
      {/* Middle leaf, right */}
      <path d="M52 68C63 66 71 58 73 48C63 48 54 55 52 68Z" />
      {/* Upper leaf, left */}
      <path d="M53 46C43 44 36 36 34 27C43 27 51 34 53 46Z" />
      {/* Bud */}
      <path d="M55 18C51 13 52 7 56 3C60 7 60 14 55 18Z" />
    </Accent>
  );
}
