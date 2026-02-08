'use client';

import { useRouter } from 'next/navigation';

export default function PremiumCancelPage() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen items-center justify-center bg-delta">
            <div className="max-w-md rounded-prime bg-charlie p-8 text-center">
                <h1 className="mb-4 text-2xl font-bold text-gamma">Checkout Cancelled</h1>
                <p className="mb-6 text-gamma">
                    Your checkout was cancelled. No charges were made to your account.
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
