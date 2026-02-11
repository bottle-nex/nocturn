import SessionSetter from '@/components/utility/SessionSetter';
import LenisProvider from '@/providers/LenisProvider';
import { authOption } from 'app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
    const session = await getServerSession(authOption);
    return (
        <LenisProvider>
            <div className="tracking-wider dark:bg-neutral-950 h-screen w-screen overflow-hidden">
                <main className="flex-1 h-full overflow-hidden">{children}</main>
                <SessionSetter session={session} />
            </div>
        </LenisProvider>
    );
}
