'use client';

import * as React from 'react';
import { Plus, Edit, Trash2, ImageOff, Upload } from 'lucide-react';
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
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import type { Product } from '@/lib/types';

export function ProductsManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<Product | null>(null);
  const [working, setWorking] = React.useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const startCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const startEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const toggleStock = async (p: Product) => {
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

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 mb-5">
        <Button variant="outline" onClick={() => setBulkOpen(true)}>
          <Upload className="h-4 w-4" /> Bulk Upload
        </Button>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      {products.length === 0 ? (
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

      <ProductForm product={editing} open={formOpen} onOpenChange={setFormOpen} />

      <BulkUploadProducts products={products} open={bulkOpen} onOpenChange={setBulkOpen} />

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
