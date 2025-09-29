'use client';
import AppLogo from '../app/AppLogo';
import DarkModeToggle from '../base/DarkModeToggle';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { Wallet, Circle } from 'lucide-react';
import ProfileMenu from '../utility/ProfileMenu';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { useSideBarStore } from '@/store/home/useSideBar';
import { RiMenu2Fill } from 'react-icons/ri';
import { useState } from 'react';
import { WalletPanel } from '../utility/WalletPanel';
import { useWallet } from '@solana/wallet-adapter-react';

export default function HomeTestNavbar() {
    const router = useRouter();
    const { wallet, publicKey } = useWallet();

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
                createNewQuizHandler={createNewQuizHandler}
                onWalletClick={() => setWalletPanel((prev) => !prev)}
            />
            <SmallHomeNavbar
                isWalletConnected={!!wallet}
                walletAddress={truncateAddress(publicKey?.toString())}
                createNewQuizHandler={createNewQuizHandler}
                onWalletClick={() => setWalletPanel((prev) => !prev)}
            />
            {walletPanel && <WalletPanel close={() => setWalletPanel(false)} />}
        </>
    );
}

interface HomeNavbarProps {
    isWalletConnected: boolean;
    walletAddress: string;
    createNewQuizHandler: () => void;
    onWalletClick: () => void;
}

function BigHomeNavbar({
    isWalletConnected,
    walletAddress,
    createNewQuizHandler,
    onWalletClick,
}: HomeNavbarProps) {
    return (
        <div className="fixed top-0 left-0 right-0 w-full px-6 py-4.5 z-50 hidden xl:flex items-center justify-between">
            <AppLogo />

            <div className="flex items-center gap-x-4">
                <DarkModeToggle />

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
                        'font-light text-[13px] tracking-wide flex items-center justify-center transition-transform hover:-translate-y-0.5 cursor-pointer rounded-lg',
                        'bg-dark-base dark:bg-light-base dark:hover:bg-light-base hover:bg-dark-base',
                    )}
                >
                    Create Quiz
                </Button>

                <ProfileMenu />
            </div>
        </div>
    );
}

function SmallHomeNavbar({
    isWalletConnected,
    walletAddress,
    createNewQuizHandler,
    onWalletClick,
}: HomeNavbarProps) {
    const { appearing, setAppearing } = useSideBarStore();

    return (
        <div className="fixed top-0 left-0 right-0 w-full px-4 py-5 bg-white dark:bg-neutral-900 z-50 xl:hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                    <RiMenu2Fill
                        size={20}
                        className="cursor-pointer"
                        onClick={() => setAppearing(!appearing)}
                    />
                    <AppLogo />
                </div>

                <div className="flex items-center gap-x-3">
                    <DarkModeToggle />

                    <Button
                        variant="outline"
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
                        <span className="hidden md:inline">
                            {isWalletConnected ? walletAddress : 'Connect Wallet'}
                        </span>
                    </Button>

                    <Button
                        onClick={createNewQuizHandler}
                        className={cn(
                            'hidden sm:flex font-light text-[13px] tracking-wide items-center justify-center transition-transform hover:-translate-y-0.5 cursor-pointer rounded-lg',
                            'bg-dark-base dark:bg-light-base dark:hover:bg-light-base hover:bg-dark-base',
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
