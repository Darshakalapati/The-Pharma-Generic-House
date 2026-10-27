import { PageHeader } from '@/components/admin/page-header';
import { ProductsManager } from '@/components/admin/products-manager';
import { createClient } from '@/lib/supabase/server';
import type { DirectoryProduct, Product } from '@/lib/types';

export const metadata = { title: 'Products' };

export default async function AdminProductsPage() {
  const supabase = createClient();

  // Featured rows come back whole for the photo cards. Directory rows are
  // ~4,000 and only need the table's four columns — searching and paging
  // through them in the browser is instant, and the payload stays small.
  const [featuredRes, directoryRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('listing_type', 'featured')
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('id, name, category, in_stock')
      .eq('listing_type', 'directory')
      .order('name', { ascending: true }),
  ]);

  return (
    <div>
      <PageHeader
        title="Products"
        description="The featured shelf holds the photo cards. The directory holds the salt-name list."
      />
      <ProductsManager
        products={(featuredRes.data as Product[] | null) ?? []}
        directory={(directoryRes.data as DirectoryProduct[] | null) ?? []}
      />
    </div>
  );
}
