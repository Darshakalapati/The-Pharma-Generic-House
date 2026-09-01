import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Re-fetched at most every 5 minutes; the catalogue changes slowly. */
export const revalidate = 300;

export interface SearchIndex {
  products: { id: string; name: string; category: string }[];
  tests: { id: string; name: string; description: string | null }[];
  doctors: { id: string; name: string; specialty: string }[];
}

/**
 * One small payload backing the search palette.
 *
 * The whole active catalogue is a few hundred rows at most, so shipping it
 * once and filtering on the client is faster and simpler than a query per
 * keystroke — and it keeps typing responsive with no debounce machinery.
 */
export async function GET() {
  const empty: SearchIndex = { products: [], tests: [], doctors: [] };
  try {
    const supabase = createClient();
    const [products, tests, doctors] = await Promise.all([
      supabase.from('products').select('id, name, category').eq('in_stock', true),
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
