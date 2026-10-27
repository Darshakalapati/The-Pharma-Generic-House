'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, ImageOff, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ProductForm } from './product-form';
import { BulkUploadProducts } from './bulk-upload-products';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCT_CATEGORIES, DIRECTORY_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { DirectoryProduct, ListingType, Product } from '@/lib/types';

/** Rows per page in the directory table. */
const PAGE_SIZE = 100;

const CATEGORY_LABEL = new Map<string, string>(
  [...PRODUCT_CATEGORIES, ...DIRECTORY_CATEGORIES].map((c) => [c.value, c.label])
);

export function ProductsManager({
  products,
  directory,
}: {
  products: Product[];
  directory: DirectoryProduct[];
}) {
  const router = useRouter();
  const [layer, setLayer] = React.useState<ListingType>('featured');
  const [dirQuery, setDirQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  /** The listing a newly created product should default to. */
  const [createAs, setCreateAs] = React.useState<ListingType>('featured');
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<{ id: string; name: string } | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const startCreate = () => {
    setEditing(null);
    setCreateAs(layer);
    setFormOpen(true);
  };
  const startEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const toggleStock = async (p: { id: string; in_stock: boolean }) => {
    setWorking(p.id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .update({ in_stock: !p.in_stock })
        .eq('id', p.id);
      if (error) throw error;
      toast.success(`Marked ${!p.in_stock ? 'in stock' : 'out of stock'}.`);
      router.refresh();
    } catch (e: any) {
      toast.error('Could not update.');
    } finally {
      setWorking(null);
    }
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    setWorking(confirmDel.id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', confirmDel.id);
      if (error) throw error;
      toast.success('Product deleted.');
      setConfirmDel(null);
      router.refresh();
    } catch (e: any) {
      toast.error('Could not delete.');
    } finally {
      setWorking(null);
    }
  };

  const allNames = React.useMemo(
    () => [...products.map((p) => p.name), ...directory.map((d) => d.name)],
    [products, directory]
  );

  const dirFiltered = React.useMemo(() => {
    const q = dirQuery.trim().toLowerCase();
    if (!q) return directory;
    return directory.filter((d) => d.name.toLowerCase().includes(q));
  }, [directory, dirQuery]);

  const pageCount = Math.max(1, Math.ceil(dirFiltered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = dirFiltered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  // A new search should start at the first page of its own results.
  React.useEffect(() => {
    setPage(0);
  }, [dirQuery]);

  return (
    <>
      <Tabs value={layer} onValueChange={(v) => setLayer(v as ListingType)}>
        <TabsList>
          <TabsTrigger value="featured">Featured ({products.length})</TabsTrigger>
          <TabsTrigger value="directory">
            Directory ({directory.length.toLocaleString()})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-5 flex flex-wrap justify-end gap-2 mb-5">
        <Button variant="outline" onClick={() => setBulkOpen(true)}>
          <Upload className="h-4 w-4" /> Bulk Upload
        </Button>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      {layer === 'directory' ? (
        <DirectoryTable
          rows={pageRows}
          total={directory.length}
          matching={dirFiltered.length}
          query={dirQuery}
          onQuery={setDirQuery}
          page={safePage}
          pageCount={pageCount}
          onPage={setPage}
          working={working}
          onToggleStock={toggleStock}
          onEdit={(row) =>
            startEdit({
              id: row.id,
              name: row.name,
              category: row.category as Product['category'],
              description: null,
              image_url: null,
              in_stock: row.in_stock,
              is_own_brand: false,
              listing_type: 'directory',
              created_at: '',
            })
          }
          onDelete={(row) => setConfirmDel(row)}
        />
      ) : products.length === 0 ? (
        <div className="surface-card p-10 text-center text-brand-muted">
          No products yet. Click &quot;Add product&quot; to add one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const cat = PRODUCT_CATEGORIES.find((c) => c.value === p.category);
            return (
              <div key={p.id} className="surface-card overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-brand-cream-warm relative overflow-hidden">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-brand-muted">
                      <ImageOff className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="muted">{cat?.label ?? p.category}</Badge>
                    <div className="flex items-center gap-2 text-xs text-brand-muted">
                      <span>In stock</span>
                      <Switch
                        checked={p.in_stock}
                        disabled={working === p.id}
                        onCheckedChange={() => toggleStock(p)}
                      />
                    </div>
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-semibold leading-snug">{p.name}</h3>
                  {p.description && (
                    <p className="mt-1 text-sm text-brand-muted line-clamp-2">{p.description}</p>
                  )}
                  <div className="mt-4 pt-3 border-t border-brand-line/70 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(p)} className="flex-1">
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDel(p)}
                      className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProductForm
        product={editing}
        defaultListingType={createAs}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <BulkUploadProducts
        existingNames={allNames}
        open={bulkOpen}
        onOpenChange={setBulkOpen}
      />

      <Dialog open={!!confirmDel} onOpenChange={(v) => !v && setConfirmDel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              <strong>{confirmDel?.name}</strong> will be removed permanently. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={working === confirmDel?.id}
              onClick={doDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Compact table for the salt directory. Photo cards do not scale to 4,000
 * rows, and neither does scrolling them all at once — this searches the whole
 * list in memory and renders one page of 100.
 */
function DirectoryTable({
  rows,
  total,
  matching,
  query,
  onQuery,
  page,
  pageCount,
  onPage,
  working,
  onToggleStock,
  onEdit,
  onDelete,
}: {
  rows: DirectoryProduct[];
  total: number;
  matching: number;
  query: string;
  onQuery: (v: string) => void;
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
  working: string | null;
  onToggleStock: (p: { id: string; in_stock: boolean }) => void;
  onEdit: (row: DirectoryProduct) => void;
  onDelete: (row: DirectoryProduct) => void;
}) {
  return (
    <div>
      <div className="relative max-w-sm">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by name"
          aria-label="Search the directory by name"
          className="h-10 w-full rounded-lg border border-brand-line bg-white pl-9 pr-3 text-sm text-brand-ink outline-none focus:border-brand-purple"
        />
      </div>

      <p className="mt-2 text-xs text-brand-muted tabular-nums">
        {query.trim()
          ? `${matching.toLocaleString()} of ${total.toLocaleString()} items`
          : `${total.toLocaleString()} items`}
      </p>

      {rows.length === 0 ? (
        <div className="mt-4 surface-card p-10 text-center text-brand-muted">
          {total === 0
            ? 'The directory is empty. Use Bulk Upload and choose "Medicines directory".'
            : 'No directory item matches that name.'}
        </div>
      ) : (
        <>
          <div className="mt-4 surface-card overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <thead className="bg-brand-cream-warm text-left text-xs text-brand-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Name</th>
                  <th className="px-4 py-2.5 font-semibold">Category</th>
                  <th className="px-4 py-2.5 font-semibold">In stock</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-2.5 font-medium text-brand-ink">{row.name}</td>
                    <td className="px-4 py-2.5 text-brand-muted">
                      {CATEGORY_LABEL.get(row.category) ?? row.category}
                    </td>
                    <td className="px-4 py-2.5">
                      <Switch
                        checked={row.in_stock}
                        disabled={working === row.id}
                        onCheckedChange={() => onToggleStock(row)}
                        aria-label={`${row.name} in stock`}
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => onEdit(row)}>
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(row)}
                          className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => onPage(page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </Button>
              <p className={cn('text-xs text-brand-muted tabular-nums')}>
                Page {page + 1} of {pageCount.toLocaleString()}
              </p>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pageCount - 1}
                onClick={() => onPage(page + 1)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
