'use client';
import Image from 'next/image';
import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
    {
        image: '/images/stakeIllustration.png',
        heading: 'Stake to Play',
        text: 'Put real SOL on the line before the quiz begins. Every question matters more when there’s something at stake.',
    },
    {
        image: '/images/spectate.png',
        heading: 'Spectate or Intervene',
        text: 'Watch the game unfold live or jump in during critical moments to influence the outcome with lifelines.',
    },
    {
        image: '/images/SOLANA.png',
        heading: 'Win on Solana',
        text: 'Fast, low-fee payouts powered by Solana. Winners are rewarded instantly and transparently on-chain.',
    },
];

export default function NocturnPerksSection() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const pinRef = useRef<HTMLDivElement | null>(null);
    const headingRef = useRef<HTMLDivElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);
    const [activeStep, setActiveStep] = useState<number>(0);

    useLayoutEffect(() => {
        if (!sectionRef.current || !pinRef.current) return;

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: sectionRef.current,
                start: 'top top',
                end: '+=300%',
                pin: pinRef.current,
                scrub: true,
                onUpdate: (self) => {
                    const index = Math.min(
                        STEPS.length - 1,
                        Math.floor(self.progress * STEPS.length),
                    );

                    setActiveStep((prev) => (prev === index ? prev : index));
                },
            });
        });

        return () => {
            ctx.revert();
        };
    }, []);

    useLayoutEffect(() => {
        if (!headingRef.current || !textRef.current) return;

        gsap.killTweensOf([headingRef.current, textRef.current]);
        gsap.set([headingRef.current, textRef.current], { opacity: 0 });

        const tl = gsap.timeline();

        tl.fromTo(
            headingRef.current,
            { y: 18, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power3.out',
            },
        ).fromTo(
            textRef.current,
            { y: 14, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.35,
                ease: 'power2.out',
            },
            '-=0.25',
        );

        return () => {
            tl.kill();
        };
    }, [activeStep]);

    return (
        <div className="min-h-screen w-full py-20 flex flex-col bg-nlighter">
            <div className="flex flex-col text-ndarkest px-60 text-7xl gap-y-1.5 font-semibold mb-10">
                <div>The perks of quizzing</div>
                <div className="">with Nocturn</div>
                <div className="text-2xl max-w-[50rem] flex mt-4 font-normal tracking-wide text-ndarker">
                    Normal quizzes often fall flat because they lack excitement, something that only
                    comes from having real stakes, strategic lifelines, and a sense of competition
                    that pushes players to give their best.
                </div>
            </div>

            <section ref={sectionRef} className="relative w-full" style={{ height: '300vh' }}>
                <div ref={pinRef} className="h-screen w-full ">
                    <div className="h-screen w-full border-3 border-ndarkest ml-60 pt-10 rounded-3xl relative flex items-center bg-nlight">
                        {/* change rgb here to nprime-darker */}
                        <div className="h-130 w-130 border-3 border-black absolute -left-30 rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <div className="h-full w-full overflow-hidden">
                                <Image
                                    src={STEPS[activeStep].image}
                                    alt="image"
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        <div className="w-full h-full pl-140 flex flex-col justify-center">
                            <div
                                ref={headingRef}
                                className="text-5xl text-ndarkest font-semibold tracking-wide"
                            >
                                {STEPS[activeStep].heading}
                            </div>

                            <div ref={textRef} className="text-2xl text-ndarker mt-2 max-w-[30rem]">
                                {STEPS[activeStep].text}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
