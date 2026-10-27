// Shared parsing/validation for the admin bulk product upload.
//
// Imported by BOTH the client preview (components/admin/bulk-upload-products.tsx)
// and the server route (app/api/admin/products/bulk/route.ts) so the preview the
// admin approves is validated by exactly the same rules that run server-side.
// Keep this file free of server-only imports.

import { ALL_CATEGORY_VALUES } from '@/lib/constants';
import type { ListingType, ProductCategory } from '@/lib/types';

export const BULK_HEADERS = [
  'name',
  'category',
  'description',
  'image_url',
  'in_stock',
  'is_own_brand',
] as const;

// Both layers' categories are accepted on import, whichever layer is chosen:
// a sheet is often prepared before the admin decides where it lands.
const CATEGORY_VALUES = ALL_CATEGORY_VALUES as ProductCategory[];


const TRUE_WORDS = new Set(['true', '1', 'yes', 'y']);
const FALSE_WORDS = new Set(['false', '0', 'no', 'n']);

/** Keys that must never be copied off a parsed spreadsheet row. */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export interface BulkProductRow {
  /** 1-based row number as the admin sees it in their spreadsheet (header = row 1). */
  rowNumber: number;
  name: string;
  category: ProductCategory;
  description: string | null;
  image_url: string | null;
  in_stock: boolean;
  is_own_brand: boolean;
}

export interface BulkRowError {
  rowNumber: number;
  name: string;
  message: string;
}

export interface BulkParseResult {
  rows: BulkProductRow[];
  errors: BulkRowError[];
}

/** Shape returned by POST /api/admin/products/bulk. */
export interface BulkUploadResponse {
  saved: number;
  total: number;
  failures: BulkRowError[];
  error?: string;
}

/** CSV template contents — headers plus one example row. */
export function buildTemplateCsv(): string {
  const example = [
    'Crocin Advance 500mg',
    'general',
    'Paracetamol tablet for fever and pain',
    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600',
    'true',
    'false',
  ];
  return `${BULK_HEADERS.join(',')}\n${example.map(csvCell).join(',')}\n`;
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Normalise a raw parsed sheet row's keys: lowercased, trimmed, spaces and
 * hyphens folded to underscores — so "Image URL", "image-url" and "image_url"
 * all land on the same field.
 */
function normalizeKeys(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(raw)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    const k = key.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (FORBIDDEN_KEYS.has(k)) continue;
    out[k] = raw[key];
  }
  return out;
}

function asText(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v).trim();
  return '';
}

function parseBool(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v;
  const s = asText(v).toLowerCase();
  // Blank defaults to in-stock — the common case when an admin leaves it empty.
  if (s === '') return true;
  if (TRUE_WORDS.has(s)) return true;
  if (FALSE_WORDS.has(s)) return false;
  return null;
}

/**
 * Validate and normalise rows straight off papaparse / SheetJS.
 * Returns clean rows plus a per-row error list; a row appears in exactly one.
 */
export function normalizeBulkRows(raw: Record<string, unknown>[]): BulkParseResult {
  const rows: BulkProductRow[] = [];
  const errors: BulkRowError[] = [];
  // Tracks names already used in THIS file. A duplicate name would make Postgres
  // fail the whole batch ("ON CONFLICT DO UPDATE cannot affect row a second
  // time"), so it has to be caught here as a validation error.
  const seenNames = new Map<string, number>();

  raw.forEach((rawRow, i) => {
    const rowNumber = i + 2; // +1 for zero-index, +1 for the header row
    const row = normalizeKeys(rawRow ?? {});

    const name = asText(row.name);
    const categoryText = asText(row.category).toLowerCase();
    const description = asText(row.description);
    const imageUrl = asText(row.image_url);
    const inStock = parseBool(row.in_stock);
    // Optional column: blank means false, so existing sheets keep working.
    const ownBrandRaw = asText(row.is_own_brand);
    const ownBrand = ownBrandRaw === '' ? false : parseBool(row.is_own_brand);

    // Skip fully blank rows — trailing empty lines are common in exported sheets.
    if (
      !name &&
      !categoryText &&
      !description &&
      !imageUrl &&
      asText(row.in_stock) === '' &&
      ownBrandRaw === ''
    ) {
      return;
    }

    const fail = (message: string) => errors.push({ rowNumber, name: name || '(no name)', message });

    if (!name) {
      fail('Name is required.');
      return;
    }
    if (!categoryText) {
      fail(`Category is required — one of: ${CATEGORY_VALUES.join(', ')}.`);
      return;
    }
    if (!CATEGORY_VALUES.includes(categoryText as ProductCategory)) {
      fail(`"${categoryText}" is not a valid category. Use one of: ${CATEGORY_VALUES.join(', ')}.`);
      return;
    }
    if (inStock === null) {
      fail(`"${asText(row.in_stock)}" is not a valid in_stock value. Use true or false.`);
      return;
    }
    if (ownBrand === null) {
      fail(`"${ownBrandRaw}" is not a valid is_own_brand value. Use true or false, or leave it blank.`);
      return;
    }
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      fail('image_url must start with http:// or https:// (or be left blank).');
      return;
    }

    const dupOf = seenNames.get(name.toLowerCase());
    if (dupOf) {
      fail(`Duplicate name — already used on row ${dupOf} of this file.`);
      return;
    }
    seenNames.set(name.toLowerCase(), rowNumber);

    rows.push({
      rowNumber,
      name,
      category: categoryText as ProductCategory,
      description: description || null,
      image_url: imageUrl || null,
      in_stock: inStock,
      is_own_brand: ownBrand,
    });
  });

  return { rows, errors };
}

/**
 * Strip the preview-only field before sending rows to Supabase.
 *
 * `listing_type` comes from the admin's "Import as" choice rather than the
 * spreadsheet — it is a property of the import, not of the row — and is always
 * written, so re-importing a sheet can move rows between the two layers.
 */
export function toProductPayload(row: BulkProductRow, listingType: ListingType) {
  return {
    name: row.name,
    category: row.category,
    description: row.description,
    image_url: row.image_url,
    in_stock: row.in_stock,
    is_own_brand: row.is_own_brand,
    listing_type: listingType,
  };
}

/** Narrow an untrusted value to a listing type, defaulting to the shelf. */
export function coerceListingType(value: unknown): ListingType {
  return value === 'directory' ? 'directory' : 'featured';
}
