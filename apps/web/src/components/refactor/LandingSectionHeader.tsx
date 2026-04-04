'use client';
import { JSX } from 'react';
import { motion } from 'framer-motion';

interface LandingSectionHeaderProps {
    heading: string;
    subheading: string;
}

export default function LandingSectionHeader({
    heading,
    subheading,
}: LandingSectionHeaderProps): JSX.Element {
    const words = heading.split(' ');
    const lastWordIndex = words.length - 1;
    const lastWordLength = words[lastWordIndex]?.length ?? 0;
    const headingDuration = lastWordIndex * 0.08 + lastWordLength * 0.03 + 0.4;

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-5xl text-dark-base/90 text-center font-semibold flex flex-wrap justify-center">
                {words.map((word, wi) => (
                    <span
                        key={wi}
                        className="inline-flex overflow-hidden mr-[0.3em] last:mr-0 text-dark-alpha"
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
                className="text-lg text-center text-dark-base/60 mt-3 max-w-180"
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
