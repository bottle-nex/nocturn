'use client';
import React, { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { FiX, FiCheck, FiZap } from 'react-icons/fi';
import Image from 'next/image';
import { RxCross2 } from 'react-icons/rx';

type StepId = 'Create' | 'Publish' | 'Launch' | 'Manage';

interface StepConfig {
    id: StepId;
    className: string;
    content: JSX.Element;
}

const SPRING_CONFIG = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
} as const;

const MODAL_SPRING = {
    type: 'spring',
    stiffness: 200,
    damping: 25,
} as const;

function CustomCursor({ visible }: { visible: boolean }): JSX.Element {
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);

    const springX = useSpring(x, { stiffness: 500, damping: 40 });
    const springY = useSpring(y, { stiffness: 500, damping: 40 });

    useEffect(() => {
        const move = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, [x, y]);

    return (
        <motion.div
            style={{
                left: springX,
                top: springY,
                translateX: '-50%',
                translateY: '-50%',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
            className="fixed pointer-events-none z-9999 h-14 w-14 bg-dark-base text-light-alpha rounded-full flex items-center justify-center text-[10px] font-semibold uppercase tracking-widest shadow-2xl"
        >
            View
        </motion.div>
    );
}

export default function App(): JSX.Element {
    const [activeId, setActiveId] = useState<StepId | null>(null);
    const [hovering, setHovering] = useState(false);

    const steps: StepConfig[] = [
        { id: 'Create', className: 'w-80 h-[340px]', content: <CreateCardContent /> },
        { id: 'Publish', className: 'w-80 h-[340px]', content: <PublishCardContent /> },
        { id: 'Launch', className: 'w-80 h-[340px]', content: <LaunchCardContent /> },
        { id: 'Manage', className: 'w-80 h-[340px]', content: <ManageCardContent /> },
    ];

    return (
        <section className="min-h-screen w-full bg-light-base flex flex-col items-center justify-around px-6 font-sans text-dark-base overflow-x-hidden">
            <CustomCursor visible={hovering && !activeId} />

            <div className="w-full text-dark-base flex justify-center text-3xl tracking-wide">
                GET TO KNOW NOCTURN
            </div>

            <div className="relative w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8">
                {steps.map((step) => (
                    <Step
                        key={step.id}
                        title={step.id}
                        className={step.className}
                        layoutId={`card-${step.id}`}
                        isActive={activeId === step.id}
                        onClick={() => setActiveId(step.id)}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                    >
                        {step.content}
                    </Step>
                ))}
            </div>

            <AnimatePresence>
                {activeId && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveId(null)}
                        />

                        <div className="fixed inset-0 z-[101] flex items-center justify-center p-6">
                            <motion.div
                                layoutId={`card-${activeId}`}
                                transition={MODAL_SPRING}
                                className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                                style={{ maxHeight: '80vh' }}
                            >
                                <div className="p-8 flex justify-between items-center border-b border-slate-100">
                                    <h2 className="text-3xl font-bold">{activeId}</h2>
                                    <button
                                        onClick={() => setActiveId(null)}
                                        className="p-2 rounded-full hover:bg-slate-100"
                                    >
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto flex-1">
                                    <ExpandedViewContent id={activeId} />
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}

interface StepProps {
    title: string;
    className: string;
    children: React.ReactNode;
    layoutId: string;
    isActive: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

function Step({
    title,
    className,
    children,
    layoutId,
    isActive,
    onClick,
    onMouseEnter,
    onMouseLeave,
}: StepProps): JSX.Element {
    return (
        <div className="flex flex-col items-center relative">
            <motion.div
                layoutId={layoutId}
                transition={SPRING_CONFIG}
                whileHover={{ y: -12 }}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={`${className} cursor-none bg-white rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden ${
                    isActive ? 'opacity-0' : 'opacity-100'
                }`}
            >
                <div className="flex-1 rounded-xl border">{children}</div>
            </motion.div>

            <motion.h3
                animate={{ opacity: isActive ? 0 : 1 }}
                className="mt-4 text-xl text-slate-400"
            >
                {title}
            </motion.h3>
        </div>
    );
}

function ExpandedViewContent({ id }: { id: StepId }): JSX.Element {
    const map: Record<StepId, JSX.Element> = {
        Create: (
            <div className="space-y-6 text-slate-700">
                <h4 className="text-xl font-semibold text-slate-900">Create Your Quiz</h4>

                <div className="space-y-4">
                    <div>
                        <h5 className="font-semibold text-slate-900 mb-1">
                            Option 1: Generate with AI
                        </h5>
                        <ol className="list-decimal pl-5 space-y-1 text-sm">
                            <li>Add a prompt describing the topic you want the quiz on.</li>
                            <li>Select the difficulty level (Easy, Medium, or Hard).</li>
                            <li>Let the AI generate questions and answers for you.</li>
                            <li>Review the generated quiz and open it instantly.</li>
                        </ol>
                    </div>

                    <div>
                        <h5 className="font-semibold text-slate-900 mb-1">
                            Option 2: Create Manually
                        </h5>
                        <ol className="list-decimal pl-5 space-y-1 text-sm">
                            <li>Create questions and add multiple answer options.</li>
                            <li>Select the correct answers for each question.</li>
                            <li>Choose a visual theme for your quiz.</li>
                            <li>Stake Solana if you want to create a reward pool.</li>
                            <li>Add interactions like timers, lifelines, or bonuses.</li>
                            <li>Save the quiz as a draft to edit later.</li>
                        </ol>
                    </div>
                </div>
            </div>
        ),

        Publish: (
            <div className="space-y-6 text-slate-700">
                <h4 className="text-xl font-semibold text-slate-900">Publish Your Quiz</h4>

                <div className="space-y-3 text-sm">
                    <p>Publishing your quiz permanently commits it to the system.</p>

                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            Once published, the quiz <strong>cannot be edited</strong>.
                        </li>
                        <li>Make sure all questions, options, and settings are final.</li>
                        <li>
                            If you want participants to compete for rewards, stake Solana
                            <strong> before publishing</strong>.
                        </li>
                        <li>Publishing locks in quiz rules and reward logic on-chain.</li>
                    </ul>
                </div>
            </div>
        ),

        Launch: (
            <div className="space-y-6 text-slate-700">
                <h4 className="text-xl font-semibold text-slate-900">Launch the Quiz</h4>

                <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Launch the quiz to make it live for participants and audience.</li>
                    <li>
                        Generate a <strong>Participant Code</strong> for players.
                    </li>
                    <li>
                        Generate an <strong>Audience Code</strong> and shareable links.
                    </li>
                    <li>Invite participants and audience members using the codes or links.</li>
                    <li>Wait until everyone has joined the lobby.</li>
                    <li>
                        Click <strong>Get Started</strong> to begin the quiz.
                    </li>
                    <li>The quiz runs live with real-time questions and scoring.</li>
                </ol>
            </div>
        ),

        Manage: (
            <div className="space-y-6 text-slate-700">
                <h4 className="text-xl font-semibold text-slate-900">Manage the Live Quiz</h4>

                <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>FiSmile Control quiz flow and manage live interactions.</li>
                    <li>Enable or disable lifelines during the quiz.</li>
                    <li>Monitor and moderate the audience chat in real time.</li>
                    <li>View live leaderboards as participants answer questions.</li>
                    <li>Track scores, rankings, and performance instantly.</li>
                    <li>Ensure fair play and smooth progression throughout the quiz.</li>
                </ul>
            </div>
        ),
    };

    return map[id];
}

function CreateCardContent(): JSX.Element {
    return <div className="h-full flex flex-col gap-5 items-center"></div>;
}

function PublishCardContent(): JSX.Element {
    return (
        <div className="p-6 h-full flex flex-col rounded-sm overflow-hidden relative">
            <div className="mt-auto flex justify-end relative z-2">
                <button className="bg-slate-900 text-white px-5 py-2.5 rounded-md text-[10px] font-bold">
                    Publish Quiz
                </button>
            </div>
        </div>
    );
}

function LaunchCardContent(): JSX.Element {
    return (
        <div className="p-6 h-full flex gap-5 relative rounded-sm">
            <div className="flex-1 flex flex-col justify-end gap-3 pb-2 relative z-2">
                <div className="h-2.5 bg-dark-faded/70 rounded-full" />
                <div className="h-2 bg-dark-faded rounded-full w-full" />
                <div className="h-2 bg-dark-faded/70 rounded-full w-3/4" />
            </div>
            <div className="flex flex-col items-center justify-end gap-5 relative z-2">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
                    <FiZap className="text-white" />
                </div>
                <div className="text-[9px] font-black px-4 py-2 bg-slate-900 text-white rounded-md">
                    STAKE SOL
                </div>
            </div>
        </div>
    );
}

function ManageCardContent(): JSX.Element {
    return (
        <div className="p-4 flex flex-col gap-2.5 h-full bg-neutral-300/20 rounded-sm justify-center">
            <div className="text-[9px] font-bold text-slate-400 mb-3 px-2 flex justify-between">
                <span>Participants</span>
                <span>Spectators</span>
            </div>
            <UserRow success imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg" />
            <UserRow success imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-12.jpg" />
            <UserRow
                success={false}
                imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg"
            />
            <UserRow success imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg" />
            <UserRow
                success={false}
                imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg"
            />
        </div>
    );
}

function UserRow({ success, imgUrl }: { success: boolean; imgUrl: string }): JSX.Element {
    return (
        <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-100/80 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 overflow-hidden relative">
                <Image src={imgUrl} alt="img" fill unoptimized className="object-cover" />
            </div>
            <div className="flex-1 h-1.5 bg-light-base rounded-full overflow-hidden relative">
                <div
                    className={`absolute left-0 top-0 h-full ${success ? 'bg-indigo-400 w-full' : 'bg-slate-200 w-1/3'}`}
                />
            </div>
            <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${success ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}
            >
                {success ? <FiCheck className="w-3 h-3" /> : <RxCross2 className="w-3 h-3" />}
            </div>
        </div>
    );
}
