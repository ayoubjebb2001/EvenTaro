'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const isAdmin = user.role === 'ADMIN';

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <nav className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-zinc-900 dark:text-white">
            EvenTaro · Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.fullName} ({user.role})
            </span>
            <Link
              href="/events"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Events
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className={`text-sm ${pathname?.startsWith('/dashboard/admin') ? 'font-medium text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
