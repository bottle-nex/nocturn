'use client';
import AppLogo from '../app/AppLogo';
import NavItems from './NavItems';
import DarkModeToggle from '../base/DarkModeToggle';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Wallet, BarChart3, Circle } from 'lucide-react';
import ProfileMenu from '../utility/ProfileMenu';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { useSideBarStore } from '@/store/home/useSideBar';
import { RiMenu2Fill } from 'react-icons/ri';
import { useState } from 'react';
import { WalletPanel } from '../utility/WalletPanel';
import { useWallet } from '@solana/wallet-adapter-react';

interface NavItems {
    name: string;
    link: string;
    icon: React.ReactNode;
}

export default function HomeNavbar() {
    const router = useRouter();
    const { wallet, publicKey } = useWallet();

    const navItems: NavItems[] = [
        {
            name: 'My Quizzes',
            link: '/dashboard/quizzes',
            icon: <BarChart3 className="w-4 h-4" />,
        },
        {
            name: 'Analytics',
            link: '/dashboard/analytics',
            icon: <BarChart3 className="w-4 h-4" />,
        },
    ];

    function truncateAddress(address: string | undefined) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    function createNewQuizHandler() {
        const newQuizUuid = uuid();
        router.push(`new/${newQuizUuid}`);
    }

    const [walletPanel, setWalletPanel] = useState<boolean>(false);

    return (
        <>
            <BigHomeNavbar
                isWalletConnected={!!wallet}
                walletAddress={truncateAddress(publicKey?.toString())}
                navItems={navItems}
                createNewQuizHandler={createNewQuizHandler}
                onWalletClick={() => setWalletPanel((prev) => !prev)}
            />
            <SmallHomeNavbar
                isWalletConnected={!!wallet}
                walletAddress={truncateAddress(publicKey?.toString())}
                navItems={navItems}
                createNewQuizHandler={createNewQuizHandler}
                onWalletClick={() => setWalletPanel((prev) => !prev)}
            />
            {walletPanel && <WalletPanel close={() => setWalletPanel(false)} />}
        </>
    );
}

interface HomeNavbar {
    isWalletConnected: boolean;
    walletAddress: string;
    navItems: NavItems[];
    createNewQuizHandler: () => void;
    onWalletClick: () => void;
}

function BigHomeNavbar({
    isWalletConnected,
    walletAddress,
    navItems,
    createNewQuizHandler,
    onWalletClick,
}: HomeNavbar) {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 py-4 rounded-2xl shadow-lg border bg-gradient-to-b dark:from-[#1c1c1c] dark:via-neutral-900 dark:to-[#1c1c1c] from-neutral-200 via-neutral-100 to-neutral-200 hidden xl:flex">
            <div className="px-4 flex items-center justify-between w-full">
                <AppLogo />

                <div className="flex items-center gap-x-4">
                    <DarkModeToggle />
                    <NavItems items={navItems} />
                </div>

                <div className="flex items-center justify-center gap-x-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            'font-light text-[13px] tracking-wide flex items-center gap-x-2 transition-transform hover:-translate-y-0.5 !cursor-pointer',
                            isWalletConnected
                                ? 'text-green-600 border-green-600/30 dark:border-green-600/30 bg-green-50 dark:bg-green-950/10 hover:!text-green-600 hover:!border-green-600/30 hover:!bg-green-50 dark:hover:!bg-green-950/10'
                                : 'text-primary border-primary hover:!text-primary ',
                        )}
                        onClick={onWalletClick}
                    >
                        <Wallet className="w-4 h-4" />
                        {isWalletConnected ? walletAddress : 'Connect Wallet'}
                        {isWalletConnected && (
                            <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                        )}
                    </Button>

                    <Button
                        onClick={createNewQuizHandler}
                        className={cn(
                            'font-light text-[13px] tracking-wide flex items-center justify-center transition-transform hover:-translate-y-0.5 cursor-pointer z-[10] rounded-lg',
                            'bg-dark-base dark:bg-light-base dark:hover:bg-light-base hover:bg-dark-base cursor-pointer',
                        )}
                    >
                        Create Quiz
                    </Button>

                    <ProfileMenu />
                </div>
            </div>
        </div>
    );
}

function SmallHomeNavbar({
    isWalletConnected,
    walletAddress,
    navItems,
    createNewQuizHandler,
    onWalletClick,
}: HomeNavbar) {
    const { appearing, setAppearing } = useSideBarStore();

    return (
        <div className="w-full fixed px-4 py-4 xl:hidden shadow-lg border-b bg-light-base dark:bg-dark-base ">
            <div className="px-4 flex items-center justify-between w-full">
                <div className="flex justify-center items-center gap-x-4">
                    <RiMenu2Fill
                        size={20}
                        className={`lg:hidden cursor-pointer`}
                        onClick={() => setAppearing(!appearing)}
                    />
                    <AppLogo />
                </div>

                <div className="hidden lg:flex items-center gap-x-4">
                    <DarkModeToggle />
                    <NavItems items={navItems} />
                </div>

                <div className="flex items-center justify-center gap-x-3 ">
                    <div className="lg:hidden ">
                        <DarkModeToggle />
                    </div>
                    <Button
                        variant={'outline'}
                        size="sm"
                        className={cn(
                            'flex items-center gap-x-2 font-light text-[13px] tracking-wide transition-transform hover:-translate-y-0.5 !cursor-pointer',
                            isWalletConnected
                                ? 'text-green-600 border-green-600/30 dark:border-green-600/30 bg-green-50 dark:bg-green-950/10 hover:!text-green-600 hover:!border-green-600/30 hover:!bg-green-50 dark:hover:!bg-green-950/10'
                                : 'text-primary border-primary hover:!text-primary ',
                        )}
                        onClick={onWalletClick}
                    >
                        <Wallet className="w-4 h-4" />
                        <div className="hidden md:flex items-center gap-x-2">
                            {isWalletConnected ? walletAddress : 'Connect Wallet'}
                        </div>
                    </Button>

                    <Button
                        onClick={createNewQuizHandler}
                        className={cn(
                            'hidden sm:flex font-light text-[13px] tracking-wide items-center justify-center transition-transform hover:-translate-y-0.5 cursor-pointer z-[10] rounded-lg',
                            'bg-dark-base dark:bg-light-base dark:hover:bg-light-base hover:bg-dark-base',
                        )}
                    >
                        Create Quiz
                    </Button>
                    <ProfileMenu />
                    <div></div>
                </div>
            </div>
        </div>
    );
}
