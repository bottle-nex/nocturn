'use client';
import { motion } from 'framer-motion';
import LandingSectionHeader from '@/components/refactor/LandingSectionHeader';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import Image from 'next/image';

export default function UsdcHowItWorksSection() {
    return (
        <main className="max-w-270 mx-auto w-full py-15 px-5">
            <LandingSectionHeader
                heading="How It Works"
                subheading="From setting up a prize pool to claiming your winnings."
            />

            <div className="mt-20 grid grid-cols-[1fr_1fr] gap-8 items-start">
                <div className="sticky top-30 self-start flex flex-col gap-y-4 py-4">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-alpha font-semibold">
                        Step 01
                    </span>
                    <h2 className="text-[38px] font-semibold text-dark-base/90 leading-[1.1]">
                        The money goes into a vault.before anyone plays
                    </h2>
                    <p className="text-base text-dark-base/55 leading-relaxed max-w-md mt-1">
                        When a host creates a quiz with a prize pool, they sign a single transaction
                        that moves their USDC into a secure escrow account on Solana. This account
                        is controlled by an automated program.not by Nocturn, and not by the host.
                    </p>
                    <p className="text-base text-dark-base/55 leading-relaxed max-w-md">
                        Once the funds are in, they&apos;re locked. The host cannot pull them back
                        during the quiz. The only way money leaves the vault is when winners claim
                        it.or when unclaimed prizes expire after 7 days.
                    </p>
                    <div className="flex items-center gap-x-3 mt-3">
                        <div className="h-px flex-1 bg-dark-base/8" />
                        <span className="text-[11px] text-dark-base/30 tracking-wide">
                            99% prize pool · 1% platform fee
                        </span>
                        <div className="h-px flex-1 bg-dark-base/8" />
                    </div>
                </div>

                <div className="flex flex-col gap-y-6">
                    <PerspectiveCard
                        sticky={false}
                        shadowColor="79,70,229"
                        className="rounded-2xl bg-dark-base ring-1 ring-white/8 p-8 h-96 flex flex-col justify-between overflow-hidden relative"
                    >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 rounded-full bg-alpha/10 blur-[80px]" />
                        </div>

                        <div className="relative z-10">
                            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-light-base/40 mb-1">
                                Escrow Account
                            </p>
                            <p className="text-lg font-semibold text-light-base/90">
                                Secure Vault on Solana
                            </p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center gap-y-4">
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Image
                                    src="/icons/usdc.png"
                                    alt="USDC"
                                    width={64}
                                    height={64}
                                    className="drop-shadow-[0_0_24px_rgba(255,255,255,0.12)]"
                                />
                            </motion.div>
                            <div className="text-2xl font-semibold text-light-base/90 font-mono">
                                250.00 USDC
                            </div>
                            <div className="text-[12px] text-light-base/35 tracking-wide">
                                Locked until quiz ends · PDA-secured
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between text-[12px] text-light-base/30">
                            <span>Host deposit confirmed</span>
                            <span className="text-green-400/70">Verified on-chain</span>
                        </div>
                    </PerspectiveCard>

                    <PerspectiveCard
                        sticky={false}
                        delay={0.05}
                        className="rounded-2xl bg-[#f8f7ff] ring-1 ring-alpha/8 p-8 flex flex-col gap-y-5"
                    >
                        <div className="text-[17px] font-semibold text-dark-base/90">
                            What happens under the hood
                        </div>
                        <div className="flex flex-col gap-y-0">
                            {[
                                {
                                    label: 'Host signs one transaction',
                                    detail: 'USDC moves from their wallet to the escrow account',
                                },
                                {
                                    label: 'Escrow is program-controlled',
                                    detail: 'No human can access the funds.only the automated program can release them',
                                },
                                {
                                    label: 'Quiz account is created on Solana',
                                    detail: 'Stores the quiz ID, prize amount, host identity, and finalization status',
                                },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex gap-x-4 py-3.5 border-b border-dark-base/5 last:border-0"
                                >
                                    <div className="w-6 h-6 rounded-full bg-alpha/10 text-alpha text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div className="text-[14px] font-semibold text-dark-base/80">
                                            {item.label}
                                        </div>
                                        <div className="text-[13px] text-dark-base/40 mt-0.5">
                                            {item.detail}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PerspectiveCard>
                </div>
            </div>

            <div className="mt-28 grid grid-cols-[1fr_1fr] gap-8 items-start">
                <PerspectiveCard
                    sticky={false}
                    shadowColor="13,148,136"
                    className="rounded-2xl bg-[#f0fdfa] ring-1 ring-teal-200/40 p-8 h-80 flex flex-col justify-between"
                >
                    <div>
                        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-teal-600/60 mb-1">
                            During the Quiz
                        </p>
                        <p className="text-lg font-semibold text-dark-base/85">
                            Scores update in real time
                        </p>
                    </div>

                    <div className="flex flex-col gap-y-2">
                        {[
                            { name: 'Sarah K.', score: 4820, w: '100%' },
                            { name: 'Mike T.', score: 4650, w: '96%' },
                            { name: 'Alex R.', score: 3900, w: '81%' },
                        ].map((p, i) => (
                            <div key={i} className="flex items-center gap-x-3">
                                <span className="text-[12px] font-semibold text-dark-base/40 w-5">
                                    {i + 1}
                                </span>
                                <div className="flex-1 h-7 bg-teal-100/60 rounded-md overflow-hidden">
                                    <motion.div
                                        className="h-full bg-teal-500/20 rounded-md"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: p.w }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.9,
                                            ease: [0.25, 1, 0.5, 1],
                                            delay: i * 0.1 + 0.2,
                                        }}
                                    />
                                </div>
                                <span className="text-[12px] font-medium text-dark-base/50 w-16 truncate">
                                    {p.name}
                                </span>
                                <span className="text-[12px] font-bold text-dark-base/70 w-10 text-right font-mono">
                                    {p.score}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="text-[12px] text-dark-base/30">
                        Tied players at the same rank split the combined prize equally
                    </div>
                </PerspectiveCard>

                <div className="sticky top-30 self-start flex flex-col gap-y-4 py-4">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-teal-600 font-semibold">
                        Step 02
                    </span>
                    <h2 className="text-[38px] font-semibold text-dark-base/90 leading-[1.1]">
                        The quiz runs.the vault stays sealed
                    </h2>
                    <p className="text-base text-dark-base/55 leading-relaxed max-w-md mt-1">
                        While players are answering questions, the prize pool sits untouched in the
                        escrow. Scores are tracked in real time across all participants, and the
                        leaderboard updates after every question.
                    </p>
                    <p className="text-base text-dark-base/55 leading-relaxed max-w-md">
                        If two players tie, they share the combined prize for their ranks. For
                        example, if 1st and 2nd place tie, they split 50% + 30% = 40% each. Fair and
                        automatic.
                    </p>
                </div>
            </div>

            <div className="mt-28 grid grid-cols-[1fr_1fr] gap-8 items-start">
                <div className="sticky top-30 self-start flex flex-col gap-y-4 py-4">
                    <span className="text-[11px] tracking-[0.2em] uppercase text-amber-600 font-semibold">
                        Step 03
                    </span>
                    <h2 className="text-[38px] font-semibold text-dark-base/90 leading-[1.1]">
                        Winners are sealed on Solana
                    </h2>
                    <p className="text-base text-dark-base/55 leading-relaxed max-w-md mt-1">
                        When the quiz ends, final rankings are locked in. The platform creates a
                        claim record for each winner on Solana.storing their rank, prize amount, and
                        a 7-day expiry window.
                    </p>
                    <p className="text-base text-dark-base/55 leading-relaxed max-w-md">
                        Once all claims are written, the quiz is &ldquo;sealed.&rdquo; From this
                        point, the results are immutable.no one can change who won or how much
                        they&apos;re owed. The only remaining action is for winners to claim.
                    </p>
                    <p className="text-[13px] text-dark-base/35 leading-relaxed max-w-md mt-1">
                        Each winner receives an email with a unique, secret claim link. The link is
                        hashed before being stored.even Nocturn can&apos;t reconstruct it from the
                        database.
                    </p>
                </div>

                <PerspectiveCard
                    sticky={false}
                    shadowColor="180,83,9"
                    className="rounded-2xl bg-[#fffbeb] ring-1 ring-amber-200/40 p-8 flex flex-col gap-y-5"
                >
                    <div>
                        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-amber-600/60 mb-1">
                            After Quiz Ends
                        </p>
                        <p className="text-lg font-semibold text-dark-base/85">
                            Claims are created on-chain
                        </p>
                    </div>

                    <div className="flex flex-col gap-y-3">
                        {[
                            {
                                rank: '1st',
                                amount: '125.00',
                                status: 'Ready to claim',
                                color: 'text-amber-700',
                            },
                            {
                                rank: '2nd',
                                amount: '75.00',
                                status: 'Ready to claim',
                                color: 'text-amber-600',
                            },
                            {
                                rank: '3rd',
                                amount: '50.00',
                                status: 'Ready to claim',
                                color: 'text-amber-500',
                            },
                        ].map((claim, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-3 px-4 bg-white/60 rounded-xl ring-1 ring-amber-100"
                            >
                                <div className="flex items-center gap-x-3">
                                    <span className={`text-[13px] font-bold ${claim.color} w-6`}>
                                        {claim.rank}
                                    </span>
                                    <span className="text-[14px] font-semibold text-dark-base/80 font-mono">
                                        {claim.amount} USDC
                                    </span>
                                </div>
                                <span className="text-[11px] tracking-wide text-green-600/70 font-medium">
                                    {claim.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-x-3 pt-3 border-t border-amber-200/40">
                        <div className="w-2 h-2 rounded-full bg-green-500/60" />
                        <span className="text-[12px] text-dark-base/40">
                            Quiz sealed · 7-day claim window active · results immutable
                        </span>
                    </div>
                </PerspectiveCard>
            </div>
        </main>
    );
}
