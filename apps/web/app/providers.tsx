'use client';
import { ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    AlphaWalletAdapter,
} from '@solana/wallet-adapter-wallets';

export default function Providers({ children }: { children: ReactNode }) {
    // use mainnet
    const endpoint = clusterApiUrl('devnet'); // or "mainnet-beta"

    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new AlphaWalletAdapter()],
        [],
    );

    return (
        <div>
            {children}
        </div>
    );
}
