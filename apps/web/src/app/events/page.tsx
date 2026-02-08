import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getPublishedEvents() {
  const res = await fetch(`${API_URL}/events/published`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function EventsPage() {
  const events = await getPublishedEvents();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <nav className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-white">
            EvenTaro
          </Link>
          <div className="flex gap-4">
            <Link href="/events" className="font-medium text-zinc-900 dark:text-white">
              Events
            </Link>
            <Link href="/login" className="text-zinc-600 dark:text-zinc-300">
              Sign in
            </Link>
            <Link href="/register" className="text-zinc-600 dark:text-zinc-300">
              Register
            </Link>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
          Published events
        </h1>
        {events.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No events available.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {events.map((event: { id: string; title: string; dateTime: string; location: string; placesLeft?: number }) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                >
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(event.dateTime).toLocaleString()} · {event.location}
                  </p>
                  {event.placesLeft !== undefined && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                      {event.placesLeft} places left
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
