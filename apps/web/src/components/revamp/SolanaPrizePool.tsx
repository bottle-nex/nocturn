'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function SolanaPrizePool() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'start center'],
    });

    const backgroundColor = useTransform(scrollYProgress, [0, 1], ['#ffffff', '#0c0c0c']);
    const textColor = useTransform(scrollYProgress, [0, 1], ['#0c0c0c', '#ffffff']);

    return (
        <motion.div ref={ref} style={{ backgroundColor }} className="w-full">
            <main className="w-full">
                <section className="max-w-7xl mx-auto grid grid-cols-2 py-32">
                    <motion.div style={{ color: textColor }} className="p-8 text-6xl">
                        Built for developers, by developers
                    </motion.div>
                    <motion.div
                        style={{ color: textColor }}
                        className="p-8 text-xl mx-auto max-w-[90%]"
                    >
                        Lemon Squeezy was born out of frustration with existing solutions on the
                        market. As beautiful as it looks, the platform is just as flexible with you,
                        the developer, in mind. We spend an unfathomable amount of time making the
                        platform a joy to work with.
                    </motion.div>
                </section>
                <section className="grid w-full grid-cols-2 h-full">
                    <div className="bg-[#f53d6b] h-160">hi</div>
                    <div className="bg-dark-alpha h-160"></div>
                </section>
                <section className="grid w-full grid-cols-2 h-full">
                    <div className="bg-dark-alpha h-160"></div>
                    <div className="bg-[#f53d6b] h-160">hi</div>
                </section>
            </main>
        </motion.div>
    );
}
