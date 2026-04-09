'use client';
import { Dispatch, JSX, SetStateAction, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';
import LandingSectionHeader from './LandingSectionHeader';

const users = [
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-8.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-9.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-12.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-15.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-17.jpg' },
];

const names = [
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Emily Davis',
    'David Brown',
    'Sarah Wilson',
    'James Miller',
    'Olivia Taylor',
    'Daniel Anderson',
    'Sophia Thomas',
    'William Moore',
    'Isabella Jackson',
    'Alexander White',
    'Ava Harris',
    'Benjamin Martin',
    'Mia Thompson',
    'Christopher Garcia',
];

const barColors = [
    '#841836',
    '#a4133c',
    '#c9184a',
    '#ff4d6d',
    '#ff758f',
    '#ff8fa3',
    '#1b035e',
    '#310e8a',
    '#5500b6',
    '#2100c7',
    '#7300d8',
    '#7248e4',
];

const sorted = users.map((u, i) => ({
    avatar: u.avatar,
    position: i + 1,
    name: names[i] ?? `Player ${i + 1}`,
    score: Math.round(10000 - i * 480 + (i % 3) * 120),
}));

const topThree = sorted.filter((d) => d.position <= 3);
const rest = sorted.filter((d) => d.position > 3);
const maxScore = rest[0]?.score ?? 1;

enum LeftRenderType {
    COIN = 'COIN',
    INPUTS = 'INPUTS',
}

export default function LandingUsdcSection(): JSX.Element {
    const [leftRenderType, setLeftRenderType] = useState<LeftRenderType>(LeftRenderType.COIN);

    return (
        <main className="max-w-270 mx-auto w-full py-15 px-6 xl:px-0">
            <LandingSectionHeader
                heading="USDC Support"
                subheading="Learn more about our USDC integration."
            />

            <div className="w-full h-auto lg:h-150 flex items-center justify-center rounded-2xl overflow-hidden mt-16">
                <section className="text-dark-alpha flex flex-col lg:grid lg:grid-cols-[40%_60%] w-full h-full">
                    <main className="bg-dark-alpha w-full h-120 lg:h-full block relative overflow-hidden shrink-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={leftRenderType}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                                className="w-full h-full"
                            >
                                {leftRenderType === LeftRenderType.COIN ? (
                                    <LeftCoinContent setLeftRenderType={setLeftRenderType} />
                                ) : (
                                    <LeftInputsContent setLeftRenderType={setLeftRenderType} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                    <main className="bg-dark-base w-full h-120 lg:h-full block overflow-y-auto custom-scrollbar p-6 lg:p-8 text-light-base">
                        <h1 className="text-center text-2xl mb-12">Quiz Leaderboards</h1>
                        <div className="flex items-center justify-center gap-x-8 pt-10 pb-6">
                            {[...topThree]
                                .sort(
                                    (a, b) =>
                                        (a.position % 2) - (b.position % 2) ||
                                        a.position - b.position,
                                )
                                .map((item) => (
                                    <div
                                        key={item.position}
                                        className={cn(
                                            'relative',
                                            item.position === 1 && '-translate-y-4',
                                        )}
                                    >
                                        {item.position === 1 && (
                                            <Image
                                                alt="crown"
                                                src="/images/crown.png"
                                                width={56}
                                                height={56}
                                                className="absolute -top-10 -rotate-20"
                                            />
                                        )}
                                        <Image
                                            src={item.avatar}
                                            alt={`Position ${item.position}`}
                                            width={80}
                                            height={80}
                                            className="rounded-full"
                                        />
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-neutral-800 aspect-square">
                                            <span className="block text-center font-bold">
                                                #{item.position}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center text-base font-normal">
                                            <span className="block text-black text-sm">
                                                {item.name.split(' ')[0]}
                                            </span>
                                            <span className="block text-xs">{item.score}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <div className="px-4 pb-4 flex flex-col gap-y-0 max-w-2xl mx-auto mt-10">
                            {rest.map((item) => {
                                const barWidthPercent = (item.score / maxScore) * 80;
                                return (
                                    <div key={item.position} className="flex items-center gap-x-2">
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 0.4,
                                                delay: (item.position - 4) * 0.04 + 0.6,
                                                ease: 'easeOut',
                                            }}
                                            className="text-sm font-bold w-14 text-right shrink-0"
                                        >
                                            {item.score.toLocaleString()} p
                                        </motion.span>
                                        <div className="flex-1 flex items-center min-w-0">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${barWidthPercent}%` }}
                                                viewport={{ once: true }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: (item.position - 4) * 0.04,
                                                    ease: [0.16, 1, 0.3, 1],
                                                }}
                                                className="h-8 rounded-r-full shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        barColors[
                                                            (item.position - 1) % barColors.length
                                                        ],
                                                }}
                                            />
                                            <div className="relative w-9 h-9 shrink-0 -translate-x-6 rounded-full bg-white border-2 border-white">
                                                <Image
                                                    src={item.avatar}
                                                    alt={item.name}
                                                    fill
                                                    className="rounded-full object-cover"
                                                />
                                            </div>
                                            <span className="text-sm font-semibold  shrink-0 w-24 text-nowrap truncate">
                                                {item.name}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </main>
                </section>
            </div>
        </main>
    );
}

function LeftCoinContent({
    setLeftRenderType,
}: {
    setLeftRenderType: Dispatch<SetStateAction<LeftRenderType>>;
}) {
    return (
        <main className="w-full h-full relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 rounded-full bg-white/[0.07] blur-[80px]" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    className="w-52 h-52 rounded-full border border-white/12"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/60" />
                </motion.div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    className="w-64 h-64 rounded-full border border-dashed border-white/6"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {[
                { x: '20%', y: '25%', size: 3, delay: 0 },
                { x: '75%', y: '20%', size: 2, delay: 1.2 },
                { x: '15%', y: '70%', size: 2.5, delay: 0.6 },
                { x: '80%', y: '65%', size: 2, delay: 1.8 },
                { x: '65%', y: '82%', size: 3, delay: 0.3 },
            ].map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/40"
                    style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
                    animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
                    transition={{
                        duration: 3,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            <motion.div
                className="absolute top-8 left-8"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/50 mb-1">
                    Now accepting
                </p>
                <p className="text-lg font-semibold text-white">USDC Support</p>
            </motion.div>

            <div className="w-full h-full flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="relative"
                    >
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full bg-black/20 blur-md" />
                        <Image
                            src="/icons/usdc.png"
                            alt="USDC Coin"
                            width={140}
                            height={140}
                            className="drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                        />
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                className="absolute bottom-8 left-8 right-8 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            />
            <div
                onClick={() => setLeftRenderType(LeftRenderType.INPUTS)}
                className="absolute bottom-8 left-8 right-8 h-10 w-10 rounded-full bg-light-alpha flex items-center justify-center -rotate-45 cursor-pointer"
            >
                <ChevronRight />
            </div>
        </main>
    );
}

const rankColors = ['text-yellow-400', 'text-neutral-300', 'text-amber-600', 'text-neutral-400'];
const defaultPercentages = [50, 30, 20];
const demoPool = 250;

const staggerItem = (index: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] as const },
});

function LeftInputsContent({
    setLeftRenderType,
}: {
    setLeftRenderType: Dispatch<SetStateAction<LeftRenderType>>;
}) {
    return (
        <div className="w-full h-full relative overflow-hidden text-white">
            <motion.div className="absolute top-8 left-8" {...staggerItem(0)}>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/50 mb-1">
                    Configure
                </p>
                <p className="text-lg font-semibold text-white">Prize Pool</p>
            </motion.div>

            <div className="w-full h-full flex flex-col justify-between pt-24 px-8 pb-8 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-y-5">
                    {/* Stake Amount */}
                    <motion.div className="space-y-2" {...staggerItem(1)}>
                        <span className="text-base font-normal text-white/90">Stake Amount</span>
                        <p className="text-sm text-white/40">
                            Minimum stake: 1 USDC · Maximum: 10,000 USDC
                        </p>
                        <div className="relative mt-2">
                            <input
                                type="text"
                                readOnly
                                title="Stake amount"
                                value="250.00"
                                className="w-full h-12 rounded-lg bg-white/[0.07] px-4 py-3 text-base font-mono text-white outline-none transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40 font-medium">
                                USDC
                            </span>
                        </div>
                    </motion.div>

                    {/* Prize Distribution */}
                    <div className="space-y-3">
                        <motion.span
                            className="text-base font-normal text-white/90 block"
                            {...staggerItem(2)}
                        >
                            Prize Distribution
                        </motion.span>

                        <motion.div className="flex items-center gap-x-2" {...staggerItem(3)}>
                            <label className="text-sm text-white/40">Number of winners:</label>
                            <input
                                type="text"
                                readOnly
                                title="Number of winners"
                                value="3"
                                className="w-16 h-9 rounded-md bg-white/[0.07] px-3 py-2 text-sm font-mono text-white outline-none"
                            />
                        </motion.div>

                        <div className="space-y-1.5">
                            {defaultPercentages.map((pct, i) => {
                                const rankLabel = i === 0 ? '1st' : i === 1 ? '2nd' : '3rd';
                                const amount = ((demoPool * pct) / 100).toFixed(2);
                                return (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-x-2"
                                        {...staggerItem(4 + i)}
                                    >
                                        <span
                                            className={cn('text-sm font-medium w-7', rankColors[i])}
                                        >
                                            {rankLabel}
                                        </span>
                                        <input
                                            type="text"
                                            readOnly
                                            title={`${rankLabel} percentage`}
                                            value={pct}
                                            className="w-16 h-9 rounded-md bg-white/[0.07] px-3 py-2 text-sm font-mono text-white outline-none"
                                        />
                                        <span className="text-sm text-white/40">%</span>
                                        <span className="text-sm text-white/30 ml-auto font-mono">
                                            {amount} USDC
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            className="flex items-center justify-between pt-2 border-t border-white/10"
                            {...staggerItem(7)}
                        >
                            <span className="text-sm font-medium text-green-400">
                                Total: 100.0%
                            </span>
                        </motion.div>
                    </div>
                </div>

                <motion.div {...staggerItem(8)}>
                    <Button
                        onClick={() => setLeftRenderType(LeftRenderType.COIN)}
                        className="w-full h-10 rounded-lg text-light-base text-base font-semibold flex items-center justify-center cursor-pointer transition-colors mt-6"
                    >
                        Stake USDC
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
