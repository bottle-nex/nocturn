'use client';
import { JSX } from 'react';
import { useMotionValue } from 'framer-motion';
import LandingSectionLeftCard from '../test/LandingSectionCards/LandingSectionLeftCard';
import LandingSectionMidCard from '../test/LandingSectionCards/LandingSectionMidCard';
import LandingSectionRightCard from '../test/LandingSectionCards/LandingSectionRightCard';

export default function PremiumPageMain(): JSX.Element {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.05;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.05;
        mouseX.set(x);
        mouseY.set(y);
    }

    return (
        <section
            onMouseMove={handleMouseMove}
            className="w-full z-10 relative min-h-screen flex flex-col items-center justify-center"
        >
            <div className="w-full flex justify-center items-center mt-20 relative">
                <div className="flex items-center justify-center gap-8 flex-wrap ">
                    <LandingSectionLeftCard />
                    <LandingSectionMidCard />
                    <LandingSectionRightCard />
                </div>
            </div>
            <div className="h-100"></div>
        </section>
    );
}
