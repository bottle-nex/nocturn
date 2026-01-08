'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import Image from 'next/image';

export default function FloatingStickers() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20 });

    // depth transforms (REACTIVE)
    // const xSmall = useTransform(smoothX, (v) => v * 0.7);
    // const ySmall = useTransform(smoothY, (v) => v * 0.7);

    const xMedium = useTransform(smoothX, (v) => v * 1);
    const yMedium = useTransform(smoothY, (v) => v * 1);

    // const xLarge = useTransform(smoothX, (v) => v * 1.4);
    // const yLarge = useTransform(smoothY, (v) => v * 1.4);

    const xReverse = useTransform(smoothX, (v) => v * -1);
    const yReverse = useTransform(smoothY, (v) => v * -1);

    // const xReverseSmall = useTransform(smoothX, (v) => v * -0.7);
    // const yReverseSmall = useTransform(smoothY, (v) => v * -0.7);

    // const xReverseLarge = useTransform(smoothX, (v) => v * -1.2);
    // const yReverseLarge = useTransform(smoothY, (v) => v * -1.2);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX - window.innerWidth / 2) / 40;
            const y = (e.clientY - window.innerHeight / 2) / 40;

            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <>
            {/* right side */}

            {/* <motion.div
            className="w-36 h-36 absolute top-24 right-24 -rotate-12 pointer-events-none"
            style={{ x: xSmall, y: ySmall }}
        >
            <Image src="/images/landing/frost.png" alt="" fill unoptimized />
        </motion.div> */}

            <motion.div
                className="w-44 h-44 absolute top-[45%] right-40 -translate-y-1/2 pointer-events-none"
                style={{ x: xMedium, y: yMedium }}
            >
                <Image src="/images/landing/questionmark.png" alt="" fill unoptimized />
            </motion.div>

            {/* <motion.div
            className="w-32 h-32 absolute bottom-32 right-40 rotate-12 pointer-events-none"
            style={{ x: xSmall, y: ySmall }}
        >
            <Image src="/images/landing/smile.png" alt="" fill unoptimized />
        </motion.div> */}

            {/* left side */}

            {/* <motion.div
            className="w-30 h-20 absolute top-28 left-24 -rotate-12 pointer-events-none"
            style={{ x: xReverseSmall, y: yReverseSmall }}
        >
            <Image src="/images/landing/cloud.png" alt="" fill unoptimized />
        </motion.div> */}

            <motion.div
                className="w-44 h-44 absolute top-[45%] left-40 -translate-y-1/2 -rotate-45 pointer-events-none"
                style={{ x: xReverse, y: yReverse }}
            >
                <Image src="/images/landing/hashtag.png" alt="" fill unoptimized />
            </motion.div>

            {/* <motion.div
            className="w-50 h-44 absolute top-[45%] left-40 pointer-events-none -rotate-45"
            style={{ x: xReverseSmall, y: yReverseSmall }}
        >
            <Image src="/images/landing/thumbsup.png" alt="" fill unoptimized />
        </motion.div> */}
        </>
    );
}
