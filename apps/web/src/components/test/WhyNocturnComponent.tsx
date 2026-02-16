'use client';
import { useRef, useEffect, useState } from 'react';
import { SlGraph } from 'react-icons/sl';
import SectionHeading from '../ui/SectionHeading';
import WhyNocturnCard1 from './WhyNocturnCards/WhyNocturnCard1';
import WhyNocturnCard2 from './WhyNocturnCards/WhyNocturnCard2';
import WhyNocturnCard3 from './WhyNocturnCards/WhyNocturnCard3';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WhyNocturnComponent() {
    const containerRef = useRef<HTMLDivElement>(null);
    const pinContainerRef = useRef<HTMLDivElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);
    const card3Ref = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const pinContainer = pinContainerRef.current;
        const card1 = card1Ref.current;
        const card2 = card2Ref.current;
        const card3 = card3Ref.current;

        if (!container || !pinContainer || !card1 || !card2 || !card3) return;

        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

        const ctx = gsap.context(() => {
            gsap.set(card1, { yPercent: 0, scale: 1 });
            gsap.set(card2, { yPercent: 100, scale: 0.95 });
            gsap.set(card3, { yPercent: 100, scale: 0.9 });

            const masterTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: pinContainer,
                    scrub: 1.5,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            masterTimeline.to(
                card2,
                {
                    yPercent: 0,
                    scale: 1,
                    duration: 1.2,
                    ease: 'power2.out',
                },
                0,
            );

            masterTimeline.to(
                card1,
                {
                    scale: 0.95,
                    duration: 1.2,
                    ease: 'power2.out',
                },
                0,
            );

            masterTimeline.to(
                card3,
                {
                    yPercent: 0,
                    scale: 1,
                    duration: 1.2,
                    ease: 'power2.out',
                },
                1.5,
            );

            masterTimeline.to(
                card2,
                {
                    scale: 0.95,
                    duration: 1.2,
                    ease: 'power2.out',
                },
                1.5,
            );

            masterTimeline.to(
                card1,
                {
                    scale: 0.9,
                    duration: 1.2,
                    ease: 'power2.out',
                },
                1.5,
            );
        }, containerRef);

        return () => {
            ctx.revert();
        };
    }, [isMobile]);

    return (
        <div ref={containerRef} className="relative w-full bg-light-alpha">
            <div
                ref={pinContainerRef}
                className="h-screen w-full flex flex-col items-center justify-between relative"
            >
                <div className="pt-12 md:pt-20 px-4 z-10">
                    <SectionHeading
                        title="Quizzing made simpler"
                        ticker="Easy Quizzing"
                        icon={<SlGraph className="size-3.5" />}
                        description="Learning doesn't have to be hard. With jitter, learning becomes easy, and on top of that you can make money too. Can't ask for more, can you.."
                    />
                </div>

                <div className="w-full flex items-center justify-around px-12">
                    <WhyNocturnCard1 />
                    <WhyNocturnCard2 />
                    <WhyNocturnCard3 />
                </div>
            </div>
        </div>
    );
}
