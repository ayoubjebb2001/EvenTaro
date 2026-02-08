import { CalendarDays } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-zinc-200/80 bg-white dark:border-zinc-700/50 dark:bg-zinc-900">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
                <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <CalendarDays className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    EvenTaro
                </Link>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    &copy; {new Date().getFullYear()} EvenTaro. Built with Next.js &amp; NestJS.
                </p>
            </div>
        </footer>
    );
}
