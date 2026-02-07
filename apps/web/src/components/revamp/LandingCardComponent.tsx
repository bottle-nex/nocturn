'use client';
import CloudBackground from './CloudBackground';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import UserType from './UserType';

export default function LandingCardComponent() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div className="w-screen h-screen flex flex-col relative items-center">
            <section className="flex flex-col items-center justify-center mt-36 gap-y-3 w-full max-w-7xl mx-auto">
                <div className="text-light-alpha text-8xl leading-[1.04] font-black w-full flex flex-col items-center">
                    <section className="flex items-center gap-x-3">
                        <span className="text-nowrap">Outthink the</span>
                        <motion.span
                            ref={ref}
                            initial={{
                                width: 0,
                            }}
                            animate={{
                                width: isInView ? '12rem' : 0,
                            }}
                            transition={{
                                delay: 0.5,
                                duration: 0.3,
                                ease: 'easeInOut',
                            }}
                            className="h-26 w-48 bg-dark-base rounded-full relative overflow-hidden"
                        >
                            <motion.img
                                transition={{ delay: 0.6, duration: 0.2, ease: 'easeOut' }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="object-contain absolute inset-0 w-full h-full"
                                alt="illus"
                                src={'/illustrations/avatar.png'}
                            />
                        </motion.span>
                        <span className="text-nowrap">Room.</span>
                    </section>
                    <section className="flex items-center gap-x-2 mt-3 relative">
                        <div
                            className="absolute -right-12 top-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400 z-0"
                            style={{
                                clipPath:
                                    'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                            }}
                        />
                        <span className="text-nowrap relative z-10">Take Prize Home</span>
                    </section>
                </div>
            </section>
            <UserType />
            <section className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <CloudBackground />
            </section>
        </div>
    );
}
