'use client';
import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FeatureCard from './FeatureCard';
import { IoCreateSharp } from 'react-icons/io5';
import { MdLiveTv } from 'react-icons/md';
import { FaTrophy } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import SigninModal from '../utility/SigninModal';
import { useJoinQuizStore } from '@/store/home/useJoinQuizStore';

gsap.registerPlugin(ScrollTrigger);

export default function FeaturesShowcase() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const pinRef = useRef<HTMLDivElement | null>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { toggleJoinInput } = useJoinQuizStore();
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

    function handleCreateQuizClick() {
        if (!session || !session.user.token) {
            setShowLoginModal(true);
            return;
        }
        router.push('/home');
    }

    useLayoutEffect(() => {
        if (!sectionRef.current || !pinRef.current) return;

        const ctx = gsap.context(() => {
            const total = cardsRef.current.length;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: '+=1500%',
                    pin: pinRef.current,
                    pinSpacing: true,
                    scrub: 4,
                },
            });

            const enterDuration = 5;
            const holdAfterEnter = 8;
            const stackDuration = 4;
            const perCardGap = 10;
            const longHoldAfterAll = 0.1;
            const exitDuration = 0.1;
            const stackOffsetX = -50;

            cardsRef.current.forEach((card, index) => {
                const start = index * perCardGap;
                const depthIndex = total - 1 - index;

                gsap.set(card, { zIndex: index + 1 });

                tl.fromTo(
                    card,
                    { x: 200, y: 900, scale: 0.9, opacity: 1 },
                    { x: 0, y: 0, scale: 1, duration: enterDuration, ease: 'power2.out' },
                    start,
                );

                tl.to({}, { duration: holdAfterEnter }, start + enterDuration);

                tl.to(
                    card,
                    { x: depthIndex * stackOffsetX, duration: stackDuration, ease: 'power2.out' },
                    start + enterDuration + holdAfterEnter,
                );
            });

            tl.to({}, { duration: longHoldAfterAll });

            cardsRef.current.forEach((card) => {
                tl.to(
                    card,
                    { x: window.innerWidth + 300, duration: exitDuration, ease: 'power2.in' },
                    '+=0.4',
                );
            });

            cardsRef.current.forEach((card, index) => {
                const depthIndex = total - 1 - index;
                if (depthIndex === 0) return;

                const baseX = depthIndex * stackOffsetX;
                const hoverX = baseX - 40;

                const onEnter = () => {
                    gsap.to(card, { x: hoverX, duration: 0.35, ease: 'power3.out' });
                };

                const onLeave = () => {
                    gsap.to(card, { x: baseX, duration: 0.35, ease: 'power3.out' });
                };

                card.addEventListener('mouseenter', onEnter);
                card.addEventListener('mouseleave', onLeave);

                ScrollTrigger.addEventListener('refreshInit', () => {
                    card.removeEventListener('mouseenter', onEnter);
                    card.removeEventListener('mouseleave', onLeave);
                });
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-screen bg-dark-alpha"
            style={{ height: '1500vh' }}
        >
            <div ref={pinRef} className="h-screen w-full overflow-hidden">
                <div className="absolute inset-0" />

                <div className="relative z-10 h-full w-full flex">
                    <div className="w-[55%] h-full flex items-center justify-center">
                        <div className="text-light-alpha text-6xl font-bold">What you can do</div>
                    </div>

                    <div className="relative w-[45%] h-full">
                        <div
                            ref={(el) => {
                                if (el) {
                                    cardsRef.current[0] = el;
                                }
                            }}
                            className="absolute inset-0 cursor-pointer"
                        >
                            <FeatureCard
                                featureTag="FEATURE 01"
                                featureAction="Start creating"
                                featureHeading="CREATE"
                                tagline="Cook up chaos, together"
                                description="Build quizzes solo or gang up with your crew. Real-time collab means no more back-and-forth BS—just pure creative flow. Drag, drop, done."
                                bgClassname="bg-[#F54D25] text-white"
                                textClassname="text-white"
                                border="border-white"
                                buttonTitle="START CREATING"
                                buttonIcon={<IoCreateSharp className="size-6" />}
                                buttonClassName="bg-transparent hover:bg-white hover:text-[#FB4914] text-white border-white"
                                onClick={handleCreateQuizClick}
                            />
                        </div>

                        <div
                            ref={(el) => {
                                if (el) {
                                    cardsRef.current[1] = el;
                                }
                            }}
                            className="absolute inset-0 cursor-pointer"
                        >
                            <FeatureCard
                                featureTag="FEATURE 02"
                                featureAction="Go live"
                                featureHeading="HOST"
                                tagline="Call the shots, own the room"
                                description="Go live, lock in the stakes, and watch the players sweat. You control the pace, the questions, and the prize pool. It's your game, your rules."
                                bgClassname="bg-[#0881FE] text-white"
                                textClassname="text-white"
                                border="border-white"
                                buttonTitle="HOST A QUIZ"
                                buttonIcon={<MdLiveTv className="size-6" />}
                                buttonClassName="bg-transparent hover:bg-white hover:text-[#2AA0FE] text-white border-white"
                                onClick={handleCreateQuizClick}
                            />
                        </div>

                        <div
                            ref={(el) => {
                                if (el) {
                                    cardsRef.current[2] = el;
                                }
                            }}
                            className="absolute inset-0 cursor-pointer"
                        >
                            <FeatureCard
                                featureTag="FEATURE 03"
                                featureAction="Join & win"
                                featureHeading="WIN"
                                tagline="Flex your brain, stack your SOL"
                                description="Answer fast, answer right, get paid. Real Solana rewards for the sharpest minds. No fluff, no luck—just skill and speed."
                                bgClassname="bg-[#EFC11D] text-black"
                                textClassname="text-black"
                                border="border-black"
                                buttonTitle="PLAY NOW"
                                buttonIcon={<FaTrophy className="size-6" />}
                                buttonClassName="bg-transparent border-black hover:bg-black hover:text-[#FFD731] text-black"
                                onClick={toggleJoinInput}
                            />
                        </div>
                    </div>
                </div>

                {showLoginModal && <SigninModal />}
            </div>
        </section>
    );
}
