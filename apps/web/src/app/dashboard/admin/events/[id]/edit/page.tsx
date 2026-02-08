'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [status, setStatus] = useState('DRAFT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    api.events
      .getById(id)
      .then((ev) => {
        setTitle(ev.title);
        setDescription(ev.description);
        setDateTime(typeof ev.dateTime === 'string' ? ev.dateTime.slice(0, 16) : new Date(ev.dateTime).toISOString().slice(0, 16));
        setLocation(ev.location);
        setMaxCapacity(ev.maxCapacity);
        setStatus(ev.status);
      })
      .catch(() => setError('Event not found'))
      .finally(() => setInitialLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.events.update(id, {
        title,
        description,
        dateTime: new Date(dateTime).toISOString(),
        location,
        maxCapacity,
        status,
      });
      router.push('/dashboard/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this event?')) return;
    setError('');
    try {
      await api.events.delete(id);
      router.push('/dashboard/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  if (initialLoading) {
    return <p className="text-zinc-600 dark:text-zinc-400">Loading…</p>;
  }

  return (
    <div>
      <Link href="/dashboard/admin" className="mb-6 inline-block text-sm text-zinc-600 dark:text-zinc-400 hover:underline">
        ← Back to admin
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
        Edit event
      </h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </p>
        )}
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="dateTime" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Date & time
          </label>
          <input
            id="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="location" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="maxCapacity" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Max capacity
          </label>
          <input
            id="maxCapacity"
            type="number"
            min={1}
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(Number(e.target.value))}
            required
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
          <Link
            href="/dashboard/admin"
            className="rounded border border-zinc-300 px-4 py-2 font-medium dark:border-zinc-600 dark:text-zinc-300"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded border border-red-600 px-4 py-2 font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
