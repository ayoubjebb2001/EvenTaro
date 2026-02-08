'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, XCircle, CalendarDays, MapPin, Clock } from 'lucide-react';
import { api, getAccessToken } from '@/lib/api';
import type { ReservationResponse } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
    Card, CardContent, Button, StatusBadge,
    ErrorAlert, PageSpinner,
} from '@/components/ui';

export default function DashboardPage() {
    const [reservations, setReservations] = useState<ReservationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState<string | null>(null);

    useEffect(() => {
        api.reservations
            .getMy()
            .then(setReservations)
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, []);

    async function handleCancel(id: string) {
        setCancelling(id);
        setError('');
        try {
            await api.reservations.cancel(id);
            setReservations((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r)),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Cancel failed');
        } finally {
            setCancelling(null);
        }
    }

    function handleDownloadTicket(id: string) {
        const token = getAccessToken();
        if (!token) return;
        const url = api.reservations.ticketUrl(id);
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => res.blob())
            .then((blob) => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'ticket.pdf';
                a.click();
                URL.revokeObjectURL(a.href);
            });
    }

    if (loading) return <PageSpinner text="Loading your reservations…" />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    My Reservations
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    View and manage your event reservations.
                </p>
            </div>

            {error && <ErrorAlert message={error} />}

            {reservations.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <CalendarDays className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-lg font-medium text-zinc-900 dark:text-white">No reservations yet</p>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Browse events and reserve your spot.
                        </p>
                        <Link href="/events" className="mt-4">
                            <Button variant="secondary">Browse events</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {reservations.map((r) => (
                        <Card key={r.id}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h2 className="truncate font-semibold text-zinc-900 dark:text-white">
                                            {r.event?.title ?? 'Event'}
                                        </h2>
                                        {r.event && (
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDate(r.event.dateTime)}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {r.event.location}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <StatusBadge status={r.status} />
                                </div>

                                {r.status === 'CONFIRMED' && (
                                    <div className="mt-4 flex gap-2">
                                        <Button size="sm" onClick={() => handleDownloadTicket(r.id)}>
                                            <Download className="h-3.5 w-3.5" />
                                            Ticket
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancel(r.id)}
                                            disabled={cancelling === r.id}
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                            {cancelling === r.id ? 'Cancelling…' : 'Cancel'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
