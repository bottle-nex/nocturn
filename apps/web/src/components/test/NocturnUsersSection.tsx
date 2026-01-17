'use client';
import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import UserTypeCard from './UserTypeCard';
import { IoCreateSharp } from 'react-icons/io5';
import { AiOutlineLogin } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import SigninModal from '../utility/SigninModal';
import { useJoinQuizStore } from '@/store/home/useJoinQuizStore';

gsap.registerPlugin(ScrollTrigger);

export default function NocturnUsersSection() {
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

            const enterDuration = 8;
            const holdAfterEnter = 10;
            const stackDuration = 4;
            const perCardGap = 15;
            const longHoldAfterAll = 1;
            const exitDuration = 1;
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
            className="relative w-screen bg-black"
            style={{ height: '1500vh' }}
        >
            <div ref={pinRef} className="h-screen w-full overflow-hidden">
                <div className="absolute inset-0 bg-nlighter" />

                <div className="relative z-10 h-full w-full flex">
                    <div className="w-[50%] h-full flex items-center justify-center">
                        <div className="text-black text-6xl font-bold">Choose your role</div>
                    </div>

                    <div className="relative w-[50%] h-full">
                        <div
                            ref={(el) => {
                                if (el) {
                                    cardsRef.current[0] = el;
                                }
                            }}
                            className="absolute inset-0 cursor-pointer"
                        >
                            <UserTypeCard
                                userType="HOST"
                                userRole="Create Quiz"
                                userHeading="CREATOR"
                                miniDesc="Put up the stakes, Call the shots"
                                detailedDesc="As a Creator, you design and run the entire quiz experience. You create questions, control the flow of the game, and stake Solana to put real value behind your quiz. By setting the rules and rewards, you turn knowledge into a high-stakes live event where you lead the action and challenge players to compete."
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
                            <UserTypeCard
                                userType="SPECTATOR"
                                userRole="Join as spectator"
                                userHeading="VIEWER"
                                miniDesc="Sit back, jump in when needed"
                                detailedDesc="As a Viewer, you watch the quiz unfold live and stay engaged without directly competing. You can follow the action in real time and step in during lifelines to help participants when they need it, making you part of the experience while staying risk-free."
                                bgClassname="bg-[#0881FE] text-white"
                                textClassname="text-white"
                                border="border-white"
                                buttonTitle="JOIN AS VIEWER"
                                buttonIcon={<AiOutlineLogin className="size-6" />}
                                buttonClassName="bg-transparent hover:bg-white hover:text-[#2AA0FE] text-white border-white"
                                onClick={toggleJoinInput}
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
                            <UserTypeCard
                                userType="PARTICIPANT"
                                userRole="Join as participant"
                                userHeading="PLAYER"
                                miniDesc="Outthink everyone, get paid"
                                detailedDesc="As a Player, you compete live against others by answering questions under time pressure. You rely on speed, accuracy, and strategy to outthink opponents and advance through the quiz, playing for rewards and the thrill of winning."
                                bgClassname="bg-[#EFC11D] text-black"
                                textClassname="text-black"
                                border="border-black"
                                buttonTitle="PLAY NOW"
                                buttonIcon={<AiOutlineLogin className="size-6" />}
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
