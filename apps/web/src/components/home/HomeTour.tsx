'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import { COMPLETE_TUTORIAL_URL } from 'routes/api_routes';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HiPlus, HiSparkles } from 'react-icons/hi2';
import { GoPeople } from 'react-icons/go';
import { MdOutlineFolderShared } from 'react-icons/md';
import { FaRegHeart, FaArrowLeft } from 'react-icons/fa6';
import { PiTrashSimple } from 'react-icons/pi';

const TOUR_STEPS = [
    {
        title: 'Welcome to Nocturn',
        description: "Let's take a quick tour to help you get started with creating and managing your AI-powered quizzes here.",
        icon: HiSparkles,
        color: '#4f46e5',
        tab: SidebarTab.HOME,
    },
    {
        title: 'Create Your First Quiz',
        description: 'Click "New Quiz" to start generating a new quiz using AI. You can customize the topic, difficulty, and add PDF materials.',
        icon: HiPlus,
        color: '#8b5cf6',
        tab: SidebarTab.HOME,
        targetId: 'tour-new-quiz',
        arrowDirection: 'right',
    },
    {
        title: 'Manage Your Workspace',
        description: "Access all the quizzes you've created. You can review, edit, share, or delete them from this dashboard seamlessly.",
        icon: GoPeople,
        color: '#0ea5e9',
        tab: SidebarTab.MY_QUIZZES,
        targetId: 'tour-my-quizzes',
        arrowDirection: 'left',
    },
    {
        title: 'Shared with You',
        description: 'Find all the quizzes that others have shared with you here. You can jump directly into collaborating and taking quizzes.',
        icon: MdOutlineFolderShared,
        color: '#10b981',
        tab: SidebarTab.SHARED_WITH_ME,
        targetId: 'tour-shared-with-me',
        arrowDirection: 'left',
    },
    {
        title: 'Quick Access',
        description: 'Star your most important quizzes to keep them handy and find them quickly in your favourites section.',
        icon: FaRegHeart,
        color: '#f43f5e',
        tab: SidebarTab.FAVORITES,
        targetId: 'tour-favourites',
        arrowDirection: 'left',
    },
    {
        title: 'Trash Can',
        description: 'Accidentally deleted a quiz? You can find and easily restore your recently deleted items here before they are gone permanently.',
        icon: PiTrashSimple,
        color: '#64748b',
        tab: SidebarTab.HOME,
        targetId: 'tour-trash',
        arrowDirection: 'left',
    },
];

