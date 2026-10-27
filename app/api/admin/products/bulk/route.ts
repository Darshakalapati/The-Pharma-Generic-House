import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeBulkRows, toProductPayload, coerceListingType } from '@/lib/bulk-products';

export const dynamic = 'force-dynamic';

/** Rows per upsert call. Small enough to isolate failures, big enough to be fast. */
const CHUNK_SIZE = 500;
/**
 * Per-REQUEST cap, not per-file. A 4,000-row directory import arrives as eight
 * batches of 500 so the client can show progress and no single request runs
 * long enough to hit a function timeout.
 */
const MAX_ROWS = 1000;

/** Postgres: "no unique or exclusion constraint matching the ON CONFLICT specification". */
const PG_NO_CONFLICT_TARGET = '42P10';
const MIGRATION_HINT =
  'The products table has no unique constraint on `name` yet. Run supabase/migrations/0008_products_unique_name.sql in the Supabase SQL Editor, then try again.';

export async function POST(request: Request) {
  // Auth. The middleware only guards paths starting with /admin, so this API
  // route has to authenticate itself before it touches the service-role client
  // (which bypasses RLS entirely).
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'You must be signed in as an admin.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Could not read the request body.' }, { status: 400 });
  }

  const rawRows = (body as { rows?: unknown })?.rows;
  if (!Array.isArray(rawRows)) {
    return NextResponse.json({ error: 'Expected a `rows` array.' }, { status: 400 });
  }
  if (rawRows.length === 0) {
    return NextResponse.json({ error: 'That file had no product rows.' }, { status: 400 });
  }
  if (rawRows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `Too many rows in one batch (${rawRows.length}). Send at most ${MAX_ROWS}.` },
      { status: 413 }
    );
  }

  const listingType = coerceListingType((body as { listingType?: unknown })?.listingType);

  // Re-validate server-side. The client already previewed these, but a client
  // preview is not a trust boundary.
  const { rows, errors } = normalizeBulkRows(rawRows as Record<string, unknown>[]);
  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Some rows failed validation.', failures: errors },
      { status: 400 }
    );
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: 'That file had no product rows.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const failures: { rowNumber: number; name: string; message: string }[] = [];
  let saved = 0;

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    const { error } = await admin
      .from('products')
      .upsert(
        chunk.map((r) => toProductPayload(r, listingType)),
        { onConflict: 'name' }
      );

    if (!error) {
      saved += chunk.length;
      continue;
    }

    // A missing unique constraint fails every chunk for the same reason — report
    // it once with the fix instead of grinding through row-by-row retries.
    if (error.code === PG_NO_CONFLICT_TARGET) {
      return NextResponse.json({ error: MIGRATION_HINT }, { status: 409 });
    }

    // Otherwise isolate: retry the chunk one row at a time so a single bad row
    // doesn't discard the rest of the batch.
    for (const row of chunk) {
      const { error: rowError } = await admin
        .from('products')
        .upsert([toProductPayload(row, listingType)], { onConflict: 'name' });
      if (rowError) {
        failures.push({ rowNumber: row.rowNumber, name: row.name, message: rowError.message });
      } else {
        saved += 1;
      }
    }
  }

  return NextResponse.json({ saved, failures, total: rows.length });
}
