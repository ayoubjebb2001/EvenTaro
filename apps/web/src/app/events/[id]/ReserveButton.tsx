'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button, ErrorAlert, Spinner } from '@/components/ui';

interface ReserveButtonProps {
    eventId: string;
    placesLeft: number;
}

export function ReserveButton({ eventId, placesLeft }: ReserveButtonProps) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    if (authLoading) {
        return <Spinner className="mt-6" text="Checking authentication…" />;
    }

    if (!isAuthenticated) {
        return (
            <div className="mt-6">
                <Link href={`/login?redirect=/events/${eventId}`}>
                    <Button size="lg">
                        <LogIn className="h-4 w-4" />
                        Sign in to reserve
                    </Button>
                </Link>
            </div>
        );
    }

    if (done) {
        return (
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
                Reservation requested! Check your dashboard.
            </div>
        );
    }

    if (placesLeft <= 0) {
        return (
            <div className="mt-6 rounded-lg bg-zinc-100 p-4 text-center text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                This event is full.
            </div>
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
        <div className="mt-6 space-y-3">
            {error && <ErrorAlert message={error} />}
            <Button size="lg" onClick={handleReserve} disabled={busy}>
                {busy ? 'Reserving…' : 'Reserve a place'}
            </Button>
        </div>
    );
}
