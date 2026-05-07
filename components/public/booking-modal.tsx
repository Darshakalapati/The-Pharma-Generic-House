'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Booking dialog. Centered modal on desktop, bottom-sheet on mobile.
 * Background: white, rounded-2xl, soft shadow, friendly padding.
 */
export function BookingModal({
  open,
  onOpenChange,
  eyebrow,
  title,
  subtitle,
  children,
}: Props) {
  React.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  return (
    <>
      <div
        onClick={() => onOpenChange(false)}
        className={cn(
          'fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={cn(
          'fixed z-50 bg-bg-elevated border border-line shadow-elevated transition-all duration-300 ease-smooth',
          // Mobile: bottom sheet
          'inset-x-0 bottom-0 rounded-t-2xl',
          // Desktop: centered modal
          'sm:inset-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:rounded-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg',
          // Animation
          open
            ? 'translate-y-0 opacity-100 sm:scale-100 pointer-events-auto'
            : 'translate-y-full opacity-0 sm:scale-95 sm:translate-y-[calc(-50%-8px)] pointer-events-none'
        )}
        style={{ maxHeight: '92vh' }}
      >
        <div className="flex items-start justify-between px-6 sm:px-7 pt-6 sm:pt-7 pb-4">
          <div className="min-w-0">
            {eyebrow && <span className="eyebrow text-[0.7rem]">{eyebrow}</span>}
            <h2 className="mt-2 font-serif font-medium text-[1.5rem] sm:text-[1.625rem] tracking-[-0.015em] leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-[0.875rem] text-ink-muted">{subtitle}</p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-sand hover:text-ink transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className="px-6 sm:px-7 pb-7 overflow-y-auto"
          style={{ maxHeight: 'calc(92vh - 8rem)' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-[0.78rem] text-plum">{msg}</p>;
}
