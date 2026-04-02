import { useState } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { QuizStatusEnum, InteractionEnum } from '@nocturn/types';
import { Button } from '../ui/button';
import OpacityBackground from '../utility/OpacityBackground';
import UtilityCard from '../utility/UtilityCard';
import { PiSpinnerThin, PiCurrencyCircleDollarFill } from 'react-icons/pi';
import ToolTipComponent from '../utility/TooltipComponent';
import { FaHeart, FaLightbulb } from 'react-icons/fa6';
import { BsFillHandThumbsUpFill } from 'react-icons/bs';
import { MdEmojiEmotions } from 'react-icons/md';
import { IconType } from 'react-icons/lib';
import { motion, AnimatePresence } from 'framer-motion';

interface RevisePanelProps {
    onBackgroundClick: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

interface InteractionIcon {
    id: InteractionEnum;
    Component: IconType;
    iconColor: string;
}

const interactionIcons: InteractionIcon[] = [
    { id: InteractionEnum.HEART, Component: FaHeart, iconColor: '#E53E3E' },
    { id: InteractionEnum.DOLLAR, Component: PiCurrencyCircleDollarFill, iconColor: '#38A169' },
    { id: InteractionEnum.BULB, Component: FaLightbulb, iconColor: '#252525' },
    { id: InteractionEnum.THUMBS_UP, Component: BsFillHandThumbsUpFill, iconColor: '#3182CE' },
    { id: InteractionEnum.SMILE, Component: MdEmojiEmotions, iconColor: '#F6AD55' },
];

export default function RevisePanel({ onBackgroundClick, onConfirm, isLoading }: RevisePanelProps) {
    const { quiz } = useNewQuizStore();

    const questionCount = quiz.questions.length;

    // Total duration: reading + answering per question + breaks between questions
    const totalAnswerTime = quiz.questions.reduce(
        (acc, q) => acc + (q.timeLimit || quiz.questionTimeLimit),
        0,
    );
    const totalReadingTime = quiz.questions.reduce((acc, q) => acc + (q.readingTime || 0), 0);
    const totalBreakTime = Math.max(0, questionCount - 1) * quiz.breakBetweenQuestions;
    const totalTime = totalAnswerTime + totalReadingTime + totalBreakTime;

    // Total points: sum of each question's actual basePoints
    const totalPoints = quiz.questions.reduce(
        (acc, q) => acc + (q.basePoints || quiz.basePointsPerQuestion),
        0,
    );

    const formatTime = (seconds: number) => {
        if (seconds >= 3600) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return m > 0 ? `${h}h ${m}m` : `${h}h`;
        }
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const isAlreadyPublished =
        quiz.status === QuizStatusEnum.PUBLISHED || quiz.status === QuizStatusEnum.LIVE;

    const allSettings = [
        { label: 'Live Chat', enabled: quiz.liveChat },
        { label: 'Spectator Mode', enabled: quiz.spectatorMode },
        { label: 'Time Bonus', enabled: quiz.timeBonus },
        { label: 'Open Spectators', enabled: quiz.allowNewSpectator },
    ];

    return (
        <OpacityBackground onBackgroundClick={onBackgroundClick} escapeClosing>
            <UtilityCard className="max-w-3xl w-full bg-light-base dark:bg-dark-base rounded-2xl p-0 border border-neutral-300 dark:border-neutral-700 overflow-hidden relative">
                {/* Header */}
                <div className="px-7 pt-6 pb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-nprimary dark:text-nlight mb-1">
                        Pre-publish review
                    </p>
                    <h1 className="text-xl font-bold tracking-tight text-dark-alpha dark:text-light-alpha leading-tight">
                        {quiz.title || 'Untitled Quiz'}
                    </h1>
                </div>

                {/* Content */}
                <div
                    data-lenis-prevent
                    className="px-7 pb-6 max-h-[420px] overflow-y-auto space-y-4"
                >
                    {/* Hero metrics row */}
                    <div className="grid grid-cols-4 gap-2.5">
                        <MetricCell label="Questions" value={String(questionCount)} />
                        <MetricCell label="Duration" value={formatTime(totalTime)} accent />
                        <MetricCell label="Total Pts" value={totalPoints.toLocaleString()} />
                        <MetricCell label="Multiplier" value={`${quiz.pointsMultiplier || 1}x`} />
                    </div>

                    {/* Two-column body */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {/* Left: Settings */}
                        <div className="bg-light-alpha dark:bg-dark-alpha border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">
                                Configuration
                            </span>

                            <div className="space-y-2">
                                {allSettings.map(({ label, enabled }) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span className="text-dark-alpha dark:text-light-alpha">
                                            {label}
                                        </span>
                                        <span
                                            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                                enabled
                                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/20'
                                                    : 'text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/15'
                                            }`}
                                        >
                                            {enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 dark:text-neutral-500">
                                        Elimination
                                    </span>
                                    <span className="font-mono font-medium text-dark-alpha dark:text-light-alpha">
                                        {quiz.eliminationThreshold > 0
                                            ? `${quiz.eliminationThreshold * 100}%`
                                            : 'Off'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 dark:text-neutral-500">
                                        Break time
                                    </span>
                                    <span className="font-mono font-medium text-dark-alpha dark:text-light-alpha">
                                        {formatTime(quiz.breakBetweenQuestions)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Interactions + Prize */}
                        <div className="space-y-2.5">
                            {/* Interactions */}
                            <div className="bg-light-alpha dark:bg-dark-alpha border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500">
                                    Reactions
                                </span>
                                {quiz.interactions.length > 0 ? (
                                    <InteractiveReactions interactions={quiz.interactions} />
                                ) : (
                                    <p className="text-sm text-neutral-400 dark:text-neutral-600 italic">
                                        None selected
                                    </p>
                                )}
                            </div>

                            {/* Prize pool */}
                            {quiz.prizePool > 0 ? (
                                <div className="bg-eta/5 dark:bg-eta/5 border border-eta/20 dark:border-eta/15 rounded-xl p-4 space-y-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-eta/70">
                                        Prize Pool
                                    </span>
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-xl font-bold font-mono text-eta">
                                            {quiz.prizePool}{' '}
                                            <span className="text-[11px] font-semibold tracking-wider">
                                                {quiz.currency || 'USDC'}
                                            </span>
                                        </span>
                                        <span className="text-sm text-neutral-500 dark:text-neutral-500">
                                            {quiz.prizeDistributions?.length || 0}{' '}
                                            {(quiz.prizeDistributions?.length || 0) === 1
                                                ? 'winner'
                                                : 'winners'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-4 flex items-center justify-center">
                                    <span className="text-sm text-neutral-400 dark:text-neutral-600">
                                        No prize pool configured
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-7 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-light-alpha/50 dark:bg-dark-alpha/50">
                    <button
                        onClick={onBackgroundClick}
                        className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <ToolTipComponent content="You will not be able to change the quiz after publishing">
                        <Button
                            onClick={onConfirm}
                            disabled={isLoading || isAlreadyPublished}
                            variant={null}
                            size={null}
                            className={`relative text-[13px] font-semibold px-6 py-2 rounded-lg transition-all cursor-pointer ${
                                isAlreadyPublished
                                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                                    : 'bg-nprimary text-white shadow-button hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_#000]'
                            }`}
                        >
                            {isLoading && (
                                <PiSpinnerThin className="animate-spin size-4 mr-2 inline" />
                            )}
                            {isAlreadyPublished ? 'Already Published' : 'Publish Quiz'}
                        </Button>
                    </ToolTipComponent>
                </div>
            </UtilityCard>
        </OpacityBackground>
    );
}

function MetricCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div
            className={`rounded-xl p-3.5 border ${
                accent
                    ? 'bg-nprimary/5 dark:bg-nprimary/8 border-nprimary/15 dark:border-nprimary/15'
                    : 'bg-light-alpha dark:bg-dark-alpha border-neutral-200 dark:border-neutral-800'
            }`}
        >
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 dark:text-neutral-500 block">
                {label}
            </span>
            <span
                className={`text-lg font-bold font-mono tracking-tight block mt-0.5 ${
                    accent
                        ? 'text-nprimary dark:text-nlight'
                        : 'text-dark-alpha dark:text-light-alpha'
                }`}
            >
                {value}
            </span>
        </div>
    );
}

interface AnimatingIcon {
    id: number;
    Icon: IconType;
    containerIndex: number;
}

function InteractiveReactions({ interactions }: { interactions: InteractionEnum[] }) {
    const [animatingIcons, setAnimatingIcons] = useState<AnimatingIcon[]>([]);

    const activeIcons = interactionIcons.filter(({ id }) => interactions.includes(id));

    function createAnimation(Icon: IconType, containerIndex: number) {
        const newIcon: AnimatingIcon = {
            id: Date.now() + Math.random(),
            Icon,
            containerIndex,
        };
        setAnimatingIcons((prev) => [...prev, newIcon]);
        setTimeout(() => {
            setAnimatingIcons((prev) => prev.filter((i) => i.id !== newIcon.id));
        }, 2200);
    }

    return (
        <div className="flex items-center gap-x-3">
            {activeIcons.map(({ id, Component, iconColor }, index) => (
                <div key={id} className="relative w-fit h-fit overflow-visible">
                    <Component
                        onClick={() => createAnimation(Component, index)}
                        size={22}
                        style={{ backgroundColor: '#00000070', color: '#EEEEEEca' }}
                        className="p-1.5 rounded-full transition-transform duration-200 ease-in-out hover:scale-110 cursor-pointer"
                    />
                    <AnimatePresence>
                        {animatingIcons
                            .filter((icon) => icon.containerIndex === index)
                            .map(({ id: animId, Icon }) => (
                                <motion.div
                                    key={animId}
                                    className="absolute left-1/2 top-1/2 pointer-events-none"
                                    initial={{
                                        opacity: 1,
                                        y: 0,
                                        x: '-50%',
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    animate={{
                                        opacity: 0,
                                        y: -120 - Math.random() * 100,
                                        x: '-50%',
                                        scale: 1 + Math.random(),
                                        rotate: Math.random() * 30 - 15,
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 2.2,
                                        ease: [0.23, 1, 0.32, 1],
                                        opacity: { duration: 2.2, ease: 'easeOut' },
                                        rotate: {
                                            duration: 0.3,
                                            ease: 'easeInOut',
                                            repeat: Infinity,
                                            repeatType: 'reverse',
                                        },
                                    }}
                                >
                                    <Icon
                                        size={22}
                                        className="drop-shadow-lg"
                                        style={{ color: iconColor }}
                                    />
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
