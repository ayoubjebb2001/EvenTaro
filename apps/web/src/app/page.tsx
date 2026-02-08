import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <nav className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-white">
            EvenTaro
          </Link>
          <div className="flex gap-4">
            <Link
              href="/events"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Events
            </Link>
            <Link
              href="/login"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-white">
          Event Management Platform
        </h1>
        <p className="mb-8 max-w-lg text-zinc-600 dark:text-zinc-400">
          Browse published events and reserve your place. Sign in to manage your reservations.
        </p>
        <Link
          href="/events"
          className="rounded bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          View events
        </Link>
      </main>
    </div>
  );
}
