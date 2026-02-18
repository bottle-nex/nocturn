'use client';
import Spinner from '@/components/ui/Spinner';

export default function TestPage() {

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-purple-50 to-blue-50 dark:from-neutral-950 dark:to-neutral-900 p-8">
            <Spinner />
        </div>
    );
}
