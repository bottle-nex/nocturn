'use client';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import { motion } from 'framer-motion';
import { HiOutlineRocketLaunch } from 'react-icons/hi2';

export default function HostUserGridCard() {
    return (
        <PerspectiveCard className="relative w-full h-80 bg-purple-300 rounded-l-2xl overflow-hidden flex items-center justify-center group shadow-sm">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="absolute top-12 left-12 right-12 h-70 bg-white rounded-t-xl overflow-hidden shadow-2xl"
            >
                <div className="w-full h-12 bg-[#1A1A1A] flex items-center px-4 gap-2">
                    {[
                        { color: 'bg-yellow-400', label: '▲' },
                        { color: 'bg-purple-400', label: '●' },
                        { color: 'bg-green-400', label: '■' },
                        { color: 'bg-blue-400', label: '★' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className={`size-7 rounded-full ${item.color} flex items-center justify-center text-[10px] border-2 border-black font-bold`}
                        >
                            {item.label}
                        </div>
                    ))}
                    <div className="text-xs text-neutral-400 flex items-center ml-auto border border-neutral-700 px-2 py-0.5 rounded-sm">
                        <div className="ml-auto size-6 rounded-full flex items-center justify-center">
                            <HiOutlineRocketLaunch className="text-neutral-400 size-3" />
                        </div>
                        Launch Quiz
                    </div>
                </div>
                <div className="p-6 space-y-3">
                    <div className="h-4 w-3/4 bg-neutral-100 rounded-md" />
                    <div className="h-4 w-1/2 bg-neutral-50 rounded-md" />
                </div>
            </motion.div>

            <div className="absolute -bottom-10 left-20 right-20 h-40 bg-white/20 rounded-t-3xl blur-sm" />
        </PerspectiveCard>
    );
}
