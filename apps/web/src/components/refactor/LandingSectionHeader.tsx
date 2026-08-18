'use client';
import { JSX } from 'react';
import { motion } from 'framer-motion';

interface LandingSectionHeaderProps {
    heading: string;
    subheading: string;
    variant?: 'light' | 'dark';
}

export default function LandingSectionHeader({
    heading,
    subheading,
    variant = 'light',
}: LandingSectionHeaderProps): JSX.Element {
    const words = heading.split(' ');
    const lastWordIndex = words.length - 1;
    const lastWordLength = words[lastWordIndex]?.length ?? 0;
    const headingDuration = lastWordIndex * 0.08 + lastWordLength * 0.03 + 0.4;
    const isDark = variant === 'dark';

    return (
        <div className="flex flex-col items-center">
            <h1
                className={`text-4xl sm:text-5xl text-center font-semibold flex flex-wrap justify-center ${isDark ? 'text-light-base/90' : 'text-dark-base/90'}`}
            >
                {words.map((word, wi) => (
                    <span
                        key={wi}
                        className={`inline-block whitespace-nowrap overflow-hidden mr-[0.3em] last:mr-0 pb-2 -mb-2 px-1 -mx-1 ${isDark ? 'text-light-alpha' : 'text-dark-alpha'}`}
                    >
                        {word.split('').map((char, ci) => (
                            <motion.span
                                key={ci}
                                initial={{ y: '100%', opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true, margin: '-50px' }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.25, 0.46, 0.45, 0.94],
                                    delay: wi * 0.08 + ci * 0.03,
                                }}
                                className="inline-block"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </span>
                ))}
            </h1>
            <motion.p
                className={`text-base sm:text-lg text-center mt-3 max-w-180 ${isDark ? 'text-light-base/60' : 'text-dark-base/60'}`}
                initial={{ y: 12, opacity: 0, filter: 'blur(4px)' }}
                whileInView={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                    duration: 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: headingDuration - 0.5,
                }}
            >
                {subheading}
            </motion.p>
        </div>
    );
}
