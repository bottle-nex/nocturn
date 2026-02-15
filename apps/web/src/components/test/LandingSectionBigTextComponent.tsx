'use client';

import { cn } from '@/lib/utils';
import AnimatedSvg from '../svgs/all-svgs';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function LandingSectionBigTextComponent() {
    const rootRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!rootRef.current) return;

        const ctx = gsap.context(() => {
            const master = gsap.timeline({ delay: 0.2 });

            const lines = rootRef.current!.querySelectorAll('.headline-line');

            lines.forEach((line, lineIndex) => {
                const text = line.textContent || '';
                line.innerHTML = '';

                [...text].forEach((char) => {
                    const span = document.createElement('span');
                    span.className = 'char inline-block';
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    span.style.transformOrigin = 'center bottom';
                    line.appendChild(span);
                });

                const chars = line.querySelectorAll('.char');

                // LINE 1 — cinematic slide
                if (lineIndex === 0) {
                    gsap.set(chars, {
                        x: -100,
                        opacity: 0,
                        rotationY: -90,
                    });

                    master.to(
                        chars,
                        {
                            x: 0,
                            opacity: 1,
                            rotationY: 0,
                            duration: 1.2,
                            ease: 'expo.out',
                            stagger: { each: 0.03 },
                        },
                        0.4,
                    );
                }

                // LINE 2 — flip in
                else if (lineIndex === 1) {
                    gsap.set(chars, {
                        rotationX: 90,
                        y: 50,
                        opacity: 0,
                        transformPerspective: 1000,
                    });

                    master.to(
                        chars,
                        {
                            rotationX: 0,
                            y: 0,
                            opacity: 1,
                            duration: 1,
                            ease: 'back.out(1.2)',
                            stagger: { each: 0.025, from: 'random' },
                        },
                        0.6,
                    );
                }

                // LINE 3 — elastic pop
                else {
                    gsap.set(chars, {
                        scale: 0,
                        y: 100,
                        opacity: 0,
                    });

                    master.to(
                        chars,
                        {
                            scale: 1,
                            y: 0,
                            opacity: 1,
                            duration: 1.1,
                            ease: 'elastic.out(1, 0.6)',
                            stagger: { each: 0.02, from: 'center' },
                        },
                        0.8,
                    );
                }
            });

            // idle floating animation
            const allChars = rootRef.current!.querySelectorAll('.char');
            const randomChars = gsap.utils.shuffle([...allChars]).slice(0, 5);

            gsap.timeline({ repeat: -1, repeatDelay: 2 })
                .to(randomChars, {
                    y: -8,
                    duration: 0.3,
                    ease: 'power2.out',
                    stagger: 0.1,
                })
                .to(randomChars, {
                    y: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                    stagger: 0.1,
                });
        }, rootRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={rootRef}
            style={{ fontWeight: 900 }}
            className={cn(
                'flex flex-col text-[8.8rem] leading-[0.95] text-dark-base tracking-tight font-sans pt-8 relative',
            )}
        >
            <div className="headline-line">RISK & REWARD</div>
            <div className="headline-line">TEST YOUR</div>
            <div className="headline-line relative overflow-visible">
                <span className="headline-text inline-block relative">
                    KNOWLEDGE
                    <div className="absolute left-full ml-4 top-0">
                        <AnimatedSvg />
                    </div>
                </span>
            </div>
        </div>
    );
}
