'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type CheckoutStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'FAILED' | 'ABANDONED';

interface VerifySessionData {
    status: CheckoutStatus;
    subscription?: {
        id: string;
        tierName: string;
        tierDisplayName: string;
        status: string;
        currentPeriodEnd: string;
    } | null;
    tier: {
        name: string;
        displayName: string;
    };
}

function PremiumSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const subscriptionId = searchParams.get('subscription_id');

    // Use whichever identifier is provided (Dodo provides subscription_id)
    const identifier = subscriptionId || sessionId;

    const [status, setStatus] = useState<CheckoutStatus>('PENDING');
    const [data, setData] = useState<VerifySessionData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);

    const MAX_ATTEMPTS = 15; // 15 attempts * 2 seconds = 30 seconds
    const POLL_INTERVAL = 2000; // 2 seconds

    useEffect(() => {
        if (!identifier) {
            setError('No session or subscription ID provided');
            return;
        }

        const pollSession = async () => {
            try {
                // Build query string based on what we have
                const queryParam = subscriptionId
                    ? `subscription_id=${subscriptionId}`
                    : `session_id=${sessionId}`;

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/premium/verify-session?${queryParam}`,
                );

                if (!response.ok) {
                    throw new Error('Failed to verify session');
                }

                const result = await response.json();
                const sessionData = result.data as VerifySessionData;

                setData(sessionData);
                setStatus(sessionData.status);

                // Stop polling if we have a final status
                if (['COMPLETED', 'FAILED', 'EXPIRED'].includes(sessionData.status)) {
                    return true; // Stop polling
                }

                return false; // Continue polling
            } catch (err) {
                console.error('Error polling session:', err);
                setError('Unable to verify payment status');
                return true; // Stop polling on error
            }
        };

        // Initial poll
        pollSession().then((shouldStop) => {
            if (shouldStop) return;

            // Set up interval for subsequent polls
            const interval = setInterval(async () => {
                setAttempts((prev) => {
                    const newAttempts = prev + 1;

                    if (newAttempts >= MAX_ATTEMPTS) {
                        clearInterval(interval);
                        setError(
                            'Payment verification timed out. Please check your subscriptions or contact support.',
                        );
                        return newAttempts;
                    }

                    return newAttempts;
                });

                const shouldStop = await pollSession();
                if (shouldStop) {
                    clearInterval(interval);
                }
            }, POLL_INTERVAL);

            return () => clearInterval(interval);
        });
    }, [identifier, subscriptionId, sessionId]);

    // Render different states
    if (!identifier) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-delta">
                <div className="max-w-md rounded-prime bg-charlie p-8 text-center">
                    <h1 className="mb-4 text-2xl font-bold text-alpha">Invalid Session</h1>
                    <p className="mb-6 text-gamma">
                        No session or subscription ID was provided in the URL.
                    </p>
                    <button
                        onClick={() => router.push('/premium')}
                        className="rounded-base bg-alpha px-6 py-3 text-white hover:bg-beta"
                    >
                        Go to Premium Page
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-delta">
                <div className="max-w-md rounded-prime bg-charlie p-8 text-center">
                    <h1 className="mb-4 text-2xl font-bold text-alpha">Error</h1>
                    <p className="mb-6 text-gamma">{error}</p>
                    <button
                        onClick={() => router.push('/premium')}
                        className="rounded-base bg-alpha px-6 py-3 text-white hover:bg-beta"
                    >
                        Back to Premium
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'PENDING') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-delta">
                <div className="max-w-md rounded-prime bg-charlie p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gamma border-t-alpha"></div>
                    </div>
                    <h1 className="mb-4 text-2xl font-bold text-gamma">Processing Payment...</h1>
                    <p className="text-gamma/70">
                        Please wait while we confirm your payment. This usually takes a few seconds.
                    </p>
                    <p className="mt-4 text-sm text-gamma/50">
                        Attempt {attempts} of {MAX_ATTEMPTS}
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'COMPLETED' && data?.subscription) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-delta">
                <div className="max-w-md rounded-prime bg-charlie p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <svg
                            className="h-16 w-16 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h1 className="mb-4 text-2xl font-bold text-green-500">Payment Successful!</h1>
                    <p className="mb-6 text-gamma">
                        Welcome to{' '}
                        <span className="font-bold">{data.subscription.tierDisplayName}</span>! Your
                        subscription is now active.
                    </p>
                    <div className="mb-6 rounded-base bg-delta p-4 text-left">
                        <p className="mb-2 text-sm text-gamma/70">Subscription Details:</p>
                        <p className="text-gamma">
                            <span className="font-semibold">Plan:</span>{' '}
                            {data.subscription.tierDisplayName}
                        </p>
                        <p className="text-gamma">
                            <span className="font-semibold">Status:</span>{' '}
                            {data.subscription.status}
                        </p>
                        <p className="text-gamma">
                            <span className="font-semibold">Next billing:</span>{' '}
                            {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/home')}
                        className="w-full rounded-base bg-alpha px-6 py-3 text-white hover:bg-beta"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'FAILED') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-delta">
                <div className="max-w-md rounded-prime bg-charlie p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <svg
                            className="h-16 w-16 text-alpha"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h1 className="mb-4 text-2xl font-bold text-alpha">Payment Failed</h1>
                    <p className="mb-6 text-gamma">
                        Unfortunately, your payment could not be processed. Please try again or
                        contact your payment provider.
                    </p>
                    <button
                        onClick={() => router.push('/premium')}
                        className="w-full rounded-base bg-alpha px-6 py-3 text-white hover:bg-beta"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'EXPIRED') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-delta">
                <div className="max-w-md rounded-prime bg-charlie p-8 text-center">
                    <h1 className="mb-4 text-2xl font-bold text-alpha">Session Expired</h1>
                    <p className="mb-6 text-gamma">
                        This checkout session has expired. Please create a new checkout session.
                    </p>
                    <button
                        onClick={() => router.push('/premium')}
                        className="w-full rounded-base bg-alpha px-6 py-3 text-white hover:bg-beta"
                    >
                        Back to Premium
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

export default function PremiumSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-delta">
                    <div className="max-w-md rounded-prime bg-charlie p-8 text-center">
                        <div className="mb-6 flex justify-center">
                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gamma border-t-alpha"></div>
                        </div>
                        <h1 className="mb-4 text-2xl font-bold text-gamma">Loading...</h1>
                    </div>
                </div>
            }
        >
            <PremiumSuccessContent />
        </Suspense>
    );
}
