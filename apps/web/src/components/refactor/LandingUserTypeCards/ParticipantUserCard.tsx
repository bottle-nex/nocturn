'use client';
import { motion } from 'framer-motion';
import { FiCheck, FiMousePointer } from 'react-icons/fi';

export default function ParticipantUserCard() {
    return (
        <div className="relative w-full h-full bg-[#FDFDFD] rounded-2xl overflow-hidden border border-neutral-200 flex items-center justify-center group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-neutral-100" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1px] bg-neutral-100" />

            <div className="relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-neutral-200 p-5 rounded-xl shadow-lg w-64 z-10 relative"
                >
                    <div className="flex gap-1 mb-4">
                        <div className="size-1.5 bg-neutral-200 rounded-full" />
                        <div className="size-1.5 bg-neutral-200 rounded-full" />
                        <div className="size-1.5 bg-neutral-100 rounded-full" />
                    </div>

                    <div className="h-3 w-32 bg-neutral-900 rounded-full mb-6" />

                    <div className="space-y-2 relative">
                        <div className="h-10 w-full bg-neutral-50 rounded-lg border border-neutral-200 flex items-center px-4 justify-between">
                            <div className="h-2 w-20 bg-neutral-300 rounded-full" />
                            <FiCheck className="text-neutral-300 size-3" />
                        </div>
                        <div className="h-10 w-full bg-blue-50 rounded-lg border border-blue-200 flex items-center px-4 justify-between">
                            <div className="h-2 w-24 bg-blue-500 rounded-full" />
                            <div className="size-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <FiCheck className="text-white size-2" strokeWidth={4} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -right-4 bottom-2 z-20 text-neutral-800 drop-shadow-md"
                >
                    <FiMousePointer className="size-5 fill-current" />
                </motion.div>

                <div className="absolute inset-0 bg-neutral-50 border border-neutral-100 rounded-xl translate-x-3 translate-y-3 -z-10" />
            </div>
        </div>
    );
}
