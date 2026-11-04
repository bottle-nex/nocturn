'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import type { CustomResponse, SessionReport } from '@nocturn/types';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { SESSION_REPORT_URL } from 'routes/api_routes';

const percent = (value: number) => `${value.toFixed(1)}%`;
const seconds = (value: number | null) =>
    value === null ? 'Unavailable' : `${(value / 1000).toFixed(1)}s`;

export default function SessionReportPage() {
    const { quizId } = useParams<{ quizId: string }>();
    const token = useUserSessionStore((s) => s.session?.user.token);
    const [report, setReport] = useState<SessionReport | null>(null);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'rank' | 'score' | 'accuracy'>('rank');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');

    useEffect(() => {
        if (!token) return;
        const controller = new AbortController();
        setReport(null);
        setError('');
        axios
            .get<CustomResponse<SessionReport>>(
                `${SESSION_REPORT_URL}/${encodeURIComponent(quizId)}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                    signal: controller.signal,
                },
            )
            .then(({ data }) => {
                if (!data.success || !data.data) throw new Error('Report unavailable');
                setReport(data.data);
            })
            .catch((err) => {
                if (!axios.isCancel(err))
                    setError(
                        'This report is unavailable. Only the host and current collaborators can open a completed session. If the quiz just ended, try again in a moment.',
                    );
            });
        return () => controller.abort();
    }, [token, quizId, retry]);

    async function download(format: 'players' | 'questions') {
        setExporting(true);
        setExportError('');
        try {
            const response = await axios.get(
                `${SESSION_REPORT_URL}/${encodeURIComponent(quizId)}`,
                {
                    params: { format },
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                    responseType: 'blob',
                },
            );
            const url = URL.createObjectURL(response.data);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `session-${format}.csv`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch {
            setExportError('Unable to download. Check that the host has Premium, then try again.');
        } finally {
            setExporting(false);
        }
    }

    const selected = report?.players.find((p) => p.id === selectedId);
    const players =
        report?.players
            .filter((p) => p.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
            .sort((a, b) =>
                sort === 'rank' ? a.rank - b.rank : b[sort] - a[sort] || a.rank - b.rank,
            ) ?? [];

    return (
        <main className="mx-auto h-full max-w-6xl overflow-y-auto space-y-8 p-6 md:p-10">
            <Link className="underline" href="/home/sessions">
                All past sessions
            </Link>
            {error && (
                <p role="alert">
                    {error}{' '}
                    <button className="underline" onClick={() => setRetry((n) => n + 1)}>
                        Retry
                    </button>
                </p>
            )}
            {!report && !error && <p role="status">Loading report…</p>}
            {report && (
                <>
                    <header className="space-y-3">
                        <h1 className="text-3xl font-semibold">{report.title}</h1>
                        <p>{new Date(report.date).toLocaleString()} · Session report</p>
                        <button className="underline" onClick={() => setRetry((n) => n + 1)}>
                            Refresh results
                        </button>
                        <p className="text-sm">
                            Results may take a few seconds to settle after the quiz ends. Kicked
                            players are excluded.
                        </p>
                    </header>
                    <section aria-label="Session summary" className="space-y-4">
                        <h2 className="text-2xl font-semibold">Summary</h2>
                        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {[
                                ['Joined', report.summary.joined],
                                ['Answered at least once', report.summary.answered],
                                ['Stayed to the end*', report.summary.finished],
                                ['Average score', report.summary.averageScore.toFixed(1)],
                                ['Overall correct answers', percent(report.summary.accuracy)],
                                [
                                    'Duration',
                                    report.summary.durationMs === null
                                        ? 'Unavailable'
                                        : `${(report.summary.durationMs / 60000).toFixed(1)} min${report.summary.durationEstimated ? ' (estimated)' : ''}`,
                                ],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl border p-4">
                                    <dt>{label}</dt>
                                    <dd className="mt-2 text-2xl font-semibold">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="text-sm">
                            *Players who answered the last asked question. Historical connection and
                            departure times were not saved. Overall accuracy is correct answers
                            divided by all submitted answers.
                        </p>
                        {report.summary.prizePool > 0 && (
                            <div className="rounded-xl border p-4">
                                <h3 className="font-semibold">
                                    Prize pool: {report.summary.prizePool} {report.summary.currency}
                                </h3>
                                {report.summary.prizes.length === 0 && (
                                    <p>Prize allocations are not available yet.</p>
                                )}
                                <ul>
                                    {report.summary.prizes.map((p, i) => (
                                        <li key={i}>
                                            #{p.rank} {p.name}: {p.amount} {report.summary.currency}{' '}
                                            ({p.status.toLowerCase()})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    {!report.fullAccess && (
                        <aside className="rounded-xl border p-5">
                            <p>
                                Your summary and top 3 players are included. Premium hosts unlock
                                all players, question insights, answer details, and CSV downloads
                                for their sessions.
                            </p>
                            <Link href="/premium" className="underline">
                                Explore Premium
                            </Link>
                        </aside>
                    )}

                    <section aria-label="Players" className="space-y-4">
                        <h2 className="text-2xl font-semibold">
                            {report.fullAccess ? 'Players' : 'Top 3 players'}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4">
                            <label>
                                Search by name{' '}
                                <input
                                    className="rounded border bg-transparent p-2"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </label>
                            <label>
                                Sort by{' '}
                                <select
                                    className="rounded border bg-transparent p-2"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value as typeof sort)}
                                >
                                    <option value="rank">Rank</option>
                                    <option value="score">Score</option>
                                    <option value="accuracy">Accuracy</option>
                                </select>
                            </label>
                            {report.fullAccess && (
                                <button
                                    className="rounded border px-4 py-2 disabled:opacity-40"
                                    disabled={exporting}
                                    onClick={() => download('players')}
                                >
                                    Download players CSV
                                </button>
                            )}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        {[
                                            'Rank',
                                            'Player',
                                            'Score',
                                            'Correct',
                                            'Accuracy',
                                            'Longest streak',
                                            'Lifeline',
                                            'Eliminated',
                                        ].map((h) => (
                                            <th key={h} scope="col" className="border-b p-3">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.map((p) => (
                                        <tr key={p.id}>
                                            <td className="border-b p-3">{p.rank}</td>
                                            <td className="border-b p-3">
                                                {report.fullAccess ? (
                                                    <button
                                                        className="underline"
                                                        onClick={() =>
                                                            setSelectedId(
                                                                selectedId === p.id ? null : p.id,
                                                            )
                                                        }
                                                        aria-expanded={selectedId === p.id}
                                                    >
                                                        {p.name}
                                                    </button>
                                                ) : (
                                                    p.name
                                                )}
                                            </td>
                                            <td className="border-b p-3">{p.score}</td>
                                            <td className="border-b p-3">
                                                {p.correct} / {p.answered}
                                            </td>
                                            <td className="border-b p-3">{percent(p.accuracy)}</td>
                                            <td className="border-b p-3">{p.longestStreak}</td>
                                            <td className="border-b p-3">
                                                {p.usedLifeline ? 'Used' : 'No'}
                                            </td>
                                            <td className="border-b p-3">
                                                {p.eliminated
                                                    ? `Yes${p.eliminatedOn === null ? ' (question unavailable)' : ` · Q${p.eliminatedOn}`}`
                                                    : 'No'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {players.length === 0 && <p>No players match.</p>}
                        <p className="text-sm">
                            Player accuracy is correct answers divided by their submitted answers.
                        </p>
                        {selected && report.fullAccess && (
                            <article className="space-y-3 rounded-xl border p-5">
                                <h3 className="text-xl font-semibold">{selected.name}: answers</h3>
                                <button className="underline" onClick={() => setSelectedId(null)}>
                                    Close player details
                                </button>
                                <ol className="space-y-3">
                                    {report.questions.map((q) => {
                                        const answer = selected.answers.find(
                                            (a) => a.questionId === q.id,
                                        );
                                        return (
                                            <li key={q.id}>
                                                <strong>
                                                    Q{q.number}. {q.question}
                                                </strong>
                                                <p>
                                                    {answer
                                                        ? `${q.options[answer.selectedAnswer]?.label ?? 'Unknown option'} · ${answer.correct ? 'Correct' : 'Incorrect'} · ${seconds(answer.timeMs)} · ${answer.points} points`
                                                        : 'No answer submitted'}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </article>
                        )}
                    </section>

                    {report.fullAccess && (
                        <section aria-label="Question results" className="space-y-5">
                            <div className="flex flex-wrap items-center gap-4">
                                <h2 className="text-2xl font-semibold">Questions</h2>
                                <button
                                    className="rounded border px-4 py-2 disabled:opacity-40"
                                    disabled={exporting}
                                    onClick={() => download('questions')}
                                >
                                    Download questions CSV
                                </button>
                            </div>
                            <p>
                                Correct percentages use all joined players. Bars show how many
                                players chose each option.
                            </p>
                            {report.questions.length === 0 && (
                                <p>No questions were asked in this session.</p>
                            )}
                            {report.questions.map((q) => (
                                <article key={q.id} className="space-y-4 rounded-xl border p-5">
                                    <h3 className="text-xl font-semibold">
                                        Q{q.number}. {q.question}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {q.answered === 0 && (
                                            <strong className="rounded bg-amber-100 px-3 py-1 text-amber-900">
                                                Nobody answered
                                            </strong>
                                        )}
                                        {q.hardest && (
                                            <strong className="rounded border px-3 py-1">
                                                Hardest
                                            </strong>
                                        )}
                                        {q.easiest && (
                                            <strong className="rounded border px-3 py-1">
                                                Easiest
                                            </strong>
                                        )}
                                    </div>
                                    <p>
                                        {percent(q.accuracy)} of players correct · {q.answered}{' '}
                                        answered · Average answer time: {seconds(q.averageAnswerMs)}
                                    </p>
                                    <ul className="space-y-3">
                                        {q.options.map((o, i) => (
                                            <li key={i}>
                                                <div className="mb-1 flex justify-between gap-3">
                                                    <span>
                                                        {o.label}
                                                        {i === q.correctAnswer ? ' ✓ Correct' : ''}
                                                    </span>
                                                    <span>{o.count}</span>
                                                </div>
                                                <div
                                                    role="img"
                                                    aria-label={`${o.label}: ${o.count} players`}
                                                    className="h-4 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800"
                                                >
                                                    <div
                                                        className="h-full bg-alpha"
                                                        style={{
                                                            width: `${q.answered ? (o.count / q.answered) * 100 : 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </section>
                    )}
                    {exportError && <p role="alert">{exportError}</p>}
                </>
            )}
        </main>
    );
}
