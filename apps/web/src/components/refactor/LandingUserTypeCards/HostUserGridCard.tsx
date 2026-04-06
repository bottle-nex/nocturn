import { motion } from 'framer-motion';
import { FiPlus, FiSettings } from 'react-icons/fi';
import Image from 'next/image';

export default function HostUserGridCard() {
    return (
        <div className="relative w-full h-full bg-[#FAFAFA] rounded-2xl overflow-hidden border border-neutral-200 flex items-center justify-center group">
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                }}
            />
            <div className="absolute inset-0 border-px border-neutral-100 m-8 rounded-xl border-dashed" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="relative bg-white border border-neutral-200 rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 w-70"
            >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-50">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-neutral-100 overflow-hidden relative border border-neutral-200">
                            <Image
                                src="/images/founders/piyush.jpeg"
                                alt="Host"
                                fill
                                className="object-cover grayscale"
                                unoptimized
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="h-2 w-16 bg-neutral-200 rounded-full" />
                            <div className="h-1.5 w-10 bg-neutral-100 rounded-full" />
                        </div>
                    </div>
                    <FiSettings className="text-neutral-300 size-3.5" />
                </div>

                <div className="space-y-3 mb-4">
                    <div className="h-8 w-full bg-neutral-50 rounded-lg border border-neutral-100 flex items-center px-3 justify-between">
                        <div className="h-2 w-24 bg-neutral-200 rounded-full" />
                        <div className="size-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                </div>

                <button className="w-full h-9 bg-black text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all">
                    Launch Quiz
                </button>

                <motion.div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-neutral-200 p-2 rounded-lg shadow-xl">
                    <FiPlus className="size-3 text-neutral-600" />
                </motion.div>
            </motion.div>

            {/* <div className="absolute bottom-6 right-8 opacity-20">
                <FiGrid className="size-12 text-neutral-300" />
            </div> */}
        </div>
    );
}
