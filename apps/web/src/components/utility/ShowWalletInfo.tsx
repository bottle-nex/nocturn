'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IoWalletOutline } from 'react-icons/io5';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineKey } from 'react-icons/md';
import { PiCurrencyDollar } from 'react-icons/pi';
import { LuCopy } from 'react-icons/lu';
import { gsap } from 'gsap';
import { WalletPanel } from './WalletPanel';

export default function ShowInfoToggle() {
    const [showInfo, setShowInfo] = useState(false);
    const [showBalance, setShowBalance] = useState(false);
    const [showPublicKey, setShowPublicKey] = useState(false);
    const [walletConnected, _setWalletConnected] = useState<boolean>(false);
    // const { connect, wallet, publicKey } = useWallet();
    const [walletPanel, setWalletPanel] = useState<boolean>(false);

    const infoContainerRef = useRef<HTMLDivElement>(null);
    const balanceRef = useRef<HTMLDivElement>(null);
    const publicKeyRef = useRef<HTMLDivElement>(null);

    const dummyBalance = '123.456 SOL';
    const dummyPublicKey =
        'F9kJ9vX2F9kJ9vX2F9kJ9vX2F9kJ9vX2F9kJ9vX2F9kJ9vX2F9kJ9vX2F9kJ9vX2F9kJ9vX2F9kJ9vX2';

    const handleCopy = () => {
        navigator.clipboard.writeText(dummyPublicKey);
    };

    useEffect(() => {
        if (!infoContainerRef.current) return;

        if (showInfo) {
            gsap.fromTo(
                infoContainerRef.current,
                {
                    opacity: 0,
                    y: -10,
                    scale: 0.95,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: 'back.out(1.7)',
                },
            );
        }
    }, [showInfo]);

    useEffect(() => {
        if (!balanceRef.current) return;

        if (showBalance) {
            gsap.fromTo(
                balanceRef.current,
                {
                    opacity: 0,
                    y: -10,
                    scale: 0.95,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'back.out(1.7)',
                },
            );
        }
    }, [showBalance]);

    useEffect(() => {
        if (!publicKeyRef.current) return;

        if (showPublicKey) {
            gsap.fromTo(
                publicKeyRef.current,
                {
                    opacity: 0,
                    y: -10,
                    scale: 0.95,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'back.out(1.7)',
                },
            );
        }
    }, [showPublicKey]);

    return (
        <div className="w-full mt-4">
            <Button
                onClick={() => {
                    setWalletPanel((prev) => !prev);
                    if (walletConnected) setShowInfo(!showInfo);
                }}
                className="flex items-center justify-center h-10 rounded-lg hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 ease-in-out bg-light-base hover:bg-light-base dark:bg-dark-base/30 dark:text-neutral-300 text-neutral-700 border border-neutral-600 dark:border-neutral-500 w-full"
            >
                <IoWalletOutline className="mr-1" />
                {walletConnected
                    ? showInfo
                        ? 'Hide Wallet Info'
                        : 'Show Wallet Info'
                    : 'Connect Wallet'}
            </Button>

            {walletConnected && showInfo && (
                <div ref={infoContainerRef} className="mt-4">
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
                                <div
                                    ref={balanceRef}
                                    className="text-sm text-neutral-500 dark:text-neutral-300 mt-1"
                                >
                                    {dummyBalance}
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
                            {showPublicKey && (
                                <div ref={publicKeyRef} className="mt-1 flex items-center gap-x-2">
                                    <div className="text-sm text-neutral-500 dark:text-neutral-300 truncate max-w-[calc(100%-32px)]">
                                        {dummyPublicKey}
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
            {walletPanel && <WalletPanel close={() => setWalletPanel(false)} />}
        </div>
    );
}
