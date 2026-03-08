'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 text-center',
    {
        variants: {
            variant: {
                primary: 'bg-accent text-accent-foreground hover:bg-accent-hover shadow-lg shadow-accent/20 hover:shadow-accent/40',
                outline: 'border-2 border-accent text-accent hover:bg-accent/5',
                secondary: 'bg-surface-secondary text-foreground hover:bg-surface-tertiary border border-border',
                ghost: 'hover:bg-accent/10 text-muted hover:text-accent',
                link: 'text-accent underline-offset-4 hover:underline px-0 py-0 h-auto inline-block',
            },
            size: {
                sm: 'h-9 px-4 text-xs',
                md: 'h-11 px-6',
                lg: 'h-14 px-10 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends Omit<HTMLMotionProps<'button'>, keyof VariantProps<typeof buttonVariants>>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        // Patrón robusto para asChild con motion
        const Comp = asChild ? Slot : 'button';
        const MotionComp = motion(Comp as any);

        return (
            <MotionComp
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref as any}
                {...(props as any)}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
