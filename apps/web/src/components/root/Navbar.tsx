'use client';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import SigninModal from '../utility/SigninModal';
import LogoutModal from '../utility/LogoutModal';
import { useState } from 'react';
import { Input } from '../ui/input';
import { X } from 'lucide-react';
import { Slackey } from 'next/font/google';

export const slackey = Slackey({
    weight: '400',
    subsets: ['latin'],
});

interface NavItem {
    label: string;
    href: string;
    onClick: () => void;
}

export default function Navbar() {
    const [openJoinRoomBar, setOpenJoinRoomBar] = useState<boolean>(false);
    const { session, setOpenSigninModal, setOpenLogoutModal } = useUserSessionStore();
    const isLoggedIn = !!session?.user?.id;
    function handleAuthClick() {
        if (isLoggedIn) {
            setOpenLogoutModal(true);
        } else {
            setOpenSigninModal(true);
        }
    }

    const navItems: NavItem[] = [
        {
            label: 'Home',
            href: '/',
            onClick: () => {},
        },
        {
            label: 'Features',
            href: '/features',
            onClick: () => {},
        },
        {
            label: 'Pricing',
            href: '/pricing',
            onClick: () => {},
        },
    ];

    function joinRoomHandler() {
        if (!session?.user.id) {
            setOpenSigninModal(true);
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setOpenJoinRoomBar(true);
    }

    return (
        <>
            <nav className="h-20 bg-black border-b border-black w-full fixed top-0 flex justify-between items-center pl-12 z-20">
                <section>
                    <span className={cn('text-white font-bold text-3xl', slackey.className)}>
                        NOCTURN
                    </span>
                </section>
                <section className="h-full flex items-center justify-end">
                    <div className="h-full flex items-center justify-center gap-x-2 pr-4">
                        {navItems.map((item) => (
                            <Button
                                key={item.label}
                                variant="ghost"
                                className="rounded-[2px] px-6 text-xl text-white bg-black hover:bg-black border border-black hover:text-white py-4 hover:border-neutral-100/70"
                                onClick={item.onClick}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                    <Button
                        onClick={handleAuthClick}
                        className="h-full rounded-none bg-[#FF3F7F] hover:bg-white px-6 text-lg border-r border-black"
                    >
                        {isLoggedIn ? 'Logout' : 'Login'}
                    </Button>
                    <Button
                        onClick={joinRoomHandler}
                        className="h-full rounded-none bg-[#22a094] hover:bg-white px-6 text-lg"
                    >
                        JOIN QUIZ
                    </Button>
                </section>
                <SigninModal />
                <LogoutModal />
            </nav>
            {openJoinRoomBar && (
                <div className="bg-[#5c1dfb] flex items-center justify-center h-14 mt-20 gap-x-6 border-b-2 border-black">
                    <div className="flex items-center gap-x-4">
                        <span className="text-xs font-black text-white uppercase tracking-[0.2em]">
                            Enter Quiz Code
                        </span>
                        <Input
                            placeholder="1234-5678"
                            className="w-36 h-10 rounded-none bg-white! text-black text-center font-black text-lg tracking-[0.15em] uppercase border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] placeholder:text-black/70 placeholder:font-medium focus-visible:ring-0 focus-visible:border-black"
                        />
                        <Button className="h-10 rounded-none bg-[#FF3F7F] hover:bg-[#FF3F7F] text-white px-6 text-xs font-black uppercase tracking-[0.15em] border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:scale-98">
                            Join
                        </Button>
                    </div>
                    <Button
                        type="button"
                        title="Close"
                        size={'sm'}
                        onClick={() => setOpenJoinRoomBar(false)}
                        className="rounded-none w-8 h-8 flex items-center justify-center bg-black hover:bg-[#FF3F7F] transition-colors cursor-pointer"
                    >
                        <X className="text-white" size={16} strokeWidth={3} />
                    </Button>
                </div>
            )}
        </>
    );
}
