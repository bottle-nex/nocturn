import HomeNavbar from "@/components/test/HomeNavbar";
import HomeSidebar from "@/components/test/HomeSidebar";
import SessionSetter from "@/components/utility/SessionSetter";
import { authOption } from "app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import React from "react";

interface LayoutProps {
    children: React.ReactNode
}

export default async function Layout({
    children,
}: LayoutProps
) {
    const session = await getServerSession(authOption);
    return (
        <div className="tracking-wider">
            <HomeNavbar />
            <HomeSidebar />
            <main className="ml-64 pt-20">
                {children}
            </main>
            <SessionSetter session={session} />
        </div>
    )
}