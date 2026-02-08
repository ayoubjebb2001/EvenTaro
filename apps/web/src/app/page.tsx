import Link from 'next/link';
import { CalendarDays, Users, ShieldCheck, Ticket } from 'lucide-react';

const features = [
    {
        icon: CalendarDays,
        title: 'Browse Events',
        description: 'Discover published events with dates, locations, and available places.',
    },
    {
        icon: Ticket,
        title: 'Reserve & Get Tickets',
        description: 'Reserve your spot and download a PDF ticket once confirmed.',
    },
    {
        icon: ShieldCheck,
        title: 'Admin Management',
        description: 'Create events, manage reservations, and view analytics from your dashboard.',
    },
    {
        icon: Users,
        title: 'Role-Based Access',
        description: 'Admins manage everything; users browse events and handle their reservations.',
    },
];

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Navigation */}
            <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-lg dark:border-zinc-700/50 dark:bg-zinc-900/80">
                <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
                        <CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-lg tracking-tight">EvenTaro</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/events"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                            Events
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                            Register
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero */}
            <main className="flex-1">
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(99,102,241,0.12),transparent)] dark:bg-[radial-gradient(45%_40%_at_50%_60%,rgba(99,102,241,0.08),transparent)]" />
                    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
                        <div className="mx-auto max-w-2xl text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                <CalendarDays className="h-4 w-4" />
                                Event Management Platform
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
                                Discover events.{' '}
                                <span className="text-indigo-600 dark:text-indigo-400">Reserve your spot.</span>
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                                Browse published events, reserve your place, and manage your reservations — all in
                                one clean platform. Admins can create events, confirm bookings, and track analytics.
                            </p>
                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href="/events"
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                                >
                                    <CalendarDays className="h-5 w-5" />
                                    Browse Events
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-base font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                >
                                    Create an Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="border-t border-zinc-200/80 bg-zinc-50/50 dark:border-zinc-700/50 dark:bg-zinc-800/30">
                    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                                Everything you need
                            </h2>
                            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                                A complete event management solution with modern tooling.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/50"
                                >
                                    <div className="mb-4 inline-flex rounded-lg bg-indigo-100 p-2.5 dark:bg-indigo-900/30">
                                        <feature.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-zinc-200/80 bg-white dark:border-zinc-700/50 dark:bg-zinc-900">
                <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
                    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                        <CalendarDays className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        EvenTaro
                    </Link>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        &copy; {new Date().getFullYear()} EvenTaro. Built with Next.js &amp; NestJS.
                    </p>
                </div>
            </footer>
        </div>
    );
}
