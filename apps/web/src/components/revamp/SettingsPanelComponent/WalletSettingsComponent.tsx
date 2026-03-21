'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { IoWalletOutline } from 'react-icons/io5';

export default function WalletSettingsComponent() {
    return (
        <div className="w-full min-h-100 mx-auto py-6 flex justify-center items-center gap-6 rounded-xl mt-1 custom-scrollbar ring-1 ring-black/10 dark:ring-light-base/10 bg-light-base dark:bg-[#0F0F0F]">
            <div className="flex flex-col items-center justify-center w-full max-w-[14rem] mx-auto mb-5">
                <div className="relative h-40 w-40 overflow-hidden">
                    <Image
                        src={'/images/home/wallet/wallet.png'}
                        alt="wallet-logo"
                        className="object-contain"
                        fill
                        unoptimized
                        loading="lazy"
                    />
                </div>

                <div className="text-dark-base/80 dark:text-light-base/80 text-xl -mt-3">
                    Want more fun?
                </div>

                <p className="text-[13px] text-dark-base/60 dark:text-light-base/40 text-center mt-0.5">
                    Add SOL to the prize pool and let the smartest players win.
                </p>

                <Button
                    className={cn(
                        'bg-light-alpha hover:bg-light-alpha text-dark-base',
                        'dark:bg-[#1e1e1e] dark:text-light-base',
                        'inset-shadow-xs dark:inset-shadow-white/10 inset-shadow-black/10 shadow-xs shadow-black/20',
                        'ring-1 dark:ring-white/10 ring-black/5',
                        'transition-all transform duration-200 active:scale-[0.98]',
                        'px-5! mt-6',
                        'flex gap-x-3 items-center h-10 rounded-[6px]',
                    )}
                >
                    <IoWalletOutline className="size-5" />
                    Connect Wallet
                </Button>
            </div>
        </div>
    );
}

// transactions history, wallet balance
