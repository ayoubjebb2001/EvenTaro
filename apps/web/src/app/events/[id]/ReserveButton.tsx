'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export function ReserveButton({ eventId, placesLeft }: { eventId: string; placesLeft: number }) {
  const { isAuthenticated, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (loading) {
    return (
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
        Loading…
      </p>
    );
  }

  if (!isAuthenticated) {
    return (
      <p className="mt-6">
        <Link
          href={`/login?redirect=/events/${eventId}`}
          className="rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Sign in to reserve
        </Link>
      </p>
    );
  }

  if (done) {
    return (
      <p className="mt-6 text-green-600 dark:text-green-400">
        Reservation requested. Check your dashboard.
      </p>
    );
  }

  if (placesLeft <= 0) {
    return (
      <p className="mt-6 text-zinc-500 dark:text-zinc-500">
        This event is full.
      </p>
    );
  }

  async function handleReserve() {
    setError('');
    setBusy(true);
    try {
      await api.reservations.create(eventId);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      {error && (
        <p className="mb-2 rounded bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleReserve}
        disabled={busy}
        className="rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {busy ? 'Reserving…' : 'Reserve a place'}
      </button>
    </div>
  );
}
