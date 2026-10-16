'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import LandingCardHeader from './LandingCardHeader';
import PerspectiveCard from '@/components/utility/PerspectiveCard';

interface ToggleProps {
    enabled: boolean;
    onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
    return (
        <motion.button
            onClick={onToggle}
            animate={{
                backgroundColor: enabled ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.07)',
            }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="relative shrink-0 mr-4 cursor-pointer focus:outline-none px-px"
            style={{
                width: 34,
                height: 20,
                borderRadius: 999,
                boxShadow: enabled
                    ? 'inset 0 1px 2px rgba(0,0,0,0.2)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.08)',
            }}
        >
            <motion.div
                animate={{ x: enabled ? 16 : 2 }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 32,
                    mass: 0.8,
                }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    y: '-50%',
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.22), 0 0.5px 1px rgba(0,0,0,0.12)',
                }}
            />
        </motion.button>
    );
}

export default function LandingPublishCardComponent() {
    const [interactions, setInteractions] = useState<boolean>(true);
    const [timeLimit, setTimeLimit] = useState<boolean>(false);
    const [lifelines, setLifelines] = useState<boolean>(false);

    return (
        <PerspectiveCard
            delay={0.04}
            className="mt-20 relative w-full h-100 rounded-xl bg-[#FFD400] shadow-xs shadow-black/20 overflow-hidden p-6"
        >
            <LandingCardHeader
                title="Publish quiz"
                description="Configure everything before your quiz goes live"
            />
            <div className="absolute h-72 w-80 rounded-2xl ring-1 ring-white/6 -bottom-6 -right-20 bg-dark-faded/40" />
            <div className="absolute h-72 w-80 rounded-2xl ring-1 ring-white/[0.07] -bottom-9 -right-15 z-10 bg-dark-faded/70 backdrop-blur-xs" />
            <div className="absolute h-72 w-80 rounded-2xl ring-1 ring-white/8 -bottom-12 -right-10 z-20 bg-dark-base overflow-hidden shadow-sm shadow-black/20">
                <div className="px-4 pt-4 pb-3 border-b border-white/5">
                    <p className="text-[11px] font-semibold text-light-base/50 tracking-wide uppercase">
                        Quiz Settings
                    </p>
                </div>
                <div className="px-4 pt-3 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-medium text-light-base/70">Interactions</p>
                            <p className="text-[10px] text-light-base/35 mt-0.5">Enable interactions</p>
                        </div>
                        <Toggle
                            enabled={interactions}
                            onToggle={() => setInteractions((v) => !v)}
                        />
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-medium text-light-base/70">Time limit</p>
                            <p className="text-[10px] text-light-base/35 mt-0.5">
                                30 seconds per question
                            </p>
                        </div>
                        <Toggle enabled={timeLimit} onToggle={() => setTimeLimit((v) => !v)} />
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-medium text-light-base/70">Lifelines</p>
                            <p className="text-[10px] text-light-base/35 mt-0.5">Enable lifelines</p>
                        </div>
                        <Toggle enabled={lifelines} onToggle={() => setLifelines((v) => !v)} />
                    </div>

                    {/* <div className="h-px bg-black/5" /> */}
                </div>
            </div>
        </PerspectiveCard>
    );
}
