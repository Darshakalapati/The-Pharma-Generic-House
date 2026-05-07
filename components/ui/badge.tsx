import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-purple/10 text-brand-purple',
        accent: 'border-transparent bg-brand-teal/10 text-brand-teal-deep',
        outline: 'border-brand-line text-brand-ink',
        muted: 'border-transparent bg-brand-cream-warm text-brand-muted',
        success: 'border-transparent bg-brand-teal/15 text-brand-teal-deep',
        warning: 'border-transparent bg-warning/20 text-[#7a5a18]',
        destructive: 'border-transparent bg-destructive/10 text-destructive',
        info: 'border-transparent bg-brand-purple/10 text-brand-purple',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
