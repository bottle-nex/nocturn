'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GoSmiley, GoStarFill, GoTrophy } from 'react-icons/go';

export default function LandingRightSection() {
    return (
        <div className="lg:col-span-5 relative">
            <motion.div
                initial={{ rotate: 5, y: 100, opacity: 0 }}
                animate={{ rotate: -2, y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="relative bg-white border-[6px] border-black p-6 rounded-[2.5rem] shadow-[20px_20px_0px_rgba(246,196,83,1)]"
            >
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-zinc-50 p-4 border-4 border-black rounded-2xl">
                        <span className="font-black text-xl">Question #12</span>
                        <div className="bg-alpha text-white px-3 py-1 font-black rounded-full text-sm">
                            0:15s
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-center">
                        Which planet is known as the “Red Planet”?
                    </h3>

                    {['Venus', 'Mars', 'Jupiter'].map((choice, i) => (
                        <div
                            key={choice}
                            className={cn(
                                'p-4 border-4 border-black rounded-xl font-black text-lg flex justify-between items-center',
                                i === 1
                                    ? 'bg-alpha text-white shadow-[4px_4px_0px_#000]'
                                    : 'bg-white',
                            )}
                        >
                            {choice}
                            {i === 1 && <GoStarFill/>}
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, -20, 0], rotate: [12, 15, 12] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-12 -right-8 bg-white border-4 border-black p-4 rounded-full shadow-[8px_8px_0px_rgba(232,69,69,1)]"
            >
                <GoTrophy size={40} className="text-eta" />
            </motion.div>

            <motion.div
                animate={{ x: [0, 15, 0], rotate: [-8, -12, -8] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-10 -left-20 bg-black text-white px-6 py-4 rounded-2xl border-4 border-black shadow-[8px_8px_0px_rgba(93,183,222,1)]"
            >
                <div className="flex items-center gap-3">
                    <GoSmiley className="text-2xl text-eta" />
                    <span className="font-black italic">STREAK: 15</span>
                </div>
            </motion.div>
        </div>
    );
}
