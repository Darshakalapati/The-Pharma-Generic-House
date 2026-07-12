import { cn } from '@/lib/utils';

/** Static SVG capsule shown while 3D loads or when WebGL is unavailable. */
export function CapsuleFallback({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn('w-full h-full', className)}
      role="img"
    >
      <defs>
        <linearGradient id="capsule-shadow" x1="160" y1="160" x2="160" y2="190">
          <stop offset="0%" stopColor="#1F1A1F" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1F1A1F" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Soft ground shadow */}
      <ellipse cx="160" cy="178" rx="72" ry="10" fill="url(#capsule-shadow)" />
      {/* Left half — plum */}
      <path
        d="M88 100 C88 72 108 52 136 52 L160 52 L160 148 L136 148 C108 148 88 128 88 100 Z"
        fill="#6B2C5F"
      />
      <path
        d="M136 52 C108 52 88 72 88 100 C88 72 108 52 136 52 Z"
        fill="#6B2C5F"
      />
      <ellipse cx="112" cy="100" rx="24" ry="48" fill="#6B2C5F" />
      {/* Right half — teal */}
      <path
        d="M232 100 C232 128 212 148 184 148 L160 148 L160 52 L184 52 C212 52 232 72 232 100 Z"
        fill="#2A9B8E"
      />
      <ellipse cx="208" cy="100" rx="24" ry="48" fill="#2A9B8E" />
      {/* Subtle highlight */}
      <ellipse cx="148" cy="78" rx="28" ry="8" fill="white" fillOpacity="0.12" />
    </svg>
  );
}
