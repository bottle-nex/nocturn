"use client"
import { JSX } from "react";
import { Button } from "../ui/button";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useMotionValue } from "framer-motion";

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
        <section onMouseMove={handleMouseMove} className="w-full z-10 relative h-screen flex items-center justify-center overflow-hidden">
            <div className="flex flex-col items-center px-6 text-center -mt-20 relative z-10">
                <h1 className="text-4xl md:text-8xl font-semibold animated-gradient-text text-nowrap">Unlock premium quizzes</h1>
                <h1 className="text-4xl md:text-8xl font-semibold animated-gradient-text text-nowrap">& exclusive experiences</h1>
                <p className="block text-center mt-8 max-w-5xl">Elevate your quiz game with Nocturn Premium. Get access to AI-powered quiz generation, unlimited participants, advanced analytics, and Solana prize pools to make every quiz unforgettable.</p>
                <section className="mt-8 flex items-center justify-center">
                    <Button className="px-8 py-4.75 bg-dark-base hover:bg-dark-alpha dark:bg-light-base dark:hover:bg-light-alpha font-medium rounded-xl shadow-[inset_0_1.5px_0_rgba(255,255,255,0.15)] transition-shadow cursor-pointer flex items-center gap-3 border border-dark-base">
                        Explore premium
                    </Button>
                    <Button className="px-8 py-5 bg-white hover:bg-light-alpha dark:bg-dark-base dark:hover:bg-dark-alpha text-dark-base dark:text-light-base font-medium rounded-xl transition-shadow cursor-pointer flex items-center gap-3 ml-4">
                        Start creating quiz
                        <MdKeyboardArrowRight className="text-neutral-500 text-xl" />
                    </Button>
                </section>
            </div>
        </section>
    )
}