import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const alt = 'The Pharma Generic House — Medicines, doctors, tests — under one roof.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Link-preview card, shown whenever the site is shared on WhatsApp.
 *
 * Both the logo and the display font are optional: if either fails to load the
 * card still renders, just with a system serif or without the mark. A share
 * preview is not worth a 500.
 */
async function loadLogo(): Promise<string | null> {
  try {
    const file = await readFile(path.join(process.cwd(), 'public', 'logo.png'));
    return `data:image/png;base64,${file.toString('base64')}`;
  } catch {
    return null;
  }
}

/**
 * Fetch Fraunces for the card's display line.
 *
 * Every request is hard-aborted after a few seconds. This route is generated
 * at build time, and a font CDN that hangs would otherwise hang the entire
 * build — the card falling back to a system serif is a far better outcome.
 */
async function loadFraunces(): Promise<ArrayBuffer | null> {
  const FETCH_TIMEOUT_MS = 4000;
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Fraunces:wght@500&display=swap',
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      }
    );
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [logo, fraunces] = await Promise.all([loadLogo(), loadFraunces()]);
  const serif = fraunces ? 'Fraunces' : 'serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 64,
          padding: '0 88px',
          background: '#FAF6F0',
          position: 'relative',
        }}
      >
        {logo && (
          <img src={logo} width={220} height={223} alt="" style={{ objectFit: 'contain' }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: serif, fontSize: 64, color: '#1F1A1F', lineHeight: 1.1 }}>
            The Pharma Generic House
          </div>
          <div style={{ fontSize: 34, color: '#6B2C5F', marginTop: 18 }}>
            Medicines, doctors, tests — under one roof.
          </div>
          <div style={{ fontSize: 22, color: '#6B6470', marginTop: 22 }}>
            Vijayawada · Est. 2018 · Sunday lab tests · WhatsApp support
          </div>
        </div>

        {/* Brand bar along the bottom edge */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 12,
            background: '#6B2C5F',
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: fraunces
        ? [{ name: 'Fraunces', data: fraunces, style: 'normal', weight: 500 }]
        : [],
    }
  );
}
