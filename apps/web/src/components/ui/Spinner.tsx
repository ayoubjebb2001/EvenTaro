import { Loader2 } from 'lucide-react';

interface SpinnerProps {
    className?: string;
    text?: string;
}

export function Spinner({ className, text }: SpinnerProps) {
    return (
        <div className={`flex items-center justify-center gap-2 ${className ?? ''}`}>
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
            {text && (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{text}</span>
            )}
        </div>
    );
}

export function PageSpinner({ text = 'Loading…' }: { text?: string }) {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Spinner text={text} />
        </div>
    );
}
