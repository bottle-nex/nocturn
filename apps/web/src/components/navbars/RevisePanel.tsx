import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { QuizStatusEnum, InteractionEnum } from '@nocturn/types';
import { Button } from '../ui/button';
import OpacityBackground from '../utility/OpacityBackground';
import UtilityCard from '../utility/UtilityCard';
import { PiSpinnerThin } from 'react-icons/pi';
import { FaHeart, FaLightbulb } from 'react-icons/fa6';
import { BsFillHandThumbsUpFill } from 'react-icons/bs';
import { MdEmojiEmotions } from 'react-icons/md';
import { PiCurrencyCircleDollarFill } from 'react-icons/pi';

interface RevisePanelProps {
    onBackgroundClick: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

const interactionIcons = {
    [InteractionEnum.HEART]: FaHeart,
    [InteractionEnum.DOLLAR]: PiCurrencyCircleDollarFill,
    [InteractionEnum.BULB]: FaLightbulb,
    [InteractionEnum.THUMBS_UP]: BsFillHandThumbsUpFill,
    [InteractionEnum.SMILE]: MdEmojiEmotions,
};

export default function RevisePanel({ onBackgroundClick, onConfirm, isLoading }: RevisePanelProps) {
    const { quiz } = useNewQuizStore();

    const questionCount = quiz.questions.length;
    const totalAnswerTime = quiz.questions.reduce(
        (acc, q) => acc + (q.timeLimit || quiz.questionTimeLimit),
        0,
    );
    const totalReadingTime = quiz.questions.reduce((acc, q) => acc + (q.readingTime || 0), 0);
    const totalBreakTime = Math.max(0, questionCount - 1) * quiz.breakBetweenQuestions;
    const totalTime = totalAnswerTime + totalReadingTime + totalBreakTime;
    const totalPoints = quiz.questions.reduce(
        (acc, q) => acc + (q.basePoints || quiz.basePointsPerQuestion),
        0,
    );

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const isAlreadyPublished =
        quiz.status === QuizStatusEnum.PUBLISHED || quiz.status === QuizStatusEnum.LIVE;

    return (
        <OpacityBackground onBackgroundClick={onBackgroundClick} escapeClosing>
            <UtilityCard className="max-w-sm w-full bg-white dark:bg-[#0D0D0D] rounded-lg p-0 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-4">
                    <div className="w-full flex flex-col items-start">
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-1 flex justify-between gap-x-1.5">
                            <span className='uppercase font-semibold tracking-wider'>Final Review</span> 
                            <span>
                                {"("}You won't be able to make any changes after this{")"}
                            </span>
                        </p>
                    </div>
                    <h1 className="text-xl font-semibold tracking-normal text-neutral-900 dark:text-neutral-100">
                        Quiz Title:{" "} {quiz.title || 'Untitled Quiz'}
                    </h1>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-y-4">

                    <section className="space-y-2">
                        <SectionLabel label="General" />
                        <div className="space-y-1.5">
                            <Row label="Questions" value={questionCount} />
                            <Row label="Duration" value={formatTime(totalTime)} />
                        </div>
                    </section>

                    <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800/50" />

                    <section className="space-y-2">
                        <SectionLabel label="Settings" />
                        <div className="space-y-1.5">
                            <Row
                                label="Live Chat"
                                value={quiz.liveChat ? 'Enabled' : 'Off'}
                                isStatus
                                active={quiz.liveChat}
                            />
                            <Row
                                label="Time Bonus"
                                value={quiz.timeBonus ? 'On' : 'Off'}
                                isStatus
                                active={quiz.timeBonus}
                            />
                            <Row
                                label="Elimination"
                                value={
                                    quiz.eliminationThreshold > 0
                                        ? `${quiz.eliminationThreshold * 100}%`
                                        : 'Off'
                                }
                            />
                        </div>
                    </section>

                    <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800/50" />

                    <section className="space-y-2">
                        <SectionLabel label="Experience" />
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                                    Reactions
                                </span>
                                <StaticReactions interactions={quiz.interactions} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                                    Prize Pool
                                </span>
                                <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                                    <span className="text-[12px] font-mono font-bold text-blue-500 tracking-tight">
                                        {quiz.prizePool} {quiz.currency || 'SOL'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/20 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <button
                        onClick={onBackgroundClick}
                        className="text-[12px] font-medium text-neutral-400 hover:text-neutral-500 transition-colors cursor-pointer"
                    >
                        Go back
                    </button>

                    <Button
                        onClick={onConfirm}
                        disabled={isLoading || isAlreadyPublished}
                        className={`px-5 py-2 rounded-sm text-[12px] font-semibold transition-all shadow-sm ${
                            isAlreadyPublished
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                                : 'bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90'
                        }`}
                    >
                        {isLoading && <PiSpinnerThin className="animate-spin size-3 mr-2 inline" />}
                        {isAlreadyPublished ? 'Published' : 'Confirm Publish'}
                    </Button>
                </div>
            </UtilityCard>
        </OpacityBackground>
    );
}

function SectionLabel({ label }: { label: string }) {
    return (
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400/80 dark:text-neutral-500/80 block">
            {label}
        </span>
    );
}

function Row({
    label,
    value,
    isStatus,
    active,
}: {
    label: string;
    value: string | number;
    isStatus?: boolean;
    active?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[13px] text-neutral-600 dark:text-neutral-300">{label}</span>
            <span
                className={`text-[13px] font-mono tabular-nums ${
                    isStatus
                        ? active
                            ? 'text-emerald-500 font-bold'
                            : 'text-neutral-400'
                        : 'text-neutral-900 dark:text-neutral-100 font-medium'
                }`}
            >
                {value}
            </span>
        </div>
    );
}

function StaticReactions({ interactions }: { interactions: InteractionEnum[] }) {
    if (!interactions || interactions.length === 0)
        return <span className="text-[12px] text-neutral-400 italic">None</span>;

    return (
        <div className="flex items-center gap-x-2">
            {interactions.map((id) => {
                const Icon = interactionIcons[id];
                return Icon ? (
                    <Icon key={id} size={14} className="text-neutral-300 dark:text-neutral-600" />
                ) : null;
            })}
        </div>
    );
}
