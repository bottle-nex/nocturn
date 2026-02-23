'use client';
import Rive from '@rive-app/react-webgl2';

export default function TestPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-purple-50 to-blue-50 dark:from-neutral-950 dark:to-neutral-900 p-8">
            {/* <Spinner /> */}
            <Rive
                src="/rive/app_logo.riv"
                height={50}
                width={50}
                color='#000000'
            />
        </div>
    );
}
