import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReserveButton } from './ReserveButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getEvent(id: string) {
  const res = await fetch(`${API_URL}/events/published/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800">
        <nav className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-white">
            EvenTaro
          </Link>
          <div className="flex gap-4">
            <Link href="/events" className="text-zinc-600 dark:text-zinc-300">
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
      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link href="/events" className="mb-6 inline-block text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
          ← Back to events
        </Link>
        <article className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {event.title}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {event.description}
          </p>
          <dl className="mt-4 grid gap-2 text-sm">
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-500">Date & time</dt>
              <dd className="text-zinc-900 dark:text-white">
                {new Date(event.dateTime).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-500">Location</dt>
              <dd className="text-zinc-900 dark:text-white">{event.location}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-500">Places</dt>
              <dd className="text-zinc-900 dark:text-white">
                {event.placesLeft ?? event.maxCapacity} left / {event.maxCapacity} max
              </dd>
            </div>
          </dl>
          <ReserveButton eventId={event.id} placesLeft={event.placesLeft ?? event.maxCapacity} />
        </article>
      </main>
    </div>
  );
}
