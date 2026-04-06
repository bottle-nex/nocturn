'use client';
import { motion } from 'framer-motion';
import { FiBarChart2, FiEye, FiMaximize2, FiRefreshCcw } from 'react-icons/fi';

export default function SpectatorUserCard() {
    return (
        <div className="relative w-full h-full bg-[#F9F9F9] rounded-2xl overflow-hidden border border-neutral-200 flex items-center justify-center group">
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)`,
                    backgroundSize: '4px 4px',
                }}
            />

            <div className="grid grid-cols-2 gap-4 w-85 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <FiEye className="text-neutral-400 size-3" />
                        <FiMaximize2 className="text-neutral-200 size-3 group-hover:text-neutral-400 transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-5 w-12 bg-neutral-900 rounded-md flex items-center justify-center">
                            <span className="text-[10px] text-white font-mono tracking-tighter">
                                3.2k
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 rounded-full" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                        <FiBarChart2 className="text-blue-500 size-3" />
                        <div className="h-3 w-8 bg-neutral-50 border border-neutral-100 rounded text-[8px] flex items-center justify-center text-neutral-400">
                            CHART
                        </div>
                    </div>
                    <div className="flex items-end gap-1 h-8">
                        <div className="w-full bg-blue-100 h-[40%] rounded-sm" />
                        <div className="w-full bg-blue-200 h-[60%] rounded-sm" />
                        <div className="w-full bg-blue-500 h-[90%] rounded-sm" />
                        <div className="w-full bg-blue-300 h-[50%] rounded-sm" />
                    </div>
                </motion.div>

                <div className="absolute bottom-2 right-[45%] bg-white border border-neutral-200 p-2 rounded-full cursor-pointer hover:rotate-180 transition-transform duration-500">
                    <FiRefreshCcw className="size-3 text-neutral-500" />
                </div>
            </div>

            <div className="absolute top-4 right-4">
                <div className="size-6 border-t-2 border-r-2 border-neutral-100" />
            </div>
        </div>
    );
}
