'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus, CheckCircle2, XCircle, Ban, Pencil,
    BarChart3, CalendarDays, Users as UsersIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api, type EventResponse, type ReservationResponse } from '@/lib/api';
import {
    Card, CardContent, CardHeader, Button, StatusBadge,
    ErrorAlert, PageSpinner, Badge,
} from '@/components/ui';

interface Stats {
    PENDING: number;
    CONFIRMED: number;
    REFUSED: number;
    CANCELLED: number;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [reservations, setReservations] = useState<ReservationResponse[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isAdmin = user?.role === 'ADMIN';

    const loadReservations = useCallback(async () => {
        try {
            const res = await api.reservations.getAll();
            setReservations(res);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            router.replace('/dashboard');
            return;
        }
        Promise.all([
            api.events.getAll(),
            api.reservations.getAll().catch(() => [] as ReservationResponse[]),
            api.reservations.getStats().catch(() => null),
        ])
            .then(([evts, res, st]) => {
                setEvents(evts);
                setReservations(res);
                setStats(st);
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [isAdmin, router]);

    async function handleAction(id: string, action: 'confirm' | 'refuse' | 'cancel') {
        setError('');
        try {
            await api.reservations[action](id);
            await loadReservations();
            const newStats = await api.reservations.getStats().catch(() => null);
            if (newStats) setStats(newStats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Action failed');
        }
    }

    if (!isAdmin) return null;
    if (loading) return <PageSpinner text="Loading admin data…" />;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Manage events, reservations, and view analytics.
                    </p>
                </div>
                <Link href="/dashboard/admin/events/new">
                    <Button>
                        <Plus className="h-4 w-4" />
                        New Event
                    </Button>
                </Link>
            </div>

            {error && <ErrorAlert message={error} />}

            {/* Stats cards */}
            {stats && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {([
                        { label: 'Pending', value: stats.PENDING, variant: 'warning' as const, icon: CalendarDays },
                        { label: 'Confirmed', value: stats.CONFIRMED, variant: 'success' as const, icon: CheckCircle2 },
                        { label: 'Refused', value: stats.REFUSED, variant: 'danger' as const, icon: XCircle },
                        { label: 'Cancelled', value: stats.CANCELLED, variant: 'default' as const, icon: Ban },
                    ]).map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-lg bg-zinc-100 p-2.5 dark:bg-zinc-700/50">
                                    <stat.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Events */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Events</h2>
                        <Badge variant="default">{events.length}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {events.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                            No events created yet.
                        </p>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                            {events.map((ev) => (
                                <div
                                    key={ev.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <span className="font-medium text-zinc-900 dark:text-white">{ev.title}</span>
                                            <div className="mt-0.5 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                                <UsersIcon className="h-3.5 w-3.5" />
                                                {ev.placesLeft ?? ev.maxCapacity}/{ev.maxCapacity} places
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={ev.status} />
                                        <Link href={`/dashboard/admin/events/${ev.id}/edit`}>
                                            <Button variant="outline" size="sm">
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Reservations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">All Reservations</h2>
                        <Badge variant="default">{reservations.length}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {reservations.length === 0 ? (
                        <p className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                            No reservations yet.
                        </p>
                    ) : (
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                            {reservations.map((r) => (
                                <div
                                    key={r.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <span className="font-medium text-zinc-900 dark:text-white">
                                                {r.event?.title ?? r.eventId}
                                            </span>
                                        </div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <div className="flex gap-2">
                                        {r.status === 'PENDING' && (
                                            <>
                                                <Button size="sm" onClick={() => handleAction(r.id, 'confirm')}>
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Confirm
                                                </Button>
                                                <Button variant="danger" size="sm" onClick={() => handleAction(r.id, 'refuse')}>
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Refuse
                                                </Button>
                                            </>
                                        )}
                                        {(r.status === 'CONFIRMED' || r.status === 'PENDING') && (
                                            <Button variant="outline" size="sm" onClick={() => handleAction(r.id, 'cancel')}>
                                                <Ban className="h-3.5 w-3.5" />
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
