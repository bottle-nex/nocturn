'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

export default function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(
        () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network),
        [network],
    );

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        [],
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                {children}
            </WalletProvider>
        </ConnectionProvider>
    );
}
