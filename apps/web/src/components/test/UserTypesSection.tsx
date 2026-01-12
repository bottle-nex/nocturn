'use client';
import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import UserTypeCard from './UserTypeCard';
import { IoCreateSharp } from 'react-icons/io5';
import { AiOutlineLogin } from 'react-icons/ai';

gsap.registerPlugin(ScrollTrigger);

export default function UserTypeSection() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const pinRef = useRef<HTMLDivElement | null>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useLayoutEffect(() => {
        if (!sectionRef.current || !pinRef.current) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: '+=300%',
                    pin: pinRef.current,
                    pinSpacing: true,
                    scrub: true,
                },
            });

            const enter = 1;
            const hold = 0.01;
            const gap = 1;

            const stackOffsetX = -50;
            const stackScaleStep = 0;
            const total = cardsRef.current.length;

            cardsRef.current.forEach((card, index) => {
                const start = index * gap;
                const depthIndex = total - 1 - index;

                gsap.set(card, {
                    zIndex: index + 1,
                });

                tl.fromTo(
                    card,
                    { y: 300, opacity: 0, scale: 0.9 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: enter,
                        ease: 'power3.out',
                    },
                    start,
                );

                tl.to(card, {}, start + enter + hold);

                tl.set(card, { opacity: 1, y: 0 }, start + enter + hold);

                tl.to(
                    card,
                    {
                        x: depthIndex * stackOffsetX,
                        scale: 1 - depthIndex * stackScaleStep,
                        duration: 0.45,
                        ease: 'power2.out',
                    },
                    start + enter + hold,
                );
            });

            cardsRef.current.forEach((card, index) => {
                const depthIndex = total - 1 - index;
                if (depthIndex === 0) return;

                const baseX = depthIndex * stackOffsetX;
                const hoverX = baseX - 40;

                const onEnter = () => {
                    gsap.to(card, {
                        x: hoverX,
                        duration: 0.35,
                        ease: 'power3.out',
                    });
                };

                const onLeave = () => {
                    gsap.to(card, {
                        x: baseX,
                        duration: 0.35,
                        ease: 'power3.out',
                    });
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
            style={{ height: '300vh' }}
        >
            <div ref={pinRef} className="h-screen w-full overflow-hidden">
                <div className="absolute inset-0 bg-black" />

                <div className="relative z-10 h-full w-full flex">
                    <div className="w-[60%] h-full flex items-center justify-center">
                        <div className="text-white text-6xl font-bold">Choose your role</div>
                    </div>

                    <div className="relative w-[40%] h-full">
                        {cardData.map((card, index) => (
                            <div
                                key={index}
                                ref={(el) => {
                                    if (el) cardsRef.current[index] = el;
                                }}
                                className="absolute inset-0 cursor-pointer"
                            >
                                <UserTypeCard {...card} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

const cardData = [
    {
        userType: 'HOST',
        userRole: 'Create Quiz',
        userHeading: 'CREATOR',
        miniDesc: 'Put up the stakes, Call the shots',
        detailedDesc:
            'The host creates and runs the quiz by staking Solana, putting real value on the line. They decide the quiz format, rules, difficulty, and reward pool, shaping the entire experience. By hosting, they turn a simple quiz into a high-stakes challenge where skill, speed, and strategy truly matter.',
        bgClassname: 'bg-[#F54D25] text-white',
        textClassname: 'text-white',
        border: 'border-white',
        buttonTitle: 'START CREATING',
        buttonIcon: <IoCreateSharp className="size-6" />,
        buttonClassName: 'bg-transparent hover:bg-white hover:text-[#FB4914]',
    },
    {
        userType: 'SPECTATOR',
        userRole: 'Join as spectator',
        userHeading: 'VIEWER',
        miniDesc: 'Sit back, jump in when needed',
        detailedDesc:
            'Spectators are the live audience who watch the quiz unfold in real time. They aren’t just passive viewers, when lifelines are triggered, they can jump in to help participants make better choices. Their presence adds energy, interaction, and a community-driven feel to every game.',
        bgClassname: 'bg-[#0881FE] text-white',
        textClassname: 'text-white',
        border: 'border-white',
        buttonTitle: 'JOIN AS VIEWER',
        buttonIcon: <AiOutlineLogin className="size-6" />,
        buttonClassName: 'bg-transparent hover:bg-white hover:text-[#2AA0FE]',
    },
    {
        userType: 'PARTICIPANT',
        userRole: 'Join as participant',
        userHeading: 'PLAYER',
        miniDesc: 'Outthink everyone, get paid',
        detailedDesc:
            'Spectators are the live audience who watch the quiz unfold in real time. They aren’t just passive viewers, when lifelines are triggered, they can jump in to help participants make better choices. Their presence adds energy, interaction, and a community-driven feel to every game.',
        bgClassname: 'bg-[#EFC11D] text-black',
        textClassname: 'text-black',
        border: 'border-black',
        buttonTitle: 'PLAY NOW',
        buttonIcon: <AiOutlineLogin className="size-6" />,
        buttonClassName:
            'bg-transparent border-black hover:bg-black hover:text-[#FFD731] text-black',
    },
];
