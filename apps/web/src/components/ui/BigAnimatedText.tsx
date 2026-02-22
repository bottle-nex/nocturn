'use client';

import { useEffect, useRef, useState } from 'react';
import { GiGamepad } from 'react-icons/gi';
import gsap from 'gsap';
import { SiSolana } from 'react-icons/si';
import { RiTrophyFill, RiGogglesFill } from 'react-icons/ri';
import Image from 'next/image';

const COLORS = ['#05a552', '#7a78ff', '#ff6d38', '#ffc413', '#e53e40'];
type ContentType = string | React.ReactElement;

const contentCycles: ContentType[][] = [
    ['Play & win', 'Start the quest', 'Win big!'],
    [<GiGamepad key="gamepad" size={36} />, <RiGogglesFill key="gamepad" size={36} />, 'Play'],
    [<SiSolana key="solana" size={28} />, <RiTrophyFill key="trophy" size={28} />, 'SOL'],
    ['Spectators builds margin', 'Margin boost', 'Cheerleaders win too!'],
    ['Pump.fun energy', 'Hyped crowd', 'Energy maxed!'],
];

export default function BigAnimatedText() {
    const boxesRef = useRef<(HTMLDivElement | null)[]>([]);
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [cycleIndex, setCycleIndex] = useState(0);
    const [colorOrder, setColorOrder] = useState(COLORS);

    const positions = [
        'top-[-2.5rem] right-12',
        '-top-8 left-12',
        'bottom-2 right-8',
        'bottom-16 right-[40%] translate-x-1/2',
        'bottom-[-2rem] left-8',
    ];

    function shuffleColors(colors: string[]): string[] {
        const shuffled = [...colors];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i]!;
            shuffled[i] = shuffled[j]!;
            shuffled[j] = temp;
        }
        return shuffled;
    }

    function runAnimation() {
        boxesRef.current.forEach((box, i) => {
            if (!box || !contentRefs.current[i]) return;

            const tl = gsap.timeline();
            tl.set(box, { transformOrigin: 'left center' });
            tl.fromTo(
                box,
                { scaleX: 0, opacity: 1 },
                {
                    scaleX: 1,
                    duration: 0.5,
                    ease: 'power2.out',
                },
            ).fromTo(
                contentRefs.current[i],
                { opacity: 0 },
                {
                    opacity: 1,
                    duration: 0.3,
                    delay: 0.1,
                },
            );
        });
    }

    useEffect(() => {
        runAnimation();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCycleIndex((prev) => (prev + 1) % 3);
            setColorOrder(shuffleColors(COLORS));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        runAnimation();
    }, [cycleIndex, colorOrder]);

    return (
        <div className="w-full min-h-dvh flex flex-col gap-y-40 justify-center items-center mx-auto text-dark-alpha relative z-30 shadow-3xl py-40">
            {/* <Image
                src={"/illustrations/cat.png"}
                width={200}
                height={200}
                alt='sd'
                className='absolute left-32 -bottom-3'
            /> */}
            <section className='w-full max-w-7xl relative mx-auto h-140'>
                <Image
                    src={"/illustrations/animated-text.jpeg"}
                    fill
                    alt='sd'
                    className='object-cover rounded-lg'
                />
            </section>
            <div className="flex flex-col items-center gap-y-8">
                <div className="relative max-w-3xl">
                    <h1 className="text-center text-7xl font-bold text-nprime-darker">
                        Knowledge Is Power. Power Pays.
                    </h1>

                    {contentCycles.map((contentList, idx) => {
                        const content = contentList[cycleIndex];
                        const bgColor = colorOrder[idx] ?? COLORS[idx];

                        return (
                            <div
                                key={`box-${idx}`}
                                ref={(el) => {
                                    boxesRef.current[idx] = el;
                                }}
                                className={`absolute ${positions[idx]} px-4 py-2.5 border dark:border-neutral-900 border-neutral-200 text-neutral-800 font-bold overflow-hidden`}
                                style={{
                                    backgroundColor: bgColor,
                                }}
                            >
                                <div
                                    ref={(el) => {
                                        contentRefs.current[idx] = el;
                                    }}
                                    style={{
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                    }}
                                >
                                    {content}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="max-w-160 text-center text-xl font-normal text-nprime-dark">
                    This isn&apos;t your grandmas GK quiz. Here, you stake tokens, flex knowledge,
                    and pray your last three brain cells don&apos;t betray you on question 7. Every
                    round feels like Squid Game but with fewer fatalities and more wallets.
                </div>
            </div>
        </div>
    );
}