export default function HomeTour() {
    const { session, setTutorialComplete } = useUserSessionStore();
    const { setActiveTab } = useHomeSidebarStore();
    const [step, setStep] = useState(0);

    const finishTour = async () => {
        try {
            const { data } = await axios.post(
                COMPLETE_TUTORIAL_URL,
                {},
                { headers: { Authorization: `Bearer ${session?.user.token}` } }
            );
            if (data.success && session?.user) {
                setTutorialComplete(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const nextStep = () => {
        if (step < TOUR_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            finishTour();
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    useEffect(() => {
        const currentTab = TOUR_STEPS[step].tab;
        setActiveTab(currentTab);
    }, [step, setActiveTab]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const updateRects = () => {
            if (containerRef.current) {
                setContainerRect(containerRef.current.getBoundingClientRect());
            }

            const targetId = TOUR_STEPS[step].targetId;
            if (!targetId) {
                setTargetRect(null);
                return;
            }

            let retries = 3;
            const checkEl = () => {
                const el = document.getElementById(targetId);
                if (el) {
                    setTargetRect(el.getBoundingClientRect());
                } else if (retries > 0) {
                    retries--;
                    setTimeout(checkEl, 250);
                } else {
                    setTargetRect(null);
                }
            };
            setTimeout(checkEl, 100);
        };

        updateRects();
        window.addEventListener('resize', updateRects);
        return () => window.removeEventListener('resize', updateRects);
    }, [step]);

    const activeData = TOUR_STEPS[step];
    const Icon = activeData.icon;

    let arrowStyle: React.CSSProperties = {};
    let arrowRotation = 0;
    let showArrow = false;
    let containerPadding = 'p-12';

    if (activeData.targetId && targetRect && containerRect) {
        showArrow = true;
        if (activeData.arrowDirection === 'left') {
            arrowStyle = {
                left: 30,
                top: targetRect.top + targetRect.height / 2 - containerRect.top - 24
            };
            arrowRotation = 0;
            containerPadding = 'py-12 pr-12 pl-[240px]';
        } else if (activeData.arrowDirection === 'right') {
            arrowStyle = {
                right: containerRect.right - targetRect.left + 20,
                top: targetRect.top + targetRect.height / 2 - containerRect.top - 24
            };
            arrowRotation = 180;
            containerPadding = 'py-12 pl-12 pr-[240px]';
        }
    }

    // Dynamic cutout hole for the target element using clip-path
    let overlayClipPath = undefined;
    if (showArrow && activeData.arrowDirection === 'right') {
        const hLeft = targetRect!.left - containerRect!.left - 8;
        const hRight = targetRect!.right - containerRect!.left + 8;
        const hTop = targetRect!.top - containerRect!.top - 8;
        const hBottom = targetRect!.bottom - containerRect!.top + 8;
        
        overlayClipPath = `polygon(
            0% 0%, 
            0% 100%, 
            ${hLeft}px 100%, 
            ${hLeft}px ${hTop}px, 
            ${hRight}px ${hTop}px, 
            ${hRight}px ${hBottom}px, 
            ${hLeft}px ${hBottom}px, 
            ${hLeft}px 100%, 
            100% 100%, 
            100% 0%
        )`;
    }

    return (
        <div 
            ref={containerRef} 
            className={`absolute inset-0 z-[100] flex items-center justify-center ${containerPadding} bg-black/60 dark:bg-black/70 backdrop-blur-md transition-all duration-300 pointer-events-auto`}
            style={{ clipPath: overlayClipPath }}
        >
            <AnimatePresence mode="wait">
                <motion.div 
                    layout
                    key={step}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-4xl h-[600px] flex overflow-hidden rounded-3xl auto-cols-auto shadow-[0_30px_80px_rgba(0,0,0,0.6)] border border-white/20 dark:border-white/10 bg-white dark:bg-neutral-900"
                >
                    {/* Left side: The Graphic */}
                    <div 
                        className="w-1/2 h-full flex flex-col items-center justify-center p-12 relative overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${activeData.color}22, ${activeData.color}08)` }}
                    >
                        <div 
                            className="absolute inset-0 opacity-40" 
                            style={{ 
                                background: `radial-gradient(circle at center, ${activeData.color} 0%, transparent 70%)`,
                                filter: 'blur(70px)'
                            }}
                        />
                        
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                            className="relative z-10 flex flex-col items-center gap-8"
                        >
                            {/* Giant Icon */}
                            <div 
                                className="w-36 h-36 rounded-3xl flex items-center justify-center shadow-xl border border-white/30 dark:border-white/10 backdrop-blur-xl"
                                style={{ background: `linear-gradient(135deg, ${activeData.color}40, ${activeData.color}15)` }}
                            >
                                <Icon style={{ fontSize: '72px', color: activeData.color }} />
                            </div>
                            
                            {/* Simulated UI Card Below */}
                            <div className="w-72 h-36 rounded-2xl bg-white/70 dark:bg-black/40 border border-white/40 dark:border-white/10 p-5 shadow-2xl backdrop-blur-2xl flex flex-col gap-4">
                                <div className="w-1/2 h-5 rounded-full bg-black/10 dark:bg-white/10" />
                                <div className="space-y-2">
                                    <div className="w-[85%] h-3 rounded-full bg-black/5 dark:bg-white/5" />
                                    <div className="w-[60%] h-3 rounded-full bg-black/5 dark:bg-white/5" />
                                </div>
                                <div className="mt-auto w-full flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10" />
                                        <div className="w-8 h-8 rounded-full -ml-3 bg-black/20 dark:bg-white/20 border-2 border-white dark:border-black" />
                                    </div>
                                    <div 
                                        className="w-20 h-8 rounded-md opacity-80" 
                                        style={{ backgroundColor: activeData.color }} 
                                    />
                                </div>
                            </div>

                        </motion.div>
                    </div>

                    {/* Right side: The Content */}
                    <div className="w-1/2 h-full flex flex-col p-12 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl">
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-8 uppercase tracking-widest w-fit shadow-sm">
                                Step {step + 1} of {TOUR_STEPS.length}
                            </div>
                            
                            <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-6 tracking-tight leading-tight">
                                {activeData.title}
                            </h2>
                            
                            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                                {activeData.description}
                            </p>
                        </div>

                        <div className="mt-auto pt-8 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800/60">
                            <button 
                                onClick={finishTour}
                                className="text-sm font-semibold text-neutral-400 hover:text-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors"
                            >
                                Skip Tour
                            </button>

                            <div className="flex items-center gap-3">
                                {step > 0 && (
                                    <Button 
                                        variant="outline" 
                                        onClick={prevStep}
                                        className="px-6 h-11 border-neutral-300 dark:border-neutral-700 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold text-neutral-700 dark:text-neutral-200"
                                    >
                                        Back
                                    </Button>
                                )}
                                <Button 
                                    onClick={nextStep}
                                    className="px-8 h-11 shadow-lg hover:brightness-110 active:scale-95 transition-all font-semibold"
                                    style={{ backgroundColor: activeData.color, color: 'white' }}
                                >
                                    {step === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            
            {/* The dynamically placed Arrow pointing towards the target element */}
            <AnimatePresence>
                {showArrow && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            x: activeData.arrowDirection === 'left' ? [0, -15, 0] : [0, 15, 0] 
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ 
                            opacity: { delay: 0.4, duration: 0.3 },
                            x: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        }}
                        className="absolute"
                        style={arrowStyle}
                    >
                        <div className={`flex items-center gap-4 ${activeData.arrowDirection === 'right' ? 'flex-row-reverse' : ''}`}>
                            <div className="bg-white dark:bg-neutral-900 p-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white relative">
                                <FaArrowLeft 
                                    className="text-2xl transition-transform duration-500" 
                                    style={{ 
                                        color: activeData.color,
                                        transform: `rotate(${arrowRotation}deg)`
                                    }} 
                                />
                                <div className="absolute inset-0 rounded-full ring-2 ring-white/50 dark:ring-white/10" />
                            </div>
                            <div className="hidden lg:block bg-black/80 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white font-semibold text-sm shadow-xl whitespace-nowrap">
                                Look here!
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
