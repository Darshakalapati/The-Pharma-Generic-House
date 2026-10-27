'use client';

import * as React from 'react';
import { Download, Upload, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  buildTemplateCsv,
  normalizeBulkRows,
  BULK_HEADERS,
  type BulkProductRow,
  type BulkRowError,
  type BulkUploadResponse,
} from '@/lib/bulk-products';
import { ALL_CATEGORY_VALUES, DIRECTORY_CATEGORIES } from '@/lib/constants';
import type { ListingType } from '@/lib/types';

const PREVIEW_LIMIT = 5;
/**
 * Rows per request. The server upserts in one go per batch; sending the file in
 * batches is what makes a 4,000-row import both progress-reportable and immune
 * to a single long-running request timing out.
 */
const BATCH_SIZE = 500;
const DIRECTORY_CATEGORY_LIST = DIRECTORY_CATEGORIES.map((c) => c.value).join('/');

export function BulkUploadProducts({
  existingNames: existingNameList,
  open,
  onOpenChange,
}: {
  /**
   * Every product name already in the table, across BOTH layers — an import
   * upserts on `name`, so a row matching a featured product updates it even
   * when the directory is the chosen target.
   */
  existingNames: string[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parsing, setParsing] = React.useState(false);
  const [rows, setRows] = React.useState<BulkProductRow[]>([]);
  const [errors, setErrors] = React.useState<BulkRowError[]>([]);
  const [rawRows, setRawRows] = React.useState<Record<string, unknown>[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [listingType, setListingType] = React.useState<ListingType>('featured');
  /** Rows accepted so far, for the "1,500 / 4,046" line. */
  const [progress, setProgress] = React.useState(0);

  const existingNames = React.useMemo(
    () => new Set(existingNameList.map((n) => n.trim().toLowerCase())),
    [existingNameList]
  );

  const newCount = rows.filter((r) => !existingNames.has(r.name.toLowerCase())).length;
  const updateCount = rows.length - newCount;

  const reset = React.useCallback(() => {
    setFileName(null);
    setRows([]);
    setErrors([]);
    setRawRows([]);
    setParsing(false);
    setSaving(false);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const downloadTemplate = () => {
    // Prepend a UTF-8 BOM so Excel opens the file with the right encoding.
    const blob = new Blob(['﻿', buildTemplateCsv()], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setParsing(true);
    setFileName(file.name);
    try {
      const isCsv =
        file.type === 'text/csv' || /\.csv$/i.test(file.name) || file.type === 'text/plain';
      const parsed = isCsv ? await parseCsv(file) : await parseExcel(file);

      if (parsed.length === 0) {
        toast.error('That file had no rows.');
        reset();
        return;
      }

      const { rows: clean, errors: rowErrors } = normalizeBulkRows(parsed);
      setRawRows(parsed);
      setRows(clean);
      setErrors(rowErrors);
    } catch (e) {
      console.error(e);
      toast.error('Could not read that file. Save it as .csv or .xlsx and try again.');
      reset();
    } finally {
      setParsing(false);
    }
  };

  const saveAll = async () => {
    if (rows.length === 0 || errors.length > 0) return;
    setSaving(true);
    setProgress(0);

    // Batches go out one after another, never in parallel: each one upserts on
    // `name`, and two concurrent batches touching the same name would have
    // Postgres reject the whole statement.
    let saved = 0;
    const failures: BulkRowError[] = [];
    try {
      for (let i = 0; i < rawRows.length; i += BATCH_SIZE) {
        const batch = rawRows.slice(i, i + BATCH_SIZE);
        const res = await fetch('/api/admin/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: batch, listingType }),
        });
        const data = (await res.json()) as BulkUploadResponse;

        if (!res.ok) {
          if (data.failures?.length) setErrors(data.failures);
          toast.error(
            saved > 0
              ? `${data.error ?? 'Upload failed.'} ${saved} row(s) were already saved.`
              : (data.error ?? 'Upload failed.')
          );
          if (saved > 0) router.refresh();
          return;
        }

        saved += data.saved ?? 0;
        if (data.failures?.length) failures.push(...data.failures);
        setProgress(saved + failures.length);
      }

      if (failures.length > 0) {
        setErrors(failures);
        toast.error(
          `Saved ${saved} of ${rows.length}. ${failures.length} row(s) failed — see the list.`
        );
        router.refresh();
        return;
      }

      toast.success(
        `Uploaded ${saved.toLocaleString()} product${saved === 1 ? '' : 's'} to the ${
          listingType === 'directory' ? 'medicines directory' : 'featured shelf'
        }`
      );
      router.refresh();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('Could not reach the server. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = rows.length > 0 && errors.length === 0 && !saving && !parsing;

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk upload products</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to add or update many products at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 1 — Template */}
          <section>
            <Label>1. Import as</Label>
            <div className="mt-2 inline-flex rounded-lg border border-brand-line p-1">
              {([
                ['featured', 'Featured shelf'],
                ['directory', 'Medicines directory'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  disabled={saving}
                  onClick={() => setListingType(value)}
                  aria-pressed={listingType === value}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50',
                    listingType === value
                      ? 'bg-brand-purple text-brand-cream'
                      : 'text-brand-ink hover:bg-brand-cream-warm'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-brand-muted">
              {listingType === 'directory'
                ? `Columns: name, category (${DIRECTORY_CATEGORY_LIST}), description, image_url, in_stock. Description and image can be blank.`
                : 'Rows land on the curated photo shelf, where an image is worth having.'}
            </p>
          </section>

          <section>
            <Label>2. Download the template</Label>
            <div className="mt-2">
              <Button type="button" variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4" /> Download Template
              </Button>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-brand-muted list-disc list-inside">
              <li>
                <code className="text-brand-ink">category</code> must be one of:{' '}
                {ALL_CATEGORY_VALUES.join(', ')}
              </li>
              <li>
                <code className="text-brand-ink">in_stock</code> must be true or false (blank
                counts as true)
              </li>
              <li>
                <code className="text-brand-ink">image_url</code> can be blank
              </li>
              <li>
                <code className="text-brand-ink">is_own_brand</code> is optional — true only for
                your own brands (blank counts as false)
              </li>
              <li>
                If a product with the same name already exists, it will be updated. Otherwise, a
                new one is added.
              </li>
            </ul>
          </section>

          {/* 2 — Upload */}
          <section>
            <Label htmlFor="bulk-file">3. Upload your file</Label>
            <input
              ref={inputRef}
              id="bulk-file"
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={saving}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="mt-2 block w-full text-sm text-brand-ink file:mr-3 file:rounded-md file:border file:border-brand-line file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-purple hover:file:bg-brand-cream-warm"
            />
            {fileName && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-muted">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                {fileName}
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Clear file"
                  className="ml-1 text-brand-muted hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </p>
            )}
            {parsing && <p className="mt-2 text-xs text-brand-muted">Reading file…</p>}
          </section>

          {/* 3 — Preview */}
          {(rows.length > 0 || errors.length > 0) && (
            <section>
              <Label>3. Preview</Label>

              <p className="mt-2 text-sm text-brand-ink">
                This file contains {rows.length + errors.length} product
                {rows.length + errors.length === 1 ? '' : 's'}.{' '}
                {errors.length === 0 ? (
                  <>
                    {newCount} {newCount === 1 ? 'is' : 'are'} new, {updateCount} will be updated.
                  </>
                ) : (
                  <span className="text-destructive">
                    {errors.length} row{errors.length === 1 ? '' : 's'} need fixing before you can
                    save.
                  </span>
                )}
              </p>

              {errors.length > 0 && (
                <ul className="mt-3 space-y-1.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                  {errors.slice(0, 20).map((e, i) => (
                    <li
                      key={`${e.rowNumber}-${i}`}
                      className="flex items-start gap-2 text-xs text-destructive"
                    >
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>
                        <strong>Row {e.rowNumber}</strong>
                        {e.name && e.name !== '(no name)' ? ` (${e.name})` : ''}: {e.message}
                      </span>
                    </li>
                  ))}
                  {errors.length > 20 && (
                    <li className="text-xs text-destructive">
                      …and {errors.length - 20} more.
                    </li>
                  )}
                </ul>
              )}

              {rows.length > 0 && (
                <div className="mt-3 overflow-x-auto rounded-xl border border-brand-line">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-cream-warm text-brand-muted">
                      <tr>
                        {BULK_HEADERS.map((h) => (
                          <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                        <th className="px-3 py-2 font-semibold whitespace-nowrap">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-line">
                      {rows.slice(0, PREVIEW_LIMIT).map((r) => {
                        const isNew = !existingNames.has(r.name.toLowerCase());
                        return (
                          <tr key={r.rowNumber} className="text-brand-ink">
                            <td className="px-3 py-2 whitespace-nowrap">{r.name}</td>
                            <td className="px-3 py-2">{r.category}</td>
                            <td className="px-3 py-2 max-w-[16rem] truncate">
                              {r.description ?? '—'}
                            </td>
                            <td className="px-3 py-2 max-w-[12rem] truncate">
                              {r.image_url ?? '—'}
                            </td>
                            <td className="px-3 py-2">{String(r.in_stock)}</td>
                            <td className="px-3 py-2">{String(r.is_own_brand)}</td>
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  'inline-flex rounded-full px-2 py-0.5 text-[0.7rem] font-medium',
                                  isNew
                                    ? 'bg-brand-teal/15 text-brand-teal-deep'
                                    : 'bg-brand-purple/10 text-brand-purple'
                                )}
                              >
                                {isNew ? 'new' : 'update'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {rows.length > PREVIEW_LIMIT && (
                    <p className="border-t border-brand-line px-3 py-2 text-xs text-brand-muted">
                      Showing the first {PREVIEW_LIMIT} of {rows.length} rows.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* 4 — Save */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-brand-line">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveAll} disabled={!canSave} className="flex-1">
              <Upload className="h-4 w-4" />
              {saving
                ? `Saving ${progress.toLocaleString()} / ${rows.length.toLocaleString()}…`
                : `Save all${rows.length ? ` (${rows.length.toLocaleString()})` : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** CSV via papaparse. Loaded on demand so it stays out of the initial bundle. */
async function parseCsv(file: File): Promise<Record<string, unknown>[]> {
  const Papa = (await import('papaparse')).default;
  const text = await file.text();
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });
  return result.data ?? [];
}

/** Excel via SheetJS — first worksheet only. */
async function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
}
