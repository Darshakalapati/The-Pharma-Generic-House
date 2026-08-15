'use client';

import { whatsappLink } from '@/lib/utils';
import { WhatsAppGlyph } from './whatsapp-glyph';

export function WhatsAppFloat({ phone }: { phone: string }) {
  return (
    <a
      href={whatsappLink(phone, 'Hello, I have a question.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      /* Hidden on phones — MobileActionBar carries the WhatsApp action there. */
      className="group fixed bottom-5 right-5 z-40 hidden md:inline-flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-teal text-white shadow-elevated transition-transform duration-200 ease-smooth hover:scale-105 hover:bg-teal-deep active:scale-95"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <WhatsAppGlyph className="h-6 w-6 sm:h-7 sm:w-7" />
      <span aria-hidden className="absolute inset-0 -z-10 rounded-full bg-teal opacity-40 blur-md group-hover:opacity-60 transition-opacity" />
    </a>
  );
}
