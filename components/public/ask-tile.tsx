'use client';

import { useWhatsAppHelper } from './whatsapp-helper';

/** Dock tile that opens the WhatsApp helper rather than navigating away. */
export function AskTile({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useWhatsAppHelper();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
