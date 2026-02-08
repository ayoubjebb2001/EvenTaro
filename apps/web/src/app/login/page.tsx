'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, ErrorAlert, Card, CardContent } from '@/components/ui';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, router]);

    if (isAuthenticated) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
            <Card className="w-full max-w-sm">
                <CardContent className="space-y-6 py-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <CalendarDays className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </Link>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Welcome back</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <ErrorAlert message={error} />}

                        <div className="relative">
                            <Mail className="absolute left-3 top-[38px] h-4 w-4 text-zinc-400" />
                            <Input
                                id="email"
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="pl-9"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-[38px] h-4 w-4 text-zinc-400" />
                            <Input
                                id="password"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                placeholder="••••••••"
                                className="pl-9"
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                            Register
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
