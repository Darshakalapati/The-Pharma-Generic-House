import type { Metadata } from 'next';
import { Fraunces, Inter, Noto_Serif_Telugu, Noto_Sans_Telugu } from 'next/font/google';
import { getLocale } from '@/lib/i18n';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { SHOP_NAME, SHOP_TAGLINE } from '@/lib/constants';
import { SITE_URL } from '@/lib/seo';

const fraunces = Fraunces({
  subsets: ['latin'],
  // 300 and the italic style are used by the "Our story" pull-quote and the
  // italic captions; without them the browser would synthesise both.
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

// Telugu needs its own faces — Fraunces and Inter have no Telugu glyphs, so
// without these the entire UI would render as tofu boxes.
const notoSerifTelugu = Noto_Serif_Telugu({
  subsets: ['telugu'],
  weight: ['400', '500'],
  variable: '--font-noto-serif-telugu',
  display: 'swap',
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ['telugu'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-sans-telugu',
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
  metadataBase: new URL(SITE_URL),
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
  // Read server-side so the correct language and fonts are in the very first
  // paint — no flash of English before a client effect swaps it.
  const locale = getLocale();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable} ${notoSerifTelugu.variable} ${notoSansTelugu.variable}`}
    >
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
        {/* Cookieless, so no consent banner is required. Mounted at the root
            so it covers the admin panel too — harmless, and it means one
            place to look. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
