'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import AppLogo from '../app/AppLogo';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { USDC_MINT } from '@/lib/solana/program';

export function ConnectedWalletInfoCard() {
    const { publicKey, wallet, connected, disconnect } = useWallet();
    const { connection } = useConnection();

    const [balance, setBalance] = useState<number | null>(null);
    const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

    const showAccountInfo = !!(publicKey && connected && balance !== null);

    // Fetch SOL balance
    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then((lamports) => {
                setBalance(lamports / 1e9); // lamports → SOL
            });

            // Fetch USDC balance
            try {
                const ata = getAssociatedTokenAddressSync(USDC_MINT, publicKey);
                connection.getTokenAccountBalance(ata).then((res) => {
                    setUsdcBalance(Number(res.value.uiAmount ?? 0));
                }).catch(() => {
                    setUsdcBalance(0);
                });
            } catch {
                setUsdcBalance(0);
            }
        }
    }, [publicKey, connection]);

    return (
        <div className="h-full flex flex-col items-center justify-center gap-y-2">
            {wallet && publicKey ? (
                <>
                    <div className="w-full flex flex-col justify-center items-center">
                        <div>
                            {wallet && (
                                <Image
                                    src={wallet.adapter.icon}
                                    alt={wallet.adapter.name}
                                    width={36}
                                    height={36}
                                />
                            )}
                        </div>
                        <div className="text-sm tracking-wider">{wallet?.adapter.name}</div>
                    </div>
                    <div className="w-full rounded-2xl bg-[#1c1c1c] border border-[#3d3932] overflow-hidden transition-all duration-300">
                        <div className="p-5 flex justify-center items-center relative">
                            {showAccountInfo ? (
                                <AccountInfo
                                    address={publicKey!.toBase58()}
                                    balance={balance || 0}
                                    usdcBalance={usdcBalance ?? 0}
                                    walletName={wallet?.adapter.name || ''}
                                    walletIcon={wallet?.adapter.icon}
                                    disconnect={disconnect}
                                    networkName={getNetworkName(connection.rpcEndpoint)}
                                />
                            ) : (
                                <Connecting />
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="w-full flex flex-col justify-center items-center gap-y-2 ">
                    <AppLogo />
                    <span className="text-sm">Power the chain, unlock the experience.</span>
                </div>
            )}
        </div>
    );
}

function getNetworkName(endpoint: string): string {
    if (endpoint.includes('devnet')) return 'Devnet';
    if (endpoint.includes('testnet')) return 'Testnet';
    if (endpoint.includes('mainnet') || endpoint.includes('mainnet-beta')) return 'Mainnet';
    return 'Custom RPC';
}

interface AccountInfoProps {
    address: string;
    balance: number;
    usdcBalance: number;
    walletName: string;
    walletIcon?: string;
    disconnect: () => void;
    networkName: string;
}

const AccountInfo = ({
    address,
    balance,
    usdcBalance,
    walletName,
    walletIcon,
    disconnect,
    networkName,
}: AccountInfoProps) => {
    const { session } = useUserSessionStore();

    return (
        <div className="w-full flex flex-col justify-center items-center gap-y-3 animate-in fade-in duration-300">
            <div className="flex justify-center items-center gap-x-3 overflow-hidden">
                {walletIcon && (
                    <Image
                        src={session?.user.image}
                        alt={walletName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border border-[#3d3932]"
                    />
                )}
                <div
                    className="max-w-xs px-3 py-1 rounded-md bg-[#2c2c2c] border border-[#3d3932] text-[#D8CFBC] text-sm font-mono truncate"
                    title={address}
                >
                    {address}
                </div>
            </div>

            <div className="w-full flex justify-start items-center gap-x-3">
                <div className="flex items-center justify-center px-3 py-1 rounded-md bg-[#2c2c2c] border border-[#3d3932] text-[#D8CFBC] text-sm font-mono">
                    Chain:
                </div>
                <div className="w-full flex items-center justify-center px-3 py-1 rounded-md bg-[#2c2c2c] border border-[#3d3932] text-[#D8CFBC] text-sm font-mono">
                    {networkName}
                </div>
            </div>

            <div className="w-full flex justify-start items-center gap-x-3">
                <div className="flex items-center justify-center px-3 py-1 rounded-md bg-[#2c2c2c] border border-[#3d3932] text-[#D8CFBC] text-sm font-mono">
                    SOL:
                </div>
                <div className="w-full flex items-center justify-center px-3 py-1 rounded-md bg-[#2c2c2c] border border-[#3d3932] text-[#D8CFBC] text-sm font-mono">
                    {balance.toFixed(4)} SOL
                </div>
            </div>

            <div className="w-full flex justify-start items-center gap-x-3">
                <div className="flex items-center justify-center px-3 py-1 rounded-md bg-[#2c2c2c] border border-[#3d3932] text-[#D8CFBC] text-sm font-mono">
                    USDC:
                </div>
                <div className="w-full flex items-center justify-center px-3 py-1 rounded-md bg-[#2c2c2c] border border-[#3d3932] text-[#D8CFBC] text-sm font-mono">
                    {usdcBalance.toFixed(2)} USDC
                </div>
            </div>

            <div className="w-full flex justify-center items-center gap-x-3 mt-6">
                <div
                    className="flex items-center justify-center px-5 py-1.5 rounded-md bg-[#fb2c3656] hover:bg-[#fb2c3675] transition-colors duration-200 ease-in-out border border-red-400 text-[#D8CFBC] text-sm font-mono cursor-pointer"
                    onClick={disconnect}
                >
                    Disconnect
                </div>
            </div>
        </div>
    );
};

export const Connecting = () => {
    return (
        <div className="flex justify-center items-center py-4 animate-in fade-in duration-300">
            <svg
                className="animate-spin h-6 w-6 text-[#D8CFBC]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
            </svg>
        </div>
    );
};
