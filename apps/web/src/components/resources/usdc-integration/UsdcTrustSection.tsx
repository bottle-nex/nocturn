'use client';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import { RiLockFill, RiHandCoinFill, RiSearchEyeFill, RiTimeFill } from 'react-icons/ri';

export default function UsdcTrustSection() {
    return (
        <main className="max-w-270 mx-auto w-full py-15 px-5">
            <div className="max-w-lg">
                <p className="text-[11px] tracking-[0.25em] uppercase text-alpha/60 mb-4">
                    Trust layer
                </p>
                <h2 className="text-[38px] font-semibold text-dark-base/90 leading-[1.1]">
                    Built on trust,
                    <br />
                    <span className="text-dark-base/90">not promises.</span>
                </h2>
                <p className="text-[15px] text-dark-base/35 leading-relaxed mt-5 max-w-sm">
                    Every USDC prize pool is protected by transparent, verifiable safeguards.
                </p>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-5">
                <PerspectiveCard
                    sticky={false}
                    shadowColor="79,70,229"
                    className="rounded-2xl bg-dark-base ring-1 ring-white/6 p-9 row-span-2 flex flex-col justify-between relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-alpha/4 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />

                    <div className="relative z-10">
                        <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center mb-6">
                            <RiLockFill size={18} className="text-light-base/50" />
                        </div>
                        <h3 className="text-[26px] font-semibold text-light-base/90 leading-[1.15] tracking-[-0.01em]">
                            Funds are locked
                            <br />
                            <span className="text-light-base/40">
                                before the first question is asked
                            </span>
                        </h3>
                        <p className="text-[14px] text-light-base/30 leading-[1.7] mt-6 max-w-85">
                            The escrow account is controlled by a program deployed on Solana — not
                            by a person, not by a server. The program has a fixed set of rules: it
                            can only release funds to verified winners after the quiz is sealed.
                        </p>
                        <p className="text-[14px] text-light-base/30 leading-[1.7] mt-3 max-w-85">
                            Even if Nocturn&apos;s servers went offline, the funds would remain in
                            the vault. The host can only recover unclaimed prizes after the 7-day
                            window expires.
                        </p>
                    </div>

                    <div className="relative z-10 mt-10 flex items-center gap-x-2.5 text-[11px] tracking-wide text-light-base/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
                        Program-controlled · No admin keys · Immutable rules
                    </div>
                </PerspectiveCard>

                <PerspectiveCard
                    sticky={false}
                    delay={0.03}
                    className="rounded-2xl bg-dark-base ring-1 ring-white/6 p-8 flex flex-col justify-between relative overflow-hidden"
                >
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-alpha/3 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

                    <div className="relative z-10">
                        <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center mb-5">
                            <RiHandCoinFill size={18} className="text-light-base/50" />
                        </div>
                        <h3 className="text-[19px] font-semibold text-light-base/90 leading-tight tracking-[-0.01em]">
                            No middleman on claims
                        </h3>
                        <p className="text-[14px] text-light-base/30 leading-[1.7] mt-4">
                            When you claim your prize, the USDC moves directly from the escrow to
                            your wallet in a single transaction. Nocturn never touches your winnings
                            — the transfer is signed by the escrow program itself.
                        </p>
                    </div>
                </PerspectiveCard>

                <div className="grid grid-cols-2 gap-5">
                    <PerspectiveCard
                        sticky={false}
                        delay={0.06}
                        className="rounded-2xl bg-dark-base ring-1 ring-white/6 p-6 flex flex-col relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center mb-4">
                                <RiSearchEyeFill size={18} className="text-light-base/50" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-light-base/85 leading-snug">
                                Verifiable on Solana
                            </h3>
                            <p className="text-[13px] text-light-base/25 leading-[1.65] mt-3">
                                Every deposit, claim, and refund is a transaction you can look up on
                                any Solana explorer. Nothing is hidden.
                            </p>
                        </div>
                    </PerspectiveCard>

                    <PerspectiveCard
                        sticky={false}
                        delay={0.09}
                        className="rounded-2xl bg-dark-base ring-1 ring-white/6 p-6 flex flex-col relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center mb-4">
                                <RiTimeFill size={18} className="text-light-base/50" />
                            </div>
                            <h3 className="text-[15px] font-semibold text-light-base/85 leading-snug">
                                7-day claim window
                            </h3>
                            <p className="text-[13px] text-light-base/25 leading-[1.65] mt-3">
                                Unclaimed prizes return to the host after 7 days. Nothing gets stuck
                                — the program handles it automatically.
                            </p>
                        </div>
                    </PerspectiveCard>
                </div>
            </div>
        </main>
    );
}
