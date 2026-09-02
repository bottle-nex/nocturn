import { Dispatch, SetStateAction } from 'react';
import { LeftRenderType } from '../LandingUsdcSection';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

export function LeftCoinContent({
    setLeftRenderType,
}: {
    setLeftRenderType: Dispatch<SetStateAction<LeftRenderType>>;
}) {
    return (
        <main className="w-full h-full relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 rounded-full bg-white/[0.07] blur-[80px]" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    className="w-52 h-52 rounded-full border border-white/12"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/60" />
                </motion.div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    className="w-64 h-64 rounded-full border border-dashed border-white/6"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
            </div>

            {[
                { x: '20%', y: '25%', size: 3, delay: 0 },
                { x: '75%', y: '20%', size: 2, delay: 1.2 },
                { x: '15%', y: '70%', size: 2.5, delay: 0.6 },
                { x: '80%', y: '65%', size: 2, delay: 1.8 },
                { x: '65%', y: '82%', size: 3, delay: 0.3 },
            ].map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/40"
                    style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
                    animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3] }}
                    transition={{
                        duration: 3,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}

            <motion.div
                className="absolute top-8 left-8"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/50 mb-1">
                    Now accepting
                </p>
                <p className="text-lg font-semibold text-white">USDC Support</p>
            </motion.div>

            <div className="w-full h-full flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="relative"
                    >
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full bg-black/20 blur-md" />
                        <Image
                            src="/icons/usdc.png"
                            alt="USDC Coin"
                            width={140}
                            height={140}
                            className="drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                        />
                    </motion.div>
                </motion.div>
            </div>

            <motion.div
                className="absolute bottom-8 left-8 right-8 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            />
            <div
                onClick={() => setLeftRenderType(LeftRenderType.INPUTS)}
                className="absolute bottom-8 left-8 right-8 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center -rotate-45 cursor-pointer"
            >
                <ChevronRight />
            </div>
        </main>
    );
}
