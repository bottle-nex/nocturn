import { useState, useEffect } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { QuizStatusEnum } from '@nocturn/types';
import { toast } from '@/lib/toast';
import { Button } from '../ui/button';
import OpacityBackground from '../utility/OpacityBackground';
import UtilityCard from '../utility/UtilityCard';
import { motion, AnimatePresence } from 'framer-motion';
import { PiSpinnerThin } from 'react-icons/pi';
import ToolTipComponent from '../utility/TooltipComponent';

interface RevisePanelProps {
    onBackgroundClick: () => void;
    reviseQuizPanel: string;
    onConfirm: () => void;
    isLoading: boolean;
}

export default function RevisePanel({
    onBackgroundClick,
    reviseQuizPanel,
    onConfirm,
    isLoading,
}: RevisePanelProps) {
    const { quiz } = useNewQuizStore();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const totalTime = quiz.questions.reduce((acc, q) => acc + q.timeLimit, 0);
    const totalPoints = quiz.questions.reduce((acc, q) => acc + q.basePoints, 0);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const handleNext = () => {
        setDirection(1);
        setStep((s) => Math.min(s + 1, 4));
    };
    const handleBack = () => {
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 0));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                if (step < 4) {
                    setDirection(1);
                    setStep((s) => Math.min(s + 1, 4));
                }
            } else if (e.key === 'ArrowLeft') {
                if (step > 0) {
                    setDirection(-1);
                    setStep((s) => Math.max(s - 1, 0));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step]);

    const stepsContent = [
        {
            title: 'Theme & Questions',
            content: (
                <div className="flex flex-col gap-y-4 text-neutral-800 dark:text-neutral-200 mt-2">
                    <p className="text-sm opacity-70 mb-2">
                        Check your selected theme and total questions.
                    </p>
                    <div className="flex justify-between items-center bg-white/5 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                        <span className="font-medium">Selected Theme:</span>
                        <span className="bg-indigo-600/10 border border-indigo-600/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-sm shadow-sm font-medium uppercase tracking-wider">
                            {quiz.template.name || 'Default'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                        <span className="font-medium">Total Questions:</span>
                        <div className="flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 h-8 px-4 rounded-full font-bold">
                            {quiz.questions.length}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Time & Points',
            content: (
                <div className="flex flex-col gap-y-3 text-neutral-800 dark:text-neutral-200 mt-2">
                    <div className="flex justify-between items-center bg-white/5 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                        <span className="font-medium">Total Calculated Time:</span>
                        <span className="font-semibold text-lg">{formatTime(totalTime)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm mt-1">
                        <span className="font-medium">Total Points:</span>
                        <span className="font-semibold text-lg">{totalPoints}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm mt-1">
                        <span className="font-medium">Selected Multiplier:</span>
                        <span className="font-semibold text-lg px-2 py-0.5 bg-indigo-600/10 rounded-md text-indigo-600 dark:text-indigo-400">
                            {quiz.pointsMultiplier || 1}x
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Enabled Interactions',
            content: (
                <div className="flex flex-col gap-y-4 text-neutral-800 dark:text-neutral-200 mt-2">
                    <p className="text-sm opacity-70 mb-2">
                        Reactions and interactive modules selected.
                    </p>
                    {quiz.interactions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 p-2">
                            {quiz.interactions.map((interaction) => (
                                <span
                                    key={interaction}
                                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-sm font-medium shadow-sm"
                                >
                                    {interaction}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-neutral-100/50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 p-8 rounded-xl text-center flex flex-col items-center justify-center h-[120px]">
                            <span className="opacity-50 text-sm font-medium">
                                No interactions enabled
                            </span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Audience Settings',
            content: (
                <div className="flex flex-col gap-y-4 text-neutral-800 dark:text-neutral-200 mt-2">
                    <p className="text-sm opacity-70 italic mb-2">
                        These settings can also be toggled during the live quiz.
                    </p>
                    <div className="flex justify-between items-center bg-white/5 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                        <span className="font-medium">Live Chat:</span>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${quiz.liveChat ? 'bg-green-500/20 text-green-600 dark:text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20'}`}
                        >
                            {quiz.liveChat ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                        <span className="font-medium">Spectator Mode:</span>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${quiz.spectatorMode ? 'bg-green-500/20 text-green-600 dark:text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20'}`}
                        >
                            {quiz.spectatorMode ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Prize Details',
            content: (
                <div className="flex flex-col gap-y-4 text-neutral-800 dark:text-neutral-200 mt-2">
                    {quiz.prizePool > 0 ? (
                        <>
                            <div className="flex justify-between items-center bg-gradient-to-r from-green-500/5 to-emerald-500/10 border border-green-500/20 p-4 rounded-xl shadow-sm">
                                <span className="font-medium">Staked Amount:</span>
                                <span className="font-bold text-green-600 dark:text-green-500 text-xl tracking-tight">
                                    {quiz.prizePool} {quiz.currency || 'USDC'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-white/5 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                                <span className="font-medium">Total Winners:</span>
                                <span className="font-semibold px-3 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-full">
                                    {quiz.prizeDistributions?.length || 0}
                                </span>
                            </div>
                            <div className="p-4 border border-dashed border-neutral-400 dark:border-neutral-700 rounded-xl flex flex-col gap-y-3 relative mt-2 bg-neutral-50 dark:bg-neutral-900/40">
                                <span className="text-xs font-semibold opacity-60 uppercase tracking-widest text-[10px]">
                                    Staked From Address
                                </span>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-mono opacity-80 max-w-[200px] truncate bg-white dark:bg-black px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800">
                                        {'0xStakePlaceholderAddress...123'}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-[28px] text-xs px-3 dark:border-neutral-700 bg-white dark:hover:bg-neutral-800 shadow-sm rounded-lg"
                                    >
                                        Set Address
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/20 rounded-xl gap-y-4 my-2">
                            <span className="text-center text-sm font-medium opacity-80 max-w-[250px]">
                                No staked prize found for this quiz.
                            </span>
                            <Button
                                size="sm"
                                onClick={() =>
                                    toast.success('Configure prize in the settings panel')
                                }
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-600/20 px-6"
                            >
                                Add Prize
                            </Button>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <OpacityBackground onBackgroundClick={onBackgroundClick} escapeClosing>
            <UtilityCard className="max-w-md w-full bg-[#fcfcfc] dark:bg-[#121212] rounded-2xl p-0 shadow-2xl border border-neutral-200 dark:border-neutral-800/60 overflow-hidden relative">
                <div className="flex p-6 pb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                            {stepsContent[step].title}
                        </h1>
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wide">
                            Step {step + 1} of 5
                        </p>
                    </div>
                </div>

                <div className="px-6 h-[260px] relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 15 * direction }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 * direction }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="absolute w-full pr-12"
                        >
                            {stepsContent[step].content}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="relative flex justify-between items-center p-6 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-[#0a0a0a]/50">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={isLoading || step === 0}
                        className={`dark:text-neutral-300 rounded-xl transition-all ${step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        Back
                    </Button>

                    {step < 4 ? (
                        <Button
                            className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-xl px-8 shadow-sm"
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    ) : (
                        <ToolTipComponent
                            content={`You will not be able to change the quiz after ${reviseQuizPanel.split(' ')[0]}ing`}
                        >
                            <Button
                                onClick={onConfirm}
                                disabled={
                                    isLoading ||
                                    (reviseQuizPanel === 'Publish Quiz' &&
                                        (quiz.status === QuizStatusEnum.PUBLISHED ||
                                            quiz.status === QuizStatusEnum.LIVE)) ||
                                    (reviseQuizPanel === 'Launch Quiz' &&
                                        quiz.status === QuizStatusEnum.LIVE)
                                }
                                className={`relative rounded-xl px-8 font-medium shadow-lg transition-all ${
                                    (reviseQuizPanel === 'Publish Quiz' &&
                                        (quiz.status === QuizStatusEnum.PUBLISHED ||
                                            quiz.status === QuizStatusEnum.LIVE)) ||
                                    (reviseQuizPanel === 'Launch Quiz' &&
                                        quiz.status === QuizStatusEnum.LIVE)
                                        ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 shadow-none cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                                }`}
                            >
                                {isLoading && (
                                    <PiSpinnerThin className="animate-spin size-4 mr-2" />
                                )}
                                {reviseQuizPanel === 'Publish Quiz' &&
                                (quiz.status === QuizStatusEnum.PUBLISHED ||
                                    quiz.status === QuizStatusEnum.LIVE)
                                    ? 'Published'
                                    : reviseQuizPanel === 'Launch Quiz' &&
                                        quiz.status === QuizStatusEnum.LIVE
                                      ? 'Launched'
                                      : `${reviseQuizPanel.split(' ')[0]} Now`}
                            </Button>
                        </ToolTipComponent>
                    )}
                </div>
            </UtilityCard>
        </OpacityBackground>
    );
}
