'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IoWalletOutline } from 'react-icons/io5';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineKey } from 'react-icons/md';
import { PiCurrencyDollar } from 'react-icons/pi';
import { LuCopy } from 'react-icons/lu';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { useEffect } from 'react';
import { WalletPanel } from './WalletPanel';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { USDC_MINT } from '@/lib/solana/program';

export default function ShowInfoToggle() {
    const [showInfo, setShowInfo] = useState(false);
    const [showBalance, setShowBalance] = useState(false);
    const [showPublicKey, setShowPublicKey] = useState(false);
    const [openWalletPanel, setOpenWalletPanel] = useState<boolean>(false);
    const [balance, setBalance] = useState<number | null>(null);

    const { publicKey, connected } = useWallet();
    const { connection } = useConnection();

    useEffect(() => {
        if (!publicKey || !connected) {
            setBalance(null);
            return;
        }

        // Fetch USDC balance for staking display
        try {
            const ata = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
            connection.getTokenAccountBalance(ata).then((res) => {
                setBalance(Number(res.value.uiAmount ?? 0));
            }).catch(() => {
                setBalance(0);
            });
        } catch {
            setBalance(0);
        }
    }, [publicKey, connected, connection]);

    const handleCopy = () => {
        if (publicKey) {
            navigator.clipboard.writeText(publicKey.toBase58());
        }
    };

    return (
        <div className="w-full mt-4">
            <Button
                onClick={() => {
                    if (connected) {
                        setShowInfo(!showInfo);
                    } else {
                        setOpenWalletPanel((prev) => !prev);
                    }
                }}
                className="flex items-center justify-center h-10 rounded-lg hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 ease-in-out bg-light-base hover:bg-light-base dark:bg-dark-base/30 dark:text-neutral-300 text-neutral-700 border border-neutral-600 dark:border-neutral-500 w-full"
            >
                <IoWalletOutline className="mr-1" />
                {connected
                    ? showInfo
                        ? 'Hide Wallet Info'
                        : 'Show Wallet Info'
                    : 'Connect Wallet'}
            </Button>

            {connected && showInfo && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="flex flex-col gap-y-6 mt-4">
                        <div className="flex flex-col gap-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-dark-alpha dark:text-light-base flex items-center gap-x-2">
                                    <PiCurrencyDollar size={18} />
                                    Balance
                                </span>
                                <Button
                                    variant={'ghost'}
                                    onClick={() => setShowBalance(!showBalance)}
                                    className="text-neutral-600 dark:text-neutral-300 hover:scale-110 transition-transform duration-150"
                                >
                                    {showBalance ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </Button>
                            </div>
                            {showBalance && (
                                <div className="text-sm text-neutral-500 dark:text-neutral-300 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {balance !== null ? `${balance} USDC` : 'Loading...'}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-dark-alpha dark:text-light-base flex items-center gap-x-2">
                                    <MdOutlineKey size={18} />
                                    Public Key
                                </span>
                                <Button
                                    variant={'ghost'}
                                    onClick={() => setShowPublicKey(!showPublicKey)}
                                    className="text-neutral-600 dark:text-neutral-300 hover:scale-110 transition-transform duration-150"
                                >
                                    {showPublicKey ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </Button>
                            </div>
                            {showPublicKey && publicKey && (
                                <div className="mt-1 flex items-center gap-x-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="text-sm text-neutral-500 dark:text-neutral-300 truncate max-w-[calc(100%-32px)]">
                                        {publicKey.toBase58()}
                                    </div>
                                    <Button
                                        variant={'ghost'}
                                        type="button"
                                        onClick={handleCopy}
                                        className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition hover:scale-110 duration-150"
                                    >
                                        <LuCopy size={16} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {openWalletPanel && <WalletPanel close={() => setOpenWalletPanel(false)} />}
        </div>
    );
}
