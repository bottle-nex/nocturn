'use client';

import { Button } from '@/components/ui/button';
import OpacityBackground from '@/components/utility/OpacityBackground';
import UtilityCard from '@/components/utility/UtilityCard';
import userQuizAction from '@/lib/backend/base/user-quiz-action';
import { cn } from '@/lib/utils';
import { useRejoinPanelStore } from '@/store/base/useRejoinPanelStore';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RejoinDetectedPanelProps {
    deny: () => void;
}

const points = [
    'Do not exit full-screen mode during the session.',
    'Avoid using the TAB or ESC keys.',
    'You are allowed a maximum of three attempts; further violations will restrict access.',
];

export default function RejoinDetectedPanel({ deny }: RejoinDetectedPanelProps) {

    const { description, joinAs, joinBack, joinData, setData, setJoinData, setActive } = useRejoinPanelStore();
    const router = useRouter();

    function handleJoinBack() {
        router.push(`${joinBack}`);
    }

    async function handleJoinAs() {
        if (!joinData.code) return;
        const quizId = await userQuizAction.joinQuiz(joinData.code.trim(), joinData.email || undefined, joinData.name || undefined, true);
        setJoinData(null, null, null);
        setData(null, null, null);
        setActive(false);

        console.log('quiz-id: ', quizId);
        if (!quizId) return;
        router.push(`/live/${quizId}`);
    }

    return (
        <OpacityBackground className="dark:bg-neutral-900/30 backdrop-blur-[1px]">
            <UtilityCard
                className={cn(
                    'bg-neutral-900 border border-neutral-700 shadow-2xl',
                    'rounded-2xl p-8 max-w-2xl w-full mx-auto',
                    'flex flex-col items-start gap-y-6',
                )}
            >
                <div className="flex items-center gap-x-3 w-full">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-100">
                            Rejoin Detected
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">
                            {description}
                        </p>
                    </div>
                </div>

                {/* <div className="w-full">
                    <div className="space-y-3">
                        {points.map((point, index) => (
                            <div key={index} className="flex items-start gap-x-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2 flex-shrink-0" />
                                <p className="text-neutral-300 text-sm leading-relaxed">{point}</p>
                            </div>
                        ))}
                    </div>
                </div>
 */}
                <div className="w-full flex justify-end items-center gap-x-3 pt-2">
                    {joinAs ? (
                        <Button
                            variant="outline"
                            className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 px-6"
                            onClick={handleJoinAs}
                        >
                            {"Join as " + joinAs.toLowerCase()}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="bg-transparent border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 px-6"
                            onClick={deny}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200 px-6 font-medium"
                        onClick={handleJoinBack}
                    >
                        Join back
                    </Button>
                </div>
            </UtilityCard>
        </OpacityBackground>
    );
}
