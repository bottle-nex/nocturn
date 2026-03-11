'use client';
import SigninModal from '@/components/utility/SigninModal';
import { cn } from '@/lib/utils';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaRegSave } from 'react-icons/fa';
import { GrSend } from 'react-icons/gr';
import { HiOutlineUpload } from 'react-icons/hi';
import { MdOutlineCreateNewFolder } from 'react-icons/md';
import { PiPlus } from 'react-icons/pi';

const elements = [
    {
        name: 'Create',
        icon: { element: MdOutlineCreateNewFolder, size: 14 },
        position: { top: 5, right: 12 },
    },
    {
        name: 'Save',
        icon: { element: FaRegSave, size: 12 },
        position: { top: 15, right: 9 },
    },
    {
        name: 'Publish',
        icon: { element: HiOutlineUpload, size: 14 },
        position: { top: 25, right: 6.5 },
    },
    {
        name: 'Launch',
        icon: { element: GrSend, size: 12 },
        position: { top: 35, right: 12 },
    },
];

export default function LandingSectionLeftCard() {
    const [showNewQuizOptions, setShowNewQuizOptions] = useState<boolean>(false);
    const router = useRouter();
    const { session, setOpenSigninModal } = useUserSessionStore();

    const container: Variants = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: 0.09,
                delayChildren: 0.05,
            },
        },
        exit: {
            transition: {
                staggerChildren: 0.07,
                staggerDirection: -1,
            },
        },
    };

    const item: Variants = {
        hidden: {
            scale: 0.4,
            opacity: 0,
            y: 18,
            rotate: -8,
            filter: 'blur(10px)',
        },
        show: {
            scale: 1,
            opacity: 1,
            y: 0,
            rotate: 0,
            filter: 'blur(0px)',
            transition: {
                type: 'spring',
                stiffness: 380,
                damping: 18,
            },
        },
        exit: {
            scale: 0.45,
            opacity: 0,
            y: 14,
            filter: 'blur(10px)',
            transition: { duration: 0.18 },
        },
    };

    return (
        <motion.div
            initial={{
                scale: 0.6,
                opacity: 0,
                y: 100,
            }}
            animate={{
                scale: 1,
                opacity: 1,
                y: 0,
            }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.5,
            }}
            onMouseEnter={() => setShowNewQuizOptions(true)}
            onMouseLeave={() => setShowNewQuizOptions(false)}
            className={cn(
                'h-80 w-78 rounded-4xl ring-4 ',
                'shadow-xl absolute top-4 left-[11%] p-6 flex flex-col justify-between overflow-hidden scale-115',
                'ring-white bg-linear-to-b from-neutral-300/50 via-neutral-200/50 to-neutral-100/50 ',
                'dark:ring-dark-base dark:bg-linear-to-b dark:from-neutral-700/50 via-neutral-800/50 to-neutral-900/50 ',
            )}
        >
            <div className="h-50 w-full relative">
                <AnimatePresence>
                    {showNewQuizOptions && (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            exit="exit"
                            className="absolute h-50 w-full pointer-events-none"
                        >
                            {elements.map((e, i) => (
                                <motion.div
                                    key={i}
                                    variants={item}
                                    className={cn(
                                        'px-2 py-1 flex items-center ring-1 ring-black/10 shadow-xs shadow-black/5 gap-x-1 text-dark-base/80 dark:text-light-base/80 bg-light-alpha dark:bg-dark-alpha w-fit rounded-sm text-xs tracking-wide rotate-4',
                                        `absolute top-${e.position.top} right-${e.position.right}`,
                                    )}
                                >
                                    <e.icon.element className={`size${e.icon.size}`} />
                                    {e.name}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute h-16 w-60 ring-1 ring-black/5 dark:ring-light-alpha/2 bg-[#f8f8f8] dark:bg-dark-alpha shadow-xs shadow-black/10 rounded-xl -left-25 top-12 rotate-4 p-3 flex justify-end items-center">
                    <div
                        onClick={() => {
                            if (!session?.user.token) {
                                setOpenSigninModal(true);
                            }
                            router.push('/new');
                        }}
                        className="bg-indigo-500 hover:-translate-y-px text-light-base dark:text-dark-base flex gap-x-1.5 px-3 py-2 w-fit rounded-alpha justify-center items-center shadow-xs shadow-black/5 cursor-pointer active:scale-95 transition-all transform duration-200"
                    >
                        <PiPlus />
                        New quiz
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col gap-y-2">
                <div className="text-dark-base/70 dark:text-light-base/70 ">STEP 1</div>
                <div className="text-dark-base/50 dark:text-light-base/50 ">
                    Head over to the home page, then click on{' '}
                    <span className="text-dark-base dark:text-light-base ">New Quiz </span>
                    to start creating a quiz.
                </div>
            </div>
            <SigninModal />
        </motion.div>
    );
}
