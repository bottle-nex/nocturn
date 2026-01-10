import HomeSidebar from '@/components/test/HomeSidebar';
import SessionSetter from '@/components/utility/SessionSetter';
import { authOption } from 'app/api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
    const session = await getServerSession(authOption);
    return (
        <div className="tracking-wider bg-delta h-screen w-screen overflow-hidden">
            <div className="flex gap-x-4 px-4 pb-4 py-2 h-full">
                <HomeSidebar />
                <main className="flex-1 h-full overflow-hidden">{children}</main>
            </div>
            <SessionSetter session={session} />
        </div>
    );
}
