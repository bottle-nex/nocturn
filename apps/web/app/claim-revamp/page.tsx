'use client';

import { useEffect, useCallback, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClaimStore } from '@/store/claim/useClaimStore';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { useConnection } from '@solana/wallet-adapter-react';
import SolanaAction from '@/lib/solana/SolanaAction';
import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import NotFoundDiagonalGrid from '@/components/notFound/NotFoundDiagonalGrid';
import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import UtilityCard from '@/components/utility/UtilityCard';
import LandingCardHeader from '@/components/refactor/LandingCardsSectionComponents/LandingCardHeader';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const FADE_UP = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
};

function getRankLabel(rank: number): string {
    if (rank === 1) return '1st Place';
    if (rank === 2) return '2nd Place';
    if (rank === 3) return '3rd Place';
    return `${rank}th Place`;
}

function getRankIcon(rank: number) {
    if (rank === 1)
        return {
            emoji: '1',
            bg: 'bg-amber-50',
            border: 'border-amber-300',
            text: 'text-amber-700',
            ring: 'ring-amber-200',
        };
    if (rank === 2)
        return {
            emoji: '2',
            bg: 'bg-slate-50',
            border: 'border-slate-300',
            text: 'text-slate-600',
            ring: 'ring-slate-200',
        };
    if (rank === 3)
        return {
            emoji: '3',
            bg: 'bg-orange-50',
            border: 'border-orange-300',
            text: 'text-orange-700',
            ring: 'ring-orange-200',
        };
    return {
        emoji: `${rank}`,
        bg: 'bg-indigo-50',
        border: 'border-indigo-300',
        text: 'text-indigo-700',
        ring: 'ring-indigo-200',
    };
}

function useCountdown(expiresAt: string) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const diff = Math.max(0, new Date(expiresAt).getTime() - now);
    return {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
    };
}

function truncateAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function Spinner() {
    return (
        <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
            <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
            />
            <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
        </svg>
    );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-2xl font-semibold text-dark-base/90 tabular-nums leading-none">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-dark-base/40 mt-1">
                {label}
            </span>
        </div>
    );
}

function CountdownSeparator() {
    return <span className="text-dark-base/20 text-xl font-light -mt-1">:</span>;
}

function LoadingPulse() {
    return (
        <div className="w-full space-y-3">
            <div className="h-20 rounded-lg bg-neutral-100 animate-pulse" />
            <div className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
            <div className="h-10 rounded-lg bg-neutral-100 animate-pulse w-3/4 mx-auto" />
        </div>
    );
}

