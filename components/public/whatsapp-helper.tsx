'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { HelperCtx, useWhatsAppHelper } from './whatsapp-helper-context';
import type { Schedule } from '@/lib/hours';

// Re-exported so existing `import { useWhatsAppHelper } from './whatsapp-helper'`
// call sites keep working.
export { useWhatsAppHelper };

/**
 * The card itself pulls in the open/closed logic, the WhatsApp glyph and the
 * prescription copy — none of it needed until someone taps the float. Split
 * out and fetched on first open.
 */
const HelperCard = dynamic(
  () => import('./whatsapp-helper-card').then((m) => m.HelperCard),
  { ssr: false, loading: () => null }
);

/**
 * A short triage step in front of WhatsApp.
 *
 * Sending someone straight to an empty chat makes them compose the first
 * message themselves; offering three prefilled intents means most people
 * arrive in the shop's inbox already saying what they need. The card also
 * states whether anyone is actually there, so an out-of-hours message comes
 * with the right expectation rather than silence.
 */
export function WhatsAppHelperProvider({
  whatsapp,
  schedule,
  replyNote,
  children,
}: {
  whatsapp: string;
  schedule: Schedule;
  /** Admin override; when set it is shown in both languages. */
  replyNote: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const value = React.useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <HelperCtx.Provider value={value}>
      {children}
      {/* Mounted only while open — the card already rendered nothing when
          closed, so this changes the bundle, not the behaviour. */}
      {isOpen && (
        <HelperCard whatsapp={whatsapp} schedule={schedule} replyNote={replyNote} />
      )}
    </HelperCtx.Provider>
  );
}
