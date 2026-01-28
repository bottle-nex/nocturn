'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import { useState } from 'react';

const PARTICLE_COUNT = 14;

interface HeartButtonData {
    liked: boolean;
    onToggle: (toggle: boolean) => void;
}

export default function HeartButton({ onToggle, liked }: HeartButtonData) {
    const [bursts, setBursts] = useState<number[]>([]);

    const handleClick = () => {
        const toggle = !liked;
        onToggle(toggle);

        if (toggle) {
            const id = Date.now();
            setBursts((prev) => [...prev, id]);
            setTimeout(() => {
                setBursts((prev) => prev.filter((b) => b !== id));
            }, 800);
        }
    };

    return (
        <div className="h-8 w-8 flex justify-center items-center rounded-full group cursor-pointer hover:bg-pink-500/40">
            <AnimatePresence>
                {bursts.map((id) =>
                    Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
                        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
                        const distance = 18 + Math.random() * 10;
                        const x = Math.cos(angle) * distance;
                        const y = Math.sin(angle) * distance;

                        const colors = [
                            'bg-cyan-400',
                            'bg-pink-400',
                            'bg-yellow-300',
                            'bg-lime-400',
                            'bg-orange-400',
                        ];
                        const randomColor = colors[Math.floor(Math.random() * colors.length)];
                        const randomSize = Math.random() < 0.5 ? 'h-1.5 w-1.5' : 'h-1 w-1';

                        return (
                            <motion.span
                                key={`${id}-${i}`}
                                initial={{ scale: 0.8, opacity: 1, x: 0, y: 0 }}
                                animate={{
                                    scale: 0,
                                    opacity: 0,
                                    x,
                                    y,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.7,
                                    ease: 'easeOut',
                                }}
                                className={`absolute ${randomSize} rounded-full z-100 ${randomColor}`}
                            />
                        );
                    }),
                )}
            </AnimatePresence>

            <motion.div
                onClick={handleClick}
                whileTap={{ scale: 0.8 }}
                animate={{
                    scale: liked ? [0.2, 1.25, 1] : 1,
                }}
                transition={{
                    duration: 0.45,
                    ease: 'easeOut',
                }}
                className="relative z-10"
            >
                {liked ? (
                    <GoHeartFill className="size-5 text-pink-500 pt-px" />
                ) : (
                    <GoHeart className="size-5 text-light-base group-hover:text-pink-500 transition-colors pt-px" />
                )}
            </motion.div>
        </div>
    );
}
