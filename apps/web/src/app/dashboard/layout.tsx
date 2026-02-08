'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { LayoutDashboard, CalendarDays, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { PageSpinner, Button } from '@/components/ui';

const userLinks = [
    { href: '/dashboard', label: 'My Reservations', icon: CalendarDays },
];

const adminLinks = [
    { href: '/dashboard/admin', label: 'Admin Panel', icon: ShieldCheck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, loading, logout } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) return <PageSpinner />;
    if (!isAuthenticated || !user) return null;

    const isAdmin = user.role === 'ADMIN';

    async function handleLogout() {
        await logout();
        router.push('/');
    }

    const navLinks = [...userLinks, ...(isAdmin ? adminLinks : [])];

    return (
        <div className="flex min-h-screen flex-col">
            {/* Dashboard header */}
            <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-lg dark:border-zinc-700/50 dark:bg-zinc-900/80">
                <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                            <LayoutDashboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-lg tracking-tight">Dashboard</span>
                        </Link>

                        <div className="hidden items-center gap-1 md:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href))
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/events"
                                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            >
                                Browse Events
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="hidden text-sm text-zinc-500 sm:inline dark:text-zinc-400">
                            {user.fullName}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sign out</span>
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Content */}
            <main className="flex-1 bg-zinc-50/50 dark:bg-zinc-900">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
            </main>
        </div>
    );
}
