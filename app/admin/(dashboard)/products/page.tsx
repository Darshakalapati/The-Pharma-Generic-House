import { PageHeader } from '@/components/admin/page-header';
import { ProductsManager } from '@/components/admin/products-manager';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Products' };

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Add, edit, or remove products. Toggle in-stock without opening the editor."
      />
      <ProductsManager products={data ?? []} />
    </div>
  );
}
