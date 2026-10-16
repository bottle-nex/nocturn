'use client';
import { LuCircle } from 'react-icons/lu';
import { motion, useAnimate } from 'motion/react';
import { useEffect, useRef } from 'react';

export default function LaunchGameCard() {
    const [scope, animate] = useAnimate();
    const circleRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let cancelled = false;

        const setCircleStroke = (width: string) => {
            if (circleRef.current) {
                const svg = circleRef.current.querySelector('svg');
                if (svg) svg.style.strokeWidth = width;
            }
        };

        const runAnimation = async () => {
            while (!cancelled) {
                // reset state
                await animate(
                    '#launch-card',
                    {
                        rotate: 0,
                        x: 0,
                        y: 0,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        outlineWidth: '0px',
                    },
                    { duration: 0 },
                );
                await animate('#cursor', { opacity: 0, x: 160, y: 100 }, { duration: 0 });
                await animate('#press-ring', { opacity: 0, scale: 0.5 }, { duration: 0 });
                setCircleStroke('2px');

                await new Promise((r) => setTimeout(r, 600));

                // cursor fades in
                await animate('#cursor', { opacity: 1 }, { duration: 0.35, ease: 'easeOut' });

                // cursor moves to circle icon
                await animate(
                    '#cursor',
                    { x: 130, y: 90 },
                    { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
                );

                // press effect ->  ripple + card tilts + ring appears + circle stroke thickens
                setCircleStroke('5px');
                await Promise.all([
                    animate(
                        '#press-ring',
                        { opacity: [0, 0.6, 0], scale: [0.5, 1.8, 2.2], x: 9, y: 15 },
                        { duration: 0.5, ease: 'easeOut' },
                    ),
                    animate(
                        '#launch-card',
                        {
                            rotate: 5,
                            x: -6,
                            y: -4,
                            boxShadow: '0 8px 24px rgba(99,102,241,0.25)',
                            outlineWidth: '1px',
                            outlineStyle: 'solid',
                            outlineColor: 'var(--color-alpha)',
                        },
                        { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
                    ),
                ]);

                await new Promise((r) => setTimeout(r, 2200));

                // Cursor fades out
                await animate('#cursor', { opacity: 0 }, { duration: 0.2, ease: 'easeIn' });

                // Card returns + outline clears + circle stroke resets
                setCircleStroke('2px');
                await animate(
                    '#launch-card',
                    {
                        rotate: 0,
                        x: 0,
                        y: 0,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        outlineWidth: '0px',
                    },
                    { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
                );

                await new Promise((r) => setTimeout(r, 800));
            }
        };

        runAnimation();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={scope} className="h-50 flex flex-col gap-y-2 relative z-3">
            <div className="h-9 w-40 bg-light-alpha shadow-xs shadow-black/5 rounded-sm flex justify-start px-5 items-center text-dark-base/80 text-sm">
                Add Questions
            </div>

            <div className="h-9 w-40 bg-[#BDBBFF] border border-dashed border-dark-base rounded-sm" />

            <motion.div
                id="launch-card"
                className="absolute top-11 right-0 h-9 w-40 bg-dark-faded rounded-sm flex justify-between px-5 items-center text-light-base/80 text-sm ring-1 ring-alpha shadow-md shadow-alpha/50"
                style={{ transformOrigin: 'center center' }}
            >
                Launch game
                <span ref={circleRef} style={{ display: 'flex', alignItems: 'center' }}>
                    <LuCircle className="size-3 text-alpha" style={{ strokeWidth: 2 }} />
                </span>
            </motion.div>

            <motion.div
                id="press-ring"
                className="absolute rounded-full border border-alpha pointer-events-none"
                style={{ top: 53, right: 14, width: 14, height: 14, opacity: 0, zIndex: 6 }}
            />

            <motion.img
                id="cursor"
                src="/images/landing/hand.svg"
                className="size-6 absolute -rotate-8 z-10 pointer-events-none"
                style={{ top: 0, left: 0, opacity: 0 }}
                alt="hand cursor"
            />

            <div className="h-9 w-40 bg-dark-faded shadow-xs shadow-black/20 rounded-sm flex justify-start px-5 items-center text-light-base/80 text-sm">
                Select Interactions
            </div>
            <div className="h-9 w-40 bg-dark-faded shadow-xs shadow-black/20 rounded-sm flex justify-start px-5 items-center text-light-base/80 text-sm">
                Define prize pool
            </div>
        </div>
    );
}
