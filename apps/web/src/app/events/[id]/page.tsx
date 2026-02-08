import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, MapPin, Users as UsersIcon } from 'lucide-react';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { ReserveButton } from './ReserveButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getEvent(id: string) {
  try {
    const res = await fetch(`${API_URL}/events/published/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
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
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Link
            href="/events"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>

          <Card>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white">
                  {event.title}
                </h1>
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {event.description}
                </p>
              </div>

              <div className="grid gap-4 rounded-lg bg-zinc-50 p-4 sm:grid-cols-3 dark:bg-zinc-800/50">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                    <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Date & time</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {formatDate(event.dateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                    <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Location</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                    <UsersIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Capacity</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {event.placesLeft ?? event.maxCapacity} / {event.maxCapacity} places left
                    </p>
                  </div>
                </div>
              </div>

              <ReserveButton eventId={event.id} placesLeft={event.placesLeft ?? event.maxCapacity} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
