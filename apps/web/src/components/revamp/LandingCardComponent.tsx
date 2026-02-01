'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdAddReaction } from 'react-icons/md';
import { IoIosPeople } from 'react-icons/io';
import { LuHandHelping } from 'react-icons/lu';
import { templates } from '@/lib/templates';
import EmptyCanvas from '../canvas/EmptyCanvas';
import CloudBackground from './CloudBackground';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { FaDartLang, FaLocationArrow } from 'react-icons/fa6';
import AnimatedIcons from './AnimatedIcons';
import userQuizAction from '@/lib/backend/user-quiz-action';
import { useRouter } from 'next/navigation';
import LandingCardChatArea from './LandingCardChatArea';

const left_icons = [
    { icon: <FaDartLang className="size-8" />, isTheme: true },
    { icon: <MdAddReaction className="size-8.5" /> },
    { icon: <IoIosPeople className="size-9" /> },
    { icon: <LuHandHelping className="size-9" /> },
];

export default function LandingCardComponent() {
    const [templateIndex, setTemplateIndex] = useState<number>(0);
    const [quizCode, setQuizCode] = useState<string>('');
    const router = useRouter();

    function handleThemeChange() {
        setTemplateIndex((prev) => (prev + 1) % templates.length);
    }

    const activeTemplate = templates[templateIndex];

    async function handleJoinQuiz() {
        if (!quizCode.trim()) return;
        try {
            const quizId = await userQuizAction.joinQuiz(quizCode.trim());
            setQuizCode('');

            if (!quizId) return;
            router.push(`/live/${quizId}`);
        } catch (err) {
            console.error('Failed to join quiz', err);
        }
    }

    return (
        <div className="w-screen h-screen flex flex-col relative items-center">
            <div className="flex flex-col items-center mt-[7%] gap-y-3 w-full max-w-[67rem]">
                <div className="text-light-base text-[110px] leading-[1.04] font-bold w-full flex flex-col items-center">
                    <div>Outhink the room</div>
                    <div>take the prize</div>
                </div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <CloudBackground />
            </div>

            {/* main card */}
            <div
                className={cn(
                    'w-250 h-130 mt-5 border border-light-base/5 p-2 rounded-[33px]',
                    // "absolute bottom-10 left-1/2 -translate-x-1/2",
                    'z-10',
                )}
            >
                <div className="border border-light-base/20 h-full w-full p-2 rounded-[30px]">
                    <div className="border border-light-base/25 h-full w-full p-2 rounded-[22px]">
                        <div className="w-full h-full bg-dark-faded rounded-xl flex flex-col p-4 gap-y-4 relative">
                            <div className="absolute top-11 -right-3.5 rotate-185 z-10">
                                <FaLocationArrow className="size-7 text-[#FFEF5F]" />
                            </div>

                            <div className="bg-[#FFEF5F] px-4.5 py-2 absolute top-4 -right-53 z-10 rounded-full text-base tracking-wide flex items-center gap-x-2 hover:-translate-y-0.5 hover:scale-103 transition-all transform duration-200 select-none text-dark-base">
                                AI-powered generation
                            </div>

                            <div className="absolute top-14 -left-3 rotate-80 z-10">
                                <FaLocationArrow className="size-8 text-[#6AECE1]" />
                            </div>

                            <div className="bg-[#6AECE1] px-4.5 py-2 absolute top-8 -left-25 z-10 rounded-full text-base flex items-center gap-x-2 hover:-translate-y-0.5 hover:scale-103 transition-all transform duration-200 select-none text-dark-base tracking-wide">
                                Themes
                            </div>

                            <div className="absolute top-71 -left-4 rotate-15 z-10">
                                <FaLocationArrow className="size-9 text-light-base" />
                            </div>

                            <div className="bg-light-base px-4.5 py-2 absolute top-75 -left-37 z-10 rounded-full text-base flex items-center gap-x-2 hover:-translate-y-0.5 hover:scale-103 transition-all transform duration-200 select-none text-dark-base tracking-wide">
                                Collaborators
                            </div>

                            <div className="w-full h-[10%] gap-x-4">
                                <div className="h-full w-full text-light-base/90 tracking-wide font-semibold  rounded-alpha flex items-center">
                                    <div className="w-full flex justify-center gap-x-3">
                                        <Input
                                            value={quizCode}
                                            onChange={(e) => setQuizCode(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleJoinQuiz();
                                            }}
                                            className="w-80 h-10 bg-[#2c3333] text-light-base rounded-alpha! border-neutral-700"
                                            placeholder="enter your code here"
                                        />

                                        <motion.button
                                            whileTap={{
                                                scale: 0.95,
                                                y: 0,
                                            }}
                                            transition={{
                                                type: 'tween',
                                                duration: 0.15,
                                                ease: 'easeOut',
                                            }}
                                            className="bg-nradiant hover:bg-nradiant text-dark-base text-sm w-25 font-normal hover:-translate-y-0.5 transition-all transform duration-200 cursor-pointer rounded-alpha h-10"
                                        >
                                            Join Quiz
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-[90%] grid grid-cols-14 gap-x-4 items-start overflow-hidden">
                                <div className="col-span-10 bg-dark-faded rounded-beta h-full w-full flex flex-col">
                                    <div className="h-[88%] w-full flex gap-x-3 mt-1">
                                        <div className="w-[15%] h-full flex flex-col gap-y-2">
                                            <div className="bg-light-alpha ring-1 ring-black/10 shadow-sm shadow-black/5 h-fit col-span-1 rounded-beta flex flex-col items-center py-2 gap-y-3">
                                                {left_icons.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={
                                                            item.isTheme
                                                                ? handleThemeChange
                                                                : undefined
                                                        }
                                                        className="bg-light-base ring-1 ring-black/8 shadow-sm shadow-black/5 w-20 h-20 flex justify-center items-center rounded-alpha text-dark-base cursor-pointer"
                                                    >
                                                        {item.icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="w-[85%] h-full flex flex-col relative">
                                            <EmptyCanvas
                                                autoAnimateBars
                                                question="Who are the best devs in the community?"
                                                options={['RAP', 'RPA', 'APR', 'PRA']}
                                                className="w-full h-105.5 cursor-auto ring-1 ring-white/20 shadow-xs shadow-white/5 rounded-[6px]"
                                                template={activeTemplate}
                                            />
                                            <div className="absolute top-7 right-4 w-fit z-10">
                                                <AnimatedIcons />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <LandingCardChatArea />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
