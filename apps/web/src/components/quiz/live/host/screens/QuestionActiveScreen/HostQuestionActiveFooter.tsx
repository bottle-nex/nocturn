import UtilityCard from '@/components/utility/UtilityCard';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { templates } from '@/lib/templates';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { JSX, useEffect, useState } from 'react';
import { FaLightbulb } from 'react-icons/fa6';

export default function HostQuestionActiveFooter(): JSX.Element {
    const [openExplanation, setOpenExplanation] = useState(false);
    const [hintLaunched, setHintLaunched] = useState(false);

    const { handleLaunchHintEvent } = useWebSocket();
    const { currentQuestion, quiz } = useLiveQuizStore();
    const template = templates.find((t) => t.id === quiz?.theme);

    useEffect(() => {
        setHintLaunched(false);
    }, [currentQuestion?.id]);

    function emitHintsHandler() {
        if (!currentQuestion) return;
        if (!currentQuestion.hint || currentQuestion.hint.trim().length === 0) return;

        handleLaunchHintEvent({
            questionId: currentQuestion.id,
        });
        setHintLaunched(true);
    }

    return (
        <div
            style={{
                zIndex: 100,
                color: template?.text_color,
            }}
            className="absolute bottom-4 left-4 flex items-center justify-start gap-x-4 w-fit"
        >
            <div className="relative">
                {openExplanation && currentQuestion?.hint && (
                    <UtilityCard className="absolute bottom-11 min-w-[16rem] w-fit px-4 py-2 text-wrap">
                        <div className="text-sm tracking-wide dark:text-light-base text-dark-primary font-light">
                            {currentQuestion?.hint}
                        </div>
                    </UtilityCard>
                )}

                <button
                    onMouseEnter={() => setOpenExplanation(true)}
                    onMouseLeave={() => setOpenExplanation(false)}
                    type="button"
                    disabled={!currentQuestion?.hint || hintLaunched}
                    className={`dark:bg-dark-base dark:text-neutral-100 bg-neutral-300 text-black 
                        px-4 py-1.5 rounded-md border text-xs
                        ${
                            hintLaunched
                                ? 'opacity-50 cursor-not-allowed'
                                : 'dark:hover:-translate-y-0.5 cursor-pointer'
                        }
                    `}
                    onClick={emitHintsHandler}
                >
                    <div className="flex items-center justify-center gap-x-2">
                        <FaLightbulb
                            strokeWidth={0.8}
                            className="w-6 h-6 rounded-full p-1.5"
                            style={{
                                border: `1px solid ${template?.border_color}50`,
                                backgroundColor: `${template?.text_color}20`,
                            }}
                        />
                        {hintLaunched ? 'hint launched' : 'launch hint'}
                    </div>
                </button>
            </div>
        </div>
    );
}
