'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

export default function WhyNocturnCard2() {
    return (
        <div className="h-[65vh] w-full max-w-110 shadow-xs shadow-black/5 rounded-4xl bg-[#e1ff86] flex flex-col py-15 px-12 gap-y-2 relative">
            <AvatarWithName
                src="/images/landing/avatar1.png"
                name="Piyush"
                className="top-75 right-14 z-2"
            />

            <AvatarWithName
                src="/images/landing/avatar4.png"
                name="Rishi"
                className="top-84 right-16 z-2"
            />

            <AvatarWithName
                src="/images/landing/avatar3.png"
                name="Anjan"
                className="top-93 right-18 z-3"
            />

            <div className="bg-dark-base text-light-base w-fit px-2.5 text-base py-px rounded-xs">
                Collaborate Effortlessly
            </div>
            <div className="text-[#222d02] text-[15px] font-extralight tracking-wide">
                Turn quiz creation into a shared experience. Invite collaborators, brainstorm
                together, and watch the quiz evolve live, fast, interactive, and built as a team.
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-55 h-90 w-90">
                <Image
                    src={'/images/landing/painting.svg'}
                    alt="hi there"
                    width={700}
                    height={600}
                    unoptimized
                />
            </div>
        </div>
    );
}

function AvatarWithName({
    src,
    name,
    className,
}: {
    src: string;
    name: string;
    className?: string;
}) {
    const [hovered, setHovered] = useState<boolean>(false);

    return (
        <div
            className={`absolute ${className}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="relative h-10 w-10 rounded-full ring-1 ring-neutral-300 shadow-xs shadow-black/5 overflow-hidden">
                <Image src={src} alt={name} fill unoptimized className="object-cover" />
            </div>

            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ scale: 0.6, opacity: 0, y: 8, filter: 'blur(6px)' }}
                        animate={{ scale: [0.6, 1.1, 1], opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ scale: 0.6, opacity: 0, y: 8, filter: 'blur(6px)' }}
                        transition={{
                            duration: 0.35,
                            ease: 'easeOut',
                        }}
                        className="absolute -right-15 top-1/2 -translate-y-1/2 whitespace-nowrap
                       bg-black text-white text-xs px-2.5 py-1 rounded-md shadow-lg pointer-events-none"
                    >
                        {name}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
