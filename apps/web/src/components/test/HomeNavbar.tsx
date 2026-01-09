"use client";
import ProfileMenu from "../utility/ProfileMenu";
import { cn } from "@/lib/utils";
import { Slackey } from "next/font/google";
import { Button } from "../ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { Circle } from "lucide-react";
import { WalletPanel } from "../utility/WalletPanel";
import { FaWallet } from "react-icons/fa";
import DarkModeToggle from "../base/DarkModeToggle";
import { useRouter } from "next/navigation";
import { v4 as uuid } from 'uuid'

export const slackey = Slackey({
    weight: '400',
    subsets: ['latin'],
});

export default function HomeNavbar() {
    const [walletPanel, setWalletPanel] = useState<boolean>(false);
    const { wallet } = useWallet();
    const router = useRouter();

    function createNewQuizHandler() {
        const newQuizUuid = uuid();
        router.push(`new/${newQuizUuid}`);
    }
    return (
        <nav className="h-20 dark:bg-dark-alpha bg-light-alpha text-dark-alpha dark:text-light-alpha w-full fixed top-0 flex justify-between items-center px-12 z-20 border-b">
            <section>
                <span className={cn('font-bold text-3xl', slackey.className)}>
                    NOCTURN
                </span>
            </section>
            <section className="flex items-center gap-x-4">
                <DarkModeToggle />
                <Button
                    onClick={createNewQuizHandler}
                    className={cn(
                        'font-light text-[13px] tracking-wide flex items-center justify-center cursor-pointer z-10 rounded-none active:scale-98',
                        'bg-dark-base dark:bg-light-base dark:hover:bg-light-base hover:bg-dark-base cursor-pointer',
                    )}
                >
                    Create Quiz
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        'font-bold text-[13px] tracking-wide flex items-center gap-x-2 rounded-full',
                        'transition-all duration-100',
                        'bg-alpha hover:bg-alpha dark:bg-alpha dark:hover:bg-alpha text-light-alpha',
                    )}
                    onClick={() => setWalletPanel(!walletPanel)}
                >
                    <FaWallet className="w-4 h-4" />
                    {wallet && (
                        <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                    )}
                </Button>
                <ProfileMenu />
            </section>
            {walletPanel && <WalletPanel close={() => setWalletPanel(false)} />}
        </nav>
    )
}