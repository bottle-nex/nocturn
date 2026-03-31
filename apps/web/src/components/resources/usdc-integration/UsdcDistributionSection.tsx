'use client';
import LandingSectionHeader from '@/components/refactor/LandingSectionHeader';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import { motion } from 'framer-motion';

const distributions = [
    { rank: '1st', amount: '125.00', percentage: 50, width: '100%', color: '#4f46e5' },
    { rank: '2nd', amount: '75.00', percentage: 30, width: '60%', color: '#7c6ef0' },
    { rank: '3rd', amount: '50.00', percentage: 20, width: '40%', color: '#a5a0f5' },
];

export default function UsdcDistributionSection() {
    return (
        <main className="max-w-270 mx-auto w-full py-15 px-5">
            <LandingSectionHeader
                heading="Fair Splits, Transparent Payouts"
                subheading="Hosts decide exactly how the prize pool is divided before anyone plays."
            />

            <div className="mt-16 grid grid-cols-[1fr_1fr] gap-8 items-start">
                <PerspectiveCard
                    sticky={false}
                    shadowColor="79,70,229"
                    className="rounded-2xl bg-light-base ring-1 ring-black/8 p-10"
                >
                    <div className="flex items-baseline justify-between mb-8">
                        <div>
                            <div className="text-[11px] tracking-[0.15em] uppercase text-dark-base/30 font-medium mb-1">
                                Example Prize Pool
                            </div>
                            <div className="text-3xl font-semibold text-dark-base/90">250 USDC</div>
                        </div>
                        <div className="text-[12px] text-dark-base/30">3 winners</div>
                    </div>

                    <div className="space-y-4">
                        {distributions.map((dist, idx) => (
                            <div key={idx} className="flex items-center gap-x-4">
                                <span className="text-[13px] font-bold text-dark-base/40 w-8 shrink-0">
                                    {dist.rank}
                                </span>
                                <div className="flex-1 h-10 bg-dark-base/4 rounded-lg overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-lg flex items-center justify-between px-4"
                                        style={{ backgroundColor: dist.color }}
                                        initial={{ width: 0 }}
                                        whileInView={{ width: dist.width }}
                                        viewport={{ once: true, margin: '-50px' }}
                                        transition={{
                                            duration: 0.9,
                                            ease: [0.25, 1, 0.5, 1],
                                            delay: idx * 0.12,
                                        }}
                                    >
                                        <span className="text-[12px] font-semibold text-white/90">
                                            {dist.percentage}%
                                        </span>
                                    </motion.div>
                                </div>
                                <span className="text-[14px] font-semibold text-dark-base/70 w-24 text-right shrink-0 font-mono">
                                    {dist.amount}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-7 pt-5 border-t border-dark-base/5 flex items-center justify-between text-[12px] text-dark-base/30">
                        <span>Percentages must total 100%</span>
                        <span>Amounts calculated automatically</span>
                    </div>
                </PerspectiveCard>

                <div className="flex flex-col gap-y-5 py-4">
                    <h2 className="text-[28px] font-semibold text-dark-base/90 leading-tight">
                        The host configures the split before staking
                    </h2>
                    <p className="text-base text-dark-base/55 leading-relaxed">
                        When creating a quiz, the host sets the number of winners and assigns a
                        percentage to each rank. The platform calculates the exact USDC amount per
                        rank based on the total pool.
                    </p>
                    <p className="text-base text-dark-base/55 leading-relaxed">
                        These percentages are locked in when the host stakes. Winners can see what
                        each rank pays before the quiz starts.there are no surprises.
                    </p>

                    <div className="mt-4 flex flex-col gap-y-3">
                        {[
                            {
                                q: 'What if two players tie?',
                                a: 'They share the combined prize. If 1st and 2nd tie, they split (50% + 30%) = 40% each.',
                            },
                            {
                                q: 'Can hosts have more than 3 winners?',
                                a: 'Yes.hosts choose the number of winning positions and set custom percentages for each.',
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-light-base/70 rounded-xl p-4 ring-1 ring-black/5"
                            >
                                <div className="text-[14px] font-semibold text-dark-base/80">
                                    {item.q}
                                </div>
                                <div className="text-[13px] text-dark-base/45 mt-1 leading-relaxed">
                                    {item.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
