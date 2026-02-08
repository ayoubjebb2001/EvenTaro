'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Input, Textarea, ErrorAlert, Card, CardContent } from '@/components/ui';

export default function NewEventPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxCapacity, setMaxCapacity] = useState(10);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.events.create({
                title,
                description,
                dateTime: new Date(dateTime).toISOString(),
                location,
                maxCapacity,
            });
            router.push('/dashboard/admin');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setLoading(false);
        }
    }

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
                    Create New Event
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Fill in the details to create a new event.
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
                            placeholder="Event title"
                        />
                        <Textarea
                            id="description"
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows={3}
                            placeholder="Describe the event…"
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
                            placeholder="e.g. Paris, France"
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

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating…' : 'Create event'}
                            </Button>
                            <Link href="/dashboard/admin">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
