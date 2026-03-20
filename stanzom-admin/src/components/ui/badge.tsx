import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-(--color-gold) focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-(--color-gold)/15 text-(--color-gold)',
        success:
          'border-transparent bg-(--color-green)/15 text-(--color-green)',
        destructive:
          'border-transparent bg-(--color-red)/15 text-(--color-red)',
        info:
          'border-transparent bg-(--color-blue)/15 text-(--color-blue)',
        purple:
          'border-transparent bg-(--color-purple)/15 text-(--color-purple)',
        outline:
          'border-(--color-border) text-(--color-text)',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
