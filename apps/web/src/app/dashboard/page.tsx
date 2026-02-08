'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, getAccessToken } from '@/lib/api';
import type { ReservationResponse } from '@/lib/api';

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
        prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
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
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'ticket.pdf');
    a.style.display = 'none';
    document.body.appendChild(a);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        a.href = u;
        a.click();
        URL.revokeObjectURL(u);
      })
      .finally(() => document.body.removeChild(a));
  }

  if (loading) {
    return <p className="text-zinc-600 dark:text-zinc-400">Loading your reservations…</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
        My reservations
      </h1>
      {error && (
        <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}
      {reservations.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          You have no reservations. <Link href="/events" className="underline">Browse events</Link>.
        </p>
      ) : (
        <ul className="space-y-4">
          {reservations.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    {r.event?.title ?? 'Event'}
                  </h2>
                  {r.event && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(r.event.dateTime).toLocaleString()} · {r.event.location}
                    </p>
                  )}
                  <p className="mt-1 text-sm">
                    Status:{' '}
                    <span
                      className={
                        r.status === 'CONFIRMED'
                          ? 'text-green-600 dark:text-green-400'
                          : r.status === 'CANCELLED' || r.status === 'REFUSED'
                            ? 'text-zinc-500 dark:text-zinc-500'
                            : 'text-amber-600 dark:text-amber-400'
                      }
                    >
                      {r.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => handleDownloadTicket(r.id)}
                      className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      Download ticket
                    </button>
                  )}
                  {r.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => handleCancel(r.id)}
                      disabled={cancelling === r.id}
                      className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      {cancelling === r.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
