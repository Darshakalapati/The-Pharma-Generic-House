'use client';

import { Search } from 'lucide-react';
import { useSearch } from './search-modal';
import { useT } from './i18n/language-provider';
import { cn } from '@/lib/utils';

export function SearchButton({ className }: { className?: string }) {
  const { open } = useSearch();
  const { dict } = useT();
  return (
    <button
      type="button"
      onClick={open}
      aria-label={dict.search.open}
      title={dict.search.open}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg text-ink',
        'transition-colors hover:bg-sand',
        className
      )}
    >
      <Search className="h-5 w-5" />
    </button>
  );
}
