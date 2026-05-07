'use client';

import { JSX } from 'react';
import { motion } from 'framer-motion';
import PerspectiveCard from '@/components/utility/PerspectiveCard';

export default function RipplingPillStack(): JSX.Element {
    return (
        <PerspectiveCard className="w-full rounded-xl bg-[#FF8130] relative overflow-hidden flex flex-col h-126">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="flex flex-col flex-1"
            >
                {/* Top inner section — single circle rising from its bottom */}
                <section className="relative flex-1">
                    <motion.div
                        variants={{
                            hidden: { y: '100%', opacity: 0 },
                            visible: { y: 0, opacity: 1 },
                        }}
                        transition={{
                            duration: 1.8,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.3,
                            opacity: { duration: 0, delay: 0.4 },
                        }}
                        className="absolute -bottom-92 left-[calc(50%-7rem)] h-112 w-56"
                    >
                        <motion.div
                            animate={{ y: [0, 0, -24, 0, 0] }}
                            transition={{
                                duration: 5,
                                times: [0, 0.12, 0.25, 0.38, 1],
                                ease: [0.45, 0, 0.55, 1],
                                repeat: Infinity,
                            }}
                            className="h-full w-full rounded-full"
                            style={{
                                background:
                                    'linear-gradient(to right, #FFC38B 0 50%, #FF3200 50% 100%)',
                            }}
                        />
                    </motion.div>
                </section>
                {/* Middle inner section — two circles rising from its bottom */}
                <section className="relative flex-1">
                    <motion.div
                        variants={{
                            hidden: { y: '100%' },
                            visible: { y: 0 },
                        }}
                        transition={{
                            duration: 1.4,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.2,
                        }}
                        className="absolute -bottom-80 left-[calc(50%-14rem)] h-112 w-56"
                    >
                        <motion.div
                            animate={{ y: [0, 0, -24, 0, 0] }}
                            transition={{
                                duration: 5,
                                times: [0, 0.06, 0.19, 0.32, 1],
                                ease: [0.45, 0, 0.55, 1],
                                repeat: Infinity,
                            }}
                            className="h-full w-full rounded-full"
                            style={{
                                background:
                                    'linear-gradient(to right, #FFC38B 0 50%, #FF3200 50% 100%)',
                            }}
                        />
                    </motion.div>
                    <motion.div
                        variants={{
                            hidden: { y: '100%' },
                            visible: { y: 0 },
                        }}
                        transition={{
                            duration: 1.6,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.2,
                        }}
                        className="absolute -bottom-80 left-[50%] h-112 w-56"
                    >
                        <motion.div
                            animate={{ y: [0, 0, -24, 0, 0] }}
                            transition={{
                                duration: 5,
                                times: [0, 0.06, 0.19, 0.32, 1],
                                ease: [0.45, 0, 0.55, 1],
                                repeat: Infinity,
                            }}
                            className="h-full w-full rounded-full"
                            style={{
                                background:
                                    'linear-gradient(to right, #FFC38B 0 50%, #FF3200 50% 100%)',
                            }}
                        />
                    </motion.div>
                </section>
                {/* Bottom inner section — three circles rising from its bottom */}
                <section className="relative flex-1">
                    <motion.div
                        variants={{
                            hidden: { y: '100%' },
                            visible: { y: 0 },
                        }}
                        transition={{
                            duration: 1.5,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.2,
                        }}
                        className="absolute -bottom-72 left-[calc(50%-21rem)] h-112 w-56"
                    >
                        <motion.div
                            animate={{ y: [0, -24, 0, 0] }}
                            transition={{
                                duration: 5,
                                times: [0, 0.13, 0.26, 1],
                                ease: [0.45, 0, 0.55, 1],
                                repeat: Infinity,
                            }}
                            className="h-full w-full rounded-full"
                            style={{
                                background:
                                    'linear-gradient(to right, #FFC38B 50%, #FF3200 50% 100%)',
                            }}
                        />
                    </motion.div>
                    <motion.div
                        variants={{
                            hidden: { y: '100%' },
                            visible: { y: 0 },
                        }}
                        transition={{
                            duration: 1.7,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.2,
                        }}
                        className="absolute -bottom-72 left-[calc(50%-7rem)] h-112 w-56"
                    >
                        <motion.div
                            animate={{ y: [0, -24, 0, 0] }}
                            transition={{
                                duration: 5,
                                times: [0, 0.13, 0.26, 1],
                                ease: [0.45, 0, 0.55, 1],
                                repeat: Infinity,
                            }}
                            className="h-full w-full rounded-full"
                            style={{
                                background:
                                    'linear-gradient(to right, #FFC38B 0 50%, #FF3200 50% 100%)',
                            }}
                        />
                    </motion.div>
                    <motion.div
                        variants={{
                            hidden: { y: '100%' },
                            visible: { y: 0 },
                        }}
                        transition={{
                            duration: 1.9,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.2,
                        }}
                        className="absolute -bottom-72 left-[calc(50%+7rem)] h-112 w-56"
                    >
                        <motion.div
                            animate={{ y: [0, -24, 0, 0] }}
                            transition={{
                                duration: 5,
                                times: [0, 0.13, 0.26, 1],
                                ease: [0.45, 0, 0.55, 1],
                                repeat: Infinity,
                            }}
                            className="h-full w-full rounded-full"
                            style={{
                                background:
                                    'linear-gradient(to right, #FFC38B 0 50%, #FF3200 50% 100%)',
                            }}
                        />
                    </motion.div>
                </section>
            </motion.div>
        </PerspectiveCard>
    );
}
