import { AlertCircle } from 'lucide-react';

interface AlertProps {
    message: string;
    className?: string;
}

export function ErrorAlert({ message, className }: AlertProps) {
    if (!message) return null;
    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400 ${className ?? ''}`}
        >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}
