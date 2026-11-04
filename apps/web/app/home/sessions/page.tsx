'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import type { CustomResponse, SessionHistoryEntry } from '@nocturn/types';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { SESSION_HISTORY_URL } from 'routes/api_routes';

export default function SessionHistoryPage() {
    const token = useUserSessionStore((s) => s.session?.user.token);
    const [sessions, setSessions] = useState<SessionHistoryEntry[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        if (!token) return;
        const controller = new AbortController();
        setLoading(true);
        setError('');
        axios
            .get<CustomResponse<{ sessions: SessionHistoryEntry[]; hasMore: boolean }>>(
                SESSION_HISTORY_URL,
                {
                    params: { page },
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                    signal: controller.signal,
                },
            )
            .then(({ data }) => {
                if (!data.success || !data.data) throw new Error('Unable to load sessions');
                setSessions(data.data.sessions);
                setHasMore(data.data.hasMore);
            })
            .catch((err) => {
                if (!axios.isCancel(err)) setError('Unable to load sessions. Please try again.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [token, page, retry]);

    return (
        <main className="mx-auto h-full max-w-5xl overflow-y-auto space-y-6 p-6 md:p-10">
            <Link href="/home" className="underline">
                Back to home
            </Link>
            <h1 className="text-3xl font-semibold">Past sessions</h1>
            <p>Reports for quizzes you hosted or collaborate on, newest first.</p>
            {loading && <p role="status">Loading sessions…</p>}
            {error && (
                <p role="alert">
                    {error}{' '}
                    <button className="underline" onClick={() => setRetry((n) => n + 1)}>
                        Retry
                    </button>
                </p>
            )}
            {!loading && !error && sessions.length === 0 && (
                <p>No completed sessions yet. Your report will appear here after a quiz ends.</p>
            )}
            {!loading &&
                !error &&
                sessions.map((s) => (
                    <Link
                        key={s.sessionId}
                        href={`/home/sessions/${s.quizId}`}
                        className="block space-y-2 rounded-xl border p-5 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    >
                        <h2 className="text-xl font-semibold">{s.title}</h2>
                        <p>
                            {new Date(s.date).toLocaleString()} · {s.joined} players joined ·
                            Winner: {s.winner ?? 'No players'}
                        </p>
                        <span className="underline">Open report</span>
                    </Link>
                ))}
            <nav aria-label="Session history pages" className="flex gap-4">
                <button
                    className="rounded border px-4 py-2 disabled:opacity-40"
                    disabled={page === 0 || loading}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Previous
                </button>
                <button
                    className="rounded border px-4 py-2 disabled:opacity-40"
                    disabled={!hasMore || loading}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </button>
            </nav>
        </main>
    );
}
