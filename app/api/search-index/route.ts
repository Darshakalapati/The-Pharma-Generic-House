import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Re-fetched at most every 5 minutes; the catalogue changes slowly. */
export const revalidate = 300;

export interface SearchIndex {
  /** Both layers. `listing_type` decides which tab a hit links to. */
  products: { id: string; name: string; category: string; listing_type: string }[];
  tests: { id: string; name: string; description: string | null }[];
  doctors: { id: string; name: string; specialty: string }[];
}

/**
 * One payload backing the search palette.
 *
 * Shipped once and filtered on the client, which keeps typing responsive with
 * no debounce machinery and no request per keystroke. Since migration 0020
 * this includes the ~4,000-row salt directory, so products are deliberately
 * three short columns and nothing more.
 */
export async function GET() {
  const empty: SearchIndex = { products: [], tests: [], doctors: [] };
  try {
    const supabase = createClient();
    const [products, tests, doctors] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, category, listing_type')
        .eq('in_stock', true)
        .order('name', { ascending: true }),
      supabase.from('tests').select('id, name, description').eq('is_active', true),
      supabase.from('doctors').select('id, name, specialty').eq('is_active', true),
    ]);
    return NextResponse.json({
      products: products.data ?? [],
      tests: tests.data ?? [],
      doctors: doctors.data ?? [],
    } satisfies SearchIndex);
  } catch {
    return NextResponse.json(empty);
  }
}