function RankAmountCard({
    rank,
    amount,
    currency,
    quizTitle,
}: {
    rank: number;
    amount: number;
    currency: string;
    quizTitle: string;
}) {
    const style = getRankIcon(rank);
    return (
        <motion.div
            className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-4"
            whileHover={{ scale: 1.005 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`size-12 rounded-full ${style.bg} ${style.border} border flex items-center justify-center ring-2 ${style.ring} shrink-0`}
                >
                    <span className={`text-base font-bold ${style.text}`}>#{style.emoji}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-dark-base/40 leading-none mb-1">
                        {getRankLabel(rank)}
                    </p>
                    <p className="text-[15px] text-dark-base/60 truncate leading-tight">
                        {quizTitle}
                    </p>
                </div>

                <div className="text-right shrink-0">
                    <p className="text-2xl font-semibold text-dark-base/90 leading-none tabular-nums">
                        {amount.toFixed(2)}
                    </p>
                    <p className="text-[11px] uppercase tracking-widest text-dark-base/40 mt-0.5">
                        {currency}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function CountdownBar({ expiresAt }: { expiresAt: string }) {
    const { days, hours, minutes, seconds } = useCountdown(expiresAt);
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-lg border border-neutral-200 bg-white p-3"
        >
            <p className="text-[11px] uppercase tracking-widest text-dark-base/35 text-center mb-2">
                Claim expires in
            </p>
            <div className="flex items-center justify-center gap-2">
                <CountdownUnit value={days} label="days" />
                <CountdownSeparator />
                <CountdownUnit value={hours} label="hrs" />
                <CountdownSeparator />
                <CountdownUnit value={minutes} label="min" />
                <CountdownSeparator />
                <CountdownUnit value={seconds} label="sec" />
            </div>
        </motion.div>
    );
}

function ExpiredNotice() {
    return (
        <motion.div
            {...FADE_UP}
            className="rounded-lg border border-red-200 bg-red-50/60 p-4 text-center"
        >
            <div className="size-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-2">
                <svg
                    className="size-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <p className="text-[15px] font-medium text-red-700">Claim window has closed</p>
            <p className="text-[13px] text-red-500/70 mt-1 leading-relaxed">
                The prize has been returned to the host after the 7-day window.
            </p>
        </motion.div>
    );
}

function ClaimedNotice({
    claimerWallet,
    txSignature,
}: {
    claimerWallet: string | null;
    txSignature: string | null;
}) {
    return (
        <motion.div
            {...FADE_UP}
            className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-center space-y-2"
        >
            <div className="size-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto">
                <svg
                    className="size-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
            <p className="text-[15px] font-medium text-emerald-800">Successfully claimed</p>
            {claimerWallet && (
                <p className="text-[13px] text-emerald-600/70 font-mono">
                    {truncateAddress(claimerWallet)}
                </p>
            )}
            {txSignature && txSignature !== 'pending_onchain_implementation' && (
                <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
                >
                    View on Solana Explorer
                    <svg
                        className="size-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-4.5h6m0 0v6m0-6L9.75 14.25"
                        />
                    </svg>
                </a>
            )}
        </motion.div>
    );
}

function ErrorNotice({ error, onRetry }: { error: string | null; onRetry: () => void }) {
    return (
        <motion.div
            {...FADE_UP}
            className="rounded-lg border border-red-200 bg-red-50/60 p-4 text-center space-y-2"
        >
            <div className="size-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto">
                <svg
                    className="size-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                </svg>
            </div>
            <p className="text-[15px] font-medium text-red-700">Claim failed</p>
            <p className="text-[13px] text-red-500/70">{error}</p>
            <button
                type="button"
                onClick={onRetry}
                className="text-[13px] text-red-600 hover:text-red-800 font-medium underline underline-offset-2 transition-colors cursor-pointer"
            >
                Try again
            </button>
        </motion.div>
    );
}

function WalletSection({
    connected,
    publicKey,
    installedWallets,
    onSelectWallet,
    onClaim,
    claiming,
}: {
    connected: boolean;
    publicKey: PublicKey | null;
    installedWallets: { adapter: { name: string; icon: string }; readyState: string }[];
    onSelectWallet: (name: WalletName) => void;
    onClaim: () => void;
    claiming: boolean;
}) {
    return (
        <div className="space-y-3">
            {!connected ? (
                <motion.div {...FADE_UP} className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-dark-base/40 text-center">
                        Connect wallet
                    </p>
                    {installedWallets.length > 0 ? (
                        <div className="space-y-1.5">
                            {installedWallets.map((wallet) => (
                                <button
                                    type="button"
                                    key={wallet.adapter.name}
                                    onClick={() =>
                                        onSelectWallet(wallet.adapter.name as WalletName)
                                    }
                                    className="w-full flex items-center gap-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 p-3 transition-all duration-150 cursor-pointer group"
                                >
                                    <Image
                                        src={wallet.adapter.icon}
                                        alt={wallet.adapter.name}
                                        width={24}
                                        height={24}
                                        className="rounded"
                                        unoptimized
                                    />
                                    <span className="text-[15px] text-dark-base/70 group-hover:text-dark-base/90 transition-colors">
                                        {wallet.adapter.name}
                                    </span>
                                    <svg
                                        className="size-3.5 text-dark-base/20 group-hover:text-dark-base/40 ml-auto transition-colors"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                        />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-center">
                            <p className="text-sm text-dark-base/50 leading-relaxed">
                                No wallet detected. Install{' '}
                                <a
                                    href="https://phantom.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-alpha font-medium hover:underline"
                                >
                                    Phantom
                                </a>{' '}
                                or{' '}
                                <a
                                    href="https://solflare.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-alpha font-medium hover:underline"
                                >
                                    Solflare
                                </a>{' '}
                                to continue.
                            </p>
                        </div>
                    )}
                </motion.div>
            ) : (
                <motion.div {...FADE_UP} className="space-y-3">
                    <div className="rounded-lg border border-neutral-200 bg-white p-3 flex items-center gap-2.5">
                        <div className="size-2 rounded-full bg-emerald-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] uppercase tracking-wide text-dark-base/35 leading-none mb-0.5">
                                Connected
                            </p>
                            <p className="text-[13px] text-dark-base/70 font-mono truncate">
                                {publicKey?.toBase58()}
                            </p>
                        </div>
                    </div>

                    <Button
                        type="button"
                        onClick={onClaim}
                        disabled={claiming}
                        className="w-full h-11 rounded-lg text-[15px] font-medium shadow-sm"
                    >
                        {claiming ? (
                            <span className="flex items-center gap-2">
                                <Spinner />
                                Claiming...
                            </span>
                        ) : (
                            'Claim Prize'
                        )}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

export default function ClaimRevampPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const { pageStatus, claimData, error, setPageStatus, setClaimData, setError } = useClaimStore();
    const { publicKey, connected, select, wallets, signTransaction } = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();

    const installedWallets = useMemo(
        () => wallets.filter((w) => w.readyState === 'Installed'),
        [wallets],
    );

    const fetchClaim = useCallback(async () => {
        if (!token) {
            setPageStatus('not_found');
            return;
        }
        try {
            const data = await SolanaAction.fetchClaimDetails(token);
            setClaimData(data);
            if (data.status === 'CLAIMED') {
                setPageStatus('claimed');
            } else if (data.status === 'EXPIRED' || new Date(data.expiresAt) < new Date()) {
                setPageStatus('expired');
            } else {
                setPageStatus('pending');
            }
        } catch {
            setPageStatus('not_found');
        }
    }, [token, setClaimData, setPageStatus]);

    useEffect(() => {
        fetchClaim();
    }, [fetchClaim]);

    async function handleClaim() {
        if (!publicKey || !signTransaction || !anchorWallet || !token || !claimData) return;
        setPageStatus('claiming');
        try {
            const program = SolanaAction.getProgram(connection, anchorWallet);
            const { createInstruction } = await SolanaAction.ensureUsdcAta(connection, publicKey);
            const hostPubkey = new PublicKey(claimData.hostWalletPubkey!);
            const tx = await SolanaAction.buildClaimPrizeTx(
                program,
                claimData.quizId,
                token,
                publicKey,
                hostPubkey,
            );
            if (createInstruction) tx.instructions.unshift(createInstruction);
            const txSignature = await SolanaAction.signSendAndConfirm(
                connection,
                tx,
                publicKey,
                signTransaction,
            );
            const res = await SolanaAction.confirmClaim(token, txSignature, publicKey.toBase58());
            if (res.success) {
                setPageStatus('claimed');
                setClaimData({ ...claimData, status: 'CLAIMED', txSignature });
            }
        } catch {
            setError('Transaction failed. Please try again.');
            setPageStatus('error');
        }
    }

    function getHeaderTitle() {
        if (pageStatus === 'loading') return 'Loading...';
        if (pageStatus === 'not_found') return 'Claim Not Found';
        if (pageStatus === 'claimed') return 'Prize Claimed';
        if (pageStatus === 'expired') return 'Claim Expired';
        if (pageStatus === 'error') return 'Something Went Wrong';
        return 'Claim Your Prize';
    }

    function getHeaderDescription() {
        if (pageStatus === 'loading') return 'Verifying your claim link...';
        if (pageStatus === 'not_found') return 'This claim link is invalid or has been removed';
        if (pageStatus === 'claimed') return 'Your USDC has been transferred to your wallet';
        if (pageStatus === 'expired') return 'The 7-day claim window has passed';
        if (pageStatus === 'error') return error || 'An unexpected error occurred';
        return 'Connect your Solana wallet to withdraw your winnings';
    }

    return (
        <main className="min-h-screen max-h-screen h-full w-full flex flex-col items-center gap-y-10 bg-light-alpha relative max-w-270 mx-auto">
            <LandingNavbarComponent />
            <NotFoundDiagonalGrid />

            <section className="w-full flex-1 pt-40 pb-10 text-black relative z-10 flex items-center justify-center px-4">
                <UtilityCard className="rounded-xl w-full max-w-[420px] !px-6 !py-5 -mt-12">
                    <LandingCardHeader
                        title={getHeaderTitle()}
                        description={getHeaderDescription()}
                    />

                    <AnimatePresence mode="wait">
                        {pageStatus === 'loading' && (
                            <motion.div
                                key="loading"
                                {...FADE_UP}
                                className="mt-5 flex flex-col items-center gap-3"
                            >
                                <LoadingPulse />
                            </motion.div>
                        )}

                        {pageStatus === 'not_found' && (
                            <motion.div key="not-found" {...FADE_UP} className="mt-5">
                                <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4 text-center">
                                    <div className="text-3xl mb-2 opacity-40">?</div>
                                    <p className="text-sm text-dark-base/50 leading-relaxed">
                                        Double-check the link you received or contact the quiz host
                                        for a new one.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {claimData && pageStatus !== 'loading' && pageStatus !== 'not_found' && (
                            <motion.div key="claim-content" {...FADE_UP} className="mt-5 space-y-4">
                                <RankAmountCard
                                    rank={claimData.rank}
                                    amount={claimData.amount}
                                    currency={claimData.currency}
                                    quizTitle={claimData.quizTitle}
                                />

                                {(pageStatus === 'pending' ||
                                    pageStatus === 'connecting' ||
                                    pageStatus === 'claiming') && (
                                    <CountdownBar expiresAt={claimData.expiresAt} />
                                )}

                                {pageStatus === 'expired' && <ExpiredNotice />}

                                {pageStatus === 'claimed' && (
                                    <ClaimedNotice
                                        claimerWallet={claimData.claimerWallet}
                                        txSignature={claimData.txSignature}
                                    />
                                )}

                                {pageStatus === 'error' && (
                                    <ErrorNotice
                                        error={error}
                                        onRetry={() => setPageStatus('pending')}
                                    />
                                )}

                                {(pageStatus === 'pending' ||
                                    pageStatus === 'connecting' ||
                                    pageStatus === 'claiming') && (
                                    <WalletSection
                                        connected={connected}
                                        publicKey={publicKey}
                                        installedWallets={installedWallets}
                                        onSelectWallet={select}
                                        onClaim={handleClaim}
                                        claiming={pageStatus === 'claiming'}
                                    />
                                )}

                                <div className="pt-3 border-t border-neutral-200/80">
                                    <p className="text-[13px] text-dark-base/35 text-center tracking-wide">
                                        Winner:{' '}
                                        <span className="text-dark-base/55 font-medium">
                                            {claimData.participantName}
                                        </span>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </UtilityCard>
            </section>
        </main>
    );
}
