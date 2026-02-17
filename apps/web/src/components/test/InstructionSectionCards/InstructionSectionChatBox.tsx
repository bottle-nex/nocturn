'use client';
import { pill, pillContent } from '@/components/utility/framer-utils/InstructionSectionUtils';
import { motion } from 'framer-motion';
import { GoPlus } from 'react-icons/go';
import { IoMicOutline } from 'react-icons/io5';

export default function InstructionSectionChatBox() {
    return (
        <div className="absolute top-[75%]">
            <motion.div
                variants={pill}
                initial="hidden"
                animate="show"
                className="relative z-20 h-15 rounded-full bg-light-alpha ring-1 ring-black/10 shadow-sm flex items-center px-6 overflow-hidden"
            >
                <motion.div
                    variants={pillContent}
                    initial="hidden"
                    animate="show"
                    className="flex w-full justify-between items-center"
                >
                    <div className="text-neutral-400/80 text-sm">Create a quiz for me....</div>

                    <div className="flex gap-x-2.5 mt-px">
                        <GoPlus className="size-5.5" />
                        <IoMicOutline className="size-5" />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
