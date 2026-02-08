import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variantStyles[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}

/** Map reservation / event status strings to badge variants. */
export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, BadgeProps['variant']> = {
        CONFIRMED: 'success',
        PUBLISHED: 'success',
        PENDING: 'warning',
        DRAFT: 'info',
        CANCELLED: 'danger',
        REFUSED: 'danger',
    };

    return <Badge variant={map[status] ?? 'default'}>{status}</Badge>;
}
