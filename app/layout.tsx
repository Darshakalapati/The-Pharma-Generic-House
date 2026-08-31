import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { SHOP_NAME, SHOP_TAGLINE } from '@/lib/constants';

const fraunces = Fraunces({
  subsets: ['latin'],
  // 300 and the italic style are used by the "Our story" pull-quote and the
  // italic captions; without them the browser would synthesise both.
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SHOP_NAME} — ${SHOP_TAGLINE}`,
    template: `%s · ${SHOP_NAME}`,
  },
  description:
    'Trusted pharmacy in Vijayawada. Medicines, ayurvedic remedies, cosmetics, doctor consultations and lab tests — with WhatsApp support.',
  metadataBase: new URL('https://www.pharmagenerichouse.com'),
  openGraph: {
    type: 'website',
    siteName: SHOP_NAME,
    locale: 'en_IN',
    url: '/',
    title: `${SHOP_NAME} — Medicines, doctors, tests — under one roof.`,
    description:
      'Trusted pharmacy in Vijayawada. Medicines, ayurvedic remedies, cosmetics, doctor consultations and lab tests — with WhatsApp support.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SHOP_NAME} — Medicines, doctors, tests — under one roof.`,
    description:
      'Trusted pharmacy in Vijayawada. Medicines, ayurvedic remedies, cosmetics, doctor consultations and lab tests — with WhatsApp support.',
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter)',
              borderRadius: '0.875rem',
            },
          }}
        />
      </body>
    </html>
  );
}
