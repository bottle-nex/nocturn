'use client'

import { cn } from "@/lib/utils";
import NavItems from "./NavItems";
import Image from "next/image";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";
import { PiTelegramLogo } from "react-icons/pi";
import { Input } from "../ui/input";
import { TbAlphabetHebrew } from "react-icons/tb";
import { RiLoginCircleLine } from "react-icons/ri";
import SigninModal from "../utility/SigninModal";
import LogoutModal from "../utility/LogoutModal";


interface NavItem {
    label: string;
    link: string;
    onClick: () => void;
}

export default function Navbar() {

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
            link: '/',
            onClick: () => { },
        },
        {
            label: 'Features',
            link: '/features',
            onClick: () => { },
        },
        {
            label: 'Invoicing',
            link: '/invoicing',
            onClick: () => { },
        },
    ];

    return (
        <div className="w-full h-20 px-3 fixed z-40 flex items-center justify-between ">

            {/* logo */}
            <div className="h-15 w-[60px] rounded-full text-gamma bg-black flex justify-center items-center ">
                <TbAlphabetHebrew size={'25'} />
            </div>

            {/* nav elements */}
            <div className="flex">
                <NavItems
                    items={navItems}
                    className="absolute left-1/2 top-2 -translate-x-1/2 "
                />
            </div>

            {/* profile */}
            <div className="flex h-15 w-fit rounded-4xl p-1 border border-black bg-gamma ">
                <div className="h-full rounded-full flex items-center justify-center ">
                    <div
                        className={cn(
                            "h-13 w-13 relative rounded-full border border-black overflow-hidden flex justify-center items-center text-black ",
                            'cursor-pointer',
                        )}
                        onClick={handleAuthClick}
                    >
                        {session?.user.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name}
                                fill
                                className={cn(
                                    'cursor-pointer',
                                )}
                            />
                        ): (
                            <RiLoginCircleLine
                                size={'20'} 
                                className={cn(
                                    'cursor-pointer',
                                )}
                            />
                        )}
                    </div>

                    <div className="h-full w-40 flex justify-center items-center ">
                        <div className="text-black ">
                            <Input
                                className={cn('border-0 shadow-none ring-0 outline-none',
                                    'focus:border-0 focus:ring-0 focus:outline-none focus:shadow-none',
                                    'focus-visible:border-0 focus-visible:ring-0 focus-visible:outline-none',
                                    'hover:border-0 hover:ring-0',
                                    'active:border-0 active:ring-0',
                                    'bg-transparent',
                                    'select-none selection:bg-transparent selection:text-inherit',
                                    'transition-none',
                                    'text-base',
                                )}
                                placeholder="Quiz code"
                            />

                        </div>
                    </div>

                    <div
                        className={cn(
                            "h-13 w-13 relative rounded-full overflow-hidden ",
                            'flex justify-center items-center',
                            'bg-[#D97757] border border-black ',
                            'cursor-pointer'
                        )}
                    >
                        <PiTelegramLogo
                            size={'20'}
                            className={cn(
                                'text-black ',
                                'cursor-pointer'
                            )}
                        />
                    </div>

                </div>
            </div>

                <SigninModal />
                <LogoutModal />
        </div>
    );
}