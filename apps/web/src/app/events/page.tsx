import Link from 'next/link';
import { CalendarDays, MapPin, Users as UsersIcon } from 'lucide-react';
import { Navbar } from '@/components/layout';
import { Footer } from '@/components/layout';
import { Card, CardContent, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface PublishedEvent {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    location: string;
    maxCapacity: number;
    placesLeft?: number;
}

async function getPublishedEvents(): Promise<PublishedEvent[]> {
    try {
        const res = await fetch(`${API_URL}/events/published`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function EventsPage() {
    const events = await getPublishedEvents();

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                    {/* Page header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                            Published Events
                        </h1>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Browse upcoming events and reserve your spot.
                        </p>
                    </div>

                    {/* Event grid */}
                    {events.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <CalendarDays className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                                <p className="text-lg font-medium text-zinc-900 dark:text-white">No events available</p>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    Check back later for upcoming events.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.id}`}
                                    className="group"
                                >
                                    <Card className="h-full transition-shadow hover:shadow-md">
                                        <CardContent className="flex h-full flex-col p-5">
                                            <div className="mb-3 flex items-start justify-between gap-2">
                                                <h2 className="font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                                    {event.title}
                                                </h2>
                                                {event.placesLeft !== undefined && event.placesLeft <= 5 && event.placesLeft > 0 && (
                                                    <Badge variant="warning">Few left</Badge>
                                                )}
                                                {event.placesLeft !== undefined && event.placesLeft <= 0 && (
                                                    <Badge variant="danger">Full</Badge>
                                                )}
                                            </div>

                                            <p className="mb-4 line-clamp-2 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                                                {event.description}
                                            </p>

                                            <div className="space-y-2 border-t border-zinc-100 pt-3 text-sm dark:border-zinc-700/50">
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                                    <CalendarDays className="h-4 w-4 shrink-0" />
                                                    <span>{formatDate(event.dateTime)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                                    <MapPin className="h-4 w-4 shrink-0" />
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                                    <UsersIcon className="h-4 w-4 shrink-0" />
                                                    <span>{event.placesLeft ?? event.maxCapacity} places left</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
