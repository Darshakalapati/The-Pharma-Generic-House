// Pharmacy-related stock photography from Unsplash. All royalty-free; the
// `?w=...&q=80&auto=format&fit=crop` query optimises delivery and lets us
// request appropriate sizes per usage.

const opt = (w = 1200) => `?w=${w}&q=80&auto=format&fit=crop`;

const base = (id: string) => `https://images.unsplash.com/${id}`;

export const IMG = {
  hero: {
    pharmacistCounter: base('photo-1576091160550-2173dba999ef') + opt(1400),
    medicineShelves: base('photo-1587854692152-cbe660dbde88') + opt(1400),
    modernInterior: base('photo-1584308666744-24d5c474f2ae') + opt(1400),
  },
  pharmacy: {
    shelves: base('photo-1587854692152-cbe660dbde88') + opt(1000),
    pillsCloseup: base('photo-1631549916768-4119b2e5f926') + opt(1000),
    mortarPestle: base('photo-1471864190281-a93a3070b6de') + opt(1000),
    interior: base('photo-1584308666744-24d5c474f2ae') + opt(1400),
  },
  diagnostics: {
    bloodTest: base('photo-1579165466741-7f35e4755660') + opt(1200),
    labEquipment: base('photo-1532187863486-abf9dbad1b69') + opt(1200),
  },
  doctors: {
    rameshIyer: base('photo-1612349317150-e413f6a5b16d') + opt(800),
    anjaliVerma: base('photo-1594824476967-48c8b964273f') + opt(800),
    priyaNair: base('photo-1559839734-2b71ea197ec2') + opt(800),
  },
  categories: {
    general: base('photo-1631549916768-4119b2e5f926') + opt(800),
    pharma: base('photo-1587854692152-cbe660dbde88') + opt(800),
    ayurvedic: base('photo-1471864190281-a93a3070b6de') + opt(800),
    cosmetic: base('photo-1584308666744-24d5c474f2ae') + opt(800),
  },
};

// Map a doctor's seed name to a hardcoded Unsplash URL fallback.
// Admin uploads still take precedence (db photo_url wins).
export function fallbackDoctorPhoto(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes('ramesh')) return IMG.doctors.rameshIyer;
  if (n.includes('anjali')) return IMG.doctors.anjaliVerma;
  if (n.includes('priya')) return IMG.doctors.priyaNair;
  return null;
}

/**
 * Resolves a doctor's photo, preferring an admin upload but falling back to
 * the seed Unsplash photo if the photo_url is missing or points to a legacy
 * placeholder host (ui-avatars.com from earlier seeds, picsum.photos, etc.).
 *
 * Admin uploads go to Supabase Storage and are kept as-is.
 */
export function resolveDoctorPhoto(
  photoUrl: string | null | undefined,
  name: string
): string | null {
  if (!photoUrl) return fallbackDoctorPhoto(name);
  const url = photoUrl.toLowerCase();
  const isLegacyPlaceholder =
    url.includes('ui-avatars.com') || url.includes('picsum.photos');
  if (isLegacyPlaceholder) return fallbackDoctorPhoto(name) ?? photoUrl;
  return photoUrl;
}
