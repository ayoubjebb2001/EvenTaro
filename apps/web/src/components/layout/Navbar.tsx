'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

const publicLinks = [
    { href: '/events', label: 'Events' },
];

export function Navbar() {
    const pathname = usePathname();
    const { user, isAuthenticated, loading, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    async function handleLogout() {
        await logout();
        window.location.href = '/';
    }

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-lg dark:border-zinc-700/50 dark:bg-zinc-900/80">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                    <CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-lg tracking-tight">EvenTaro</span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden items-center gap-1 md:flex">
                    {publicLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                pathname === link.href
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {!loading && isAuthenticated && user ? (
                        <>
                            <Link
                                href="/dashboard"
                                className={cn(
                                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    pathname?.startsWith('/dashboard')
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                                )}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <div className="ml-2 flex items-center gap-3">
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {user.fullName}
                                </span>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </Button>
                            </div>
                        </>
                    ) : !loading ? (
                        <div className="ml-2 flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Sign in</Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </div>
                    ) : null}
                </div>

                {/* Mobile hamburger */}
                <button
                    type="button"
                    className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="border-t border-zinc-200 bg-white px-4 pb-4 pt-2 dark:border-zinc-700 dark:bg-zinc-900 md:hidden">
                    <div className="flex flex-col gap-1">
                        {publicLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'rounded-lg px-3 py-2 text-sm font-medium',
                                    pathname === link.href
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {!loading && isAuthenticated && user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileOpen(false)}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                                    className="rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : !loading ? (
                            <div className="mt-2 flex flex-col gap-2">
                                <Link href="/login" onClick={() => setMobileOpen(false)}>
                                    <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                                </Link>
                                <Link href="/register" onClick={() => setMobileOpen(false)}>
                                    <Button size="sm" className="w-full">Register</Button>
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </header>
    );
}
