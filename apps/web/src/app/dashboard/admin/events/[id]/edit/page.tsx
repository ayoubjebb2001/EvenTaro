'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toDateTimeLocal } from '@/lib/utils';
import {
    Button, Input, Textarea, Select, ErrorAlert,
    Card, CardContent, PageSpinner,
} from '@/components/ui';

const STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

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
                setDateTime(toDateTimeLocal(ev.dateTime));
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
        if (!confirm('Are you sure you want to delete this event?')) return;
        setError('');
        try {
            await api.events.delete(id);
            router.push('/dashboard/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete');
        }
    }

    if (initialLoading) return <PageSpinner text="Loading event…" />;

    return (
        <div className="space-y-6">
            <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to admin
            </Link>

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Edit Event
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Update event details or change its status.
                </p>
            </div>

            <Card className="max-w-lg">
                <CardContent className="space-y-5 p-6">
                    {error && <ErrorAlert message={error} />}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            id="title"
                            label="Title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <Textarea
                            id="description"
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={3}
                        />
                        <Input
                            id="dateTime"
                            label="Date & time"
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            required
                        />
                        <Input
                            id="location"
                            label="Location"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                        <Input
                            id="maxCapacity"
                            label="Max capacity"
                            type="number"
                            min={1}
                            value={String(maxCapacity)}
                            onChange={(e) => setMaxCapacity(Number(e.target.value))}
                            required
                        />
                        <Select
                            id="status"
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            options={STATUS_OPTIONS}
                        />

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving…' : 'Save changes'}
                            </Button>
                            <Link href="/dashboard/admin">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button variant="danger" type="button" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
