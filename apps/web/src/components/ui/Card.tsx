import { cn } from '@/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/50',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return (
        <div className={cn('border-b border-zinc-100 px-6 py-4 dark:border-zinc-700/50', className)}>
            {children}
        </div>
    );
}

export function CardContent({ children, className }: CardProps) {
    return <div className={cn('px-6 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
    return (
        <div
            className={cn(
                'border-t border-zinc-100 px-6 py-4 dark:border-zinc-700/50',
                className,
            )}
        >
            {children}
        </div>
    );
}
