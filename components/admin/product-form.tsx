'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from './image-upload';
import { ASPECT } from '@/lib/image-crop';
import { PRODUCT_CATEGORIES, DIRECTORY_CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { ListingType, Product, ProductCategory } from '@/lib/types';

const CATEGORY_VALUES = [
  ...PRODUCT_CATEGORIES.map((c) => c.value),
  ...DIRECTORY_CATEGORIES.map((c) => c.value),
] as [string, ...string[]];

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  // Both layers' values, since the select's options depend on the listing.
  category: z.enum(CATEGORY_VALUES),
  description: z.string().optional(),
  in_stock: z.boolean(),
  is_own_brand: z.boolean(),
  listing_type: z.enum(['featured', 'directory']),
});
type FormValues = z.infer<typeof formSchema>;

export function ProductForm({
  product,
  open,
  onOpenChange,
  defaultListingType = 'featured',
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Which layer a brand-new product starts in — follows the active tab. */
  defaultListingType?: ListingType;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(product?.image_url ?? null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name ?? '',
      category: (product?.category as ProductCategory) ?? 'general',
      description: product?.description ?? '',
      in_stock: product?.in_stock ?? true,
      is_own_brand: product?.is_own_brand ?? false,
      listing_type: product?.listing_type ?? defaultListingType,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: product?.name ?? '',
        category: (product?.category as ProductCategory) ?? 'general',
        description: product?.description ?? '',
        in_stock: product?.in_stock ?? true,
        is_own_brand: product?.is_own_brand ?? false,
        listing_type: product?.listing_type ?? defaultListingType,
      });
      setImageUrl(product?.image_url ?? null);
    }
  }, [open, product, reset, defaultListingType]);

  const submit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const toDirectory = data.listing_type === 'directory';
      const payload = {
        name: data.name.trim(),
        category: data.category,
        description: data.description?.trim() || null,
        // Directory rows carry neither, and the form hides both — so never
        // write a stale image or badge onto one.
        image_url: toDirectory ? null : imageUrl,
        in_stock: data.in_stock,
        is_own_brand: toDirectory ? false : data.is_own_brand,
        listing_type: data.listing_type,
      };
      if (product) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
        toast.success('Product updated.');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        toast.success('Product added.');
      }
      router.refresh();
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error('Could not save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDirectory = watch('listing_type') === 'directory';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit product' : 'Add product'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Update product details. Customers will see changes immediately.'
              : 'A new product will appear on the website right away.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label>Listing</Label>
            <div className="mt-1.5">
              <Select
                value={watch('listing_type')}
                onValueChange={(v) => {
                  const next = v as ListingType;
                  setValue('listing_type', next);
                  // Keep the category valid for the layer it just moved to.
                  const allowed = (
                    next === 'directory' ? DIRECTORY_CATEGORIES : PRODUCT_CATEGORIES
                  ).map((c) => c.value as string);
                  if (!allowed.includes(watch('category'))) {
                    setValue('category', next === 'directory' ? 'medicine' : 'general');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured shelf</SelectItem>
                  <SelectItem value="directory">Medicines directory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="mt-1 text-xs text-brand-muted">
              The featured shelf shows photo cards. The directory is the searchable
              salt-name list — no photo, no badge.
            </p>
          </div>

          {!isDirectory && (
            <div>
              <Label>Image</Label>
              <div className="mt-1.5">
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="products"
                  aspectRatio={ASPECT.productPhoto}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Paracetamol 500mg"
                {...register('name')}
                className={cn('mt-1.5', errors.name && 'border-destructive')}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label>Category</Label>
              <div className="mt-1.5">
                <Select
                  value={watch('category')}
                  onValueChange={(v) => setValue('category', v as ProductCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(isDirectory ? DIRECTORY_CATEGORIES : PRODUCT_CATEGORIES).map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Short description visible on the product card."
              {...register('description')}
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
            <div>
              <Label htmlFor="in_stock">In stock</Label>
              <p className="text-xs text-brand-muted">
                When off, customers see &quot;Out of stock&quot; and can&apos;t add to enquiry.
              </p>
            </div>
            <Switch
              id="in_stock"
              checked={watch('in_stock')}
              onCheckedChange={(v) => setValue('in_stock', v)}
            />
          </div>

          {!isDirectory && (
            <div className="flex items-center justify-between rounded-xl border border-brand-line bg-brand-cream/40 px-4 py-3">
              <div>
                <Label htmlFor="is_own_brand">Our own brand</Label>
                <p className="text-xs text-brand-muted">
                  Shows a &quot;Our own brand&quot; badge on the website.
                </p>
              </div>
              <Switch
                id="is_own_brand"
                checked={watch('is_own_brand')}
                onCheckedChange={(v) => setValue('is_own_brand', v)}
              />
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Saving...' : product ? 'Save changes' : 'Add product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
