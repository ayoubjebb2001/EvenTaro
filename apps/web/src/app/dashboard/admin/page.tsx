'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, type EventResponse, type ReservationResponse } from '@/lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [stats, setStats] = useState<{ PENDING: number; CONFIRMED: number; REFUSED: number; CANCELLED: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
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
  }, [user?.role, router]);

  async function loadReservations() {
    try {
      const res = await api.reservations.getAll();
      setReservations(res);
    } catch {
      setReservations([]);
    }
  }

  async function handleConfirm(id: string) {
    setError('');
    try {
      await api.reservations.confirm(id);
      await loadReservations();
      if (stats) setStats((s) => s && { ...s, CONFIRMED: s.CONFIRMED + 1, PENDING: s.PENDING - 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function handleRefuse(id: string) {
    setError('');
    try {
      await api.reservations.refuse(id);
      await loadReservations();
      if (stats) setStats((s) => s && { ...s, REFUSED: s.REFUSED + 1, PENDING: s.PENDING - 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function handleCancel(id: string) {
    setError('');
    try {
      await api.reservations.cancel(id);
      await loadReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  if (user?.role !== 'ADMIN') return null;
  if (loading) return <p className="text-zinc-600 dark:text-zinc-400">Loading…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Admin dashboard
      </h1>
      {error && (
        <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}
      {stats && (
        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-3 font-semibold text-zinc-900 dark:text-white">
            Reservations by status
          </h2>
          <ul className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <li>PENDING: {stats.PENDING}</li>
            <li>CONFIRMED: {stats.CONFIRMED}</li>
            <li>REFUSED: {stats.REFUSED}</li>
            <li>CANCELLED: {stats.CANCELLED}</li>
          </ul>
        </section>
      )}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Events
          </h2>
          <Link
            href="/dashboard/admin/events/new"
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            New event
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No events.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div>
                  <span className="font-medium text-zinc-900 dark:text-white">{ev.title}</span>
                  <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-500">
                    {ev.status} · {ev.placesLeft ?? ev.maxCapacity}/{ev.maxCapacity} places
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/admin/events/${ev.id}/edit`}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:text-zinc-300"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-white">
          My reservations (admin view)
        </h2>
        {reservations.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">No reservations.</p>
        ) : (
          <ul className="space-y-2">
            {reservations.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
              >
                <div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {r.event?.title ?? r.eventId}
                  </span>
                  <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-500">
                    {r.status}
                  </span>
                </div>
                {r.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirm(r.id)}
                      className="rounded bg-green-700 px-2 py-1 text-sm text-white hover:bg-green-800"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRefuse(r.id)}
                      className="rounded bg-red-700 px-2 py-1 text-sm text-white hover:bg-red-800"
                    >
                      Refuse
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(r.id)}
                      className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {(r.status === 'CONFIRMED' || r.status === 'REFUSED') && (
                  <button
                    type="button"
                    onClick={() => handleCancel(r.id)}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600"
                  >
                    Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
