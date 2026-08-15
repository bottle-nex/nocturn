'use client';
import { Button } from '@/components/ui/button';
import CountDownClock from '@/components/ui/CountDownClock';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import LiveQuizBackendActions from '@/lib/backend/live/live-quiz-backend-actions';
import { cn } from '@/lib/utils';
import { useLiveQuizHostStore } from '@/store/live-quiz/useLiveQuizHostStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { HostScreenEnum } from '@nocturn/types';
import { useEffect, useState } from 'react';
import { MdNavigateNext } from 'react-icons/md';
import QuestionLeaderboardDisplay from '../../../common/QuestionLeaderboardDisplay';

export default function HostQuestionResultsRenderer() {
    const { handleHostQuestionPreviewPageChange } = useWebSocket();
    const {
        currentQuestion,
        gameSession,
        updateGameSession,
        updateCurrentQuestion,
        quiz,
        updateQuiz,
    } = useLiveQuizStore();
    const { emptyLiveResponses } = useLiveQuizHostStore();
    const [quizEnded, setQuizEnded] = useState<boolean>(false);
    const { handleHostQuizResults, handleUpdateCurrentQuestion } = useWebSocket();
    const { session } = useUserSessionStore();
    useEffect(() => {
        emptyLiveResponses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!currentQuestion || !gameSession) {
        return (
            <div className="text-center text-neutral-400 w-full">
                Error in getting current question
            </div>
        );
    }

    async function handleOnNextQuestion() {
        if (!session?.user.token) return;

        if (quizEnded) {
            handleHostQuizResults({});
        } else {
            if (!quiz.questions || quiz.questions.length === 0) {
                const data = await LiveQuizBackendActions.getUnAskedQuestion(
                    session.user.token,
                    quiz.id,
                );
                if (data?.end) {
                    setQuizEnded(true);
                    return;
                }
                if (data?.question) {
                    updateQuiz({ questions: [data?.question] });
                }
            }
            const question = quiz.questions[0];
            updateCurrentQuestion(question);
            handleUpdateCurrentQuestion({
                questionId: question.id,
                questionIndex: question.orderIndex,
            });
            handleHostQuestionPreviewPageChange(HostScreenEnum.QUESTION_PREVIEW);
            updateGameSession?.({ hostScreen: HostScreenEnum.QUESTION_PREVIEW });
        }
    }

    return (
        <div className={cn('w-full h-full overflow-hidden flex flex-col', 'relative')}>
            <div
                className="w-full text-lg text-center pt-4 px-4 shrink-0"
                dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
            />

            <div className="flex-1 min-h-0">
                <QuestionLeaderboardDisplay />
            </div>

            <div className="shrink-0 flex items-center justify-center gap-x-4 pb-3">
                <CountDownClock
                    startTime={gameSession.phaseStartTime!}
                    endTime={gameSession.phaseEndTime!}
                />
            </div>

            <Button
                className={cn(
                    'absolute bottom-4 left-5 cursor-pointer z-50 flex items-center justify-center gap-x-1 group',
                    'bg-green-600 dark:bg-green-600 text-white dark:text-white text-xs hover:bg-green-700 dark:hover:bg-green-700',
                    'px-3.5 pl-4! py-1.5 text-xs rounded-md tracking-wider',
                    'hover:-translate-y-0.5 transition-all transform duration-150',
                )}
                onClick={handleOnNextQuestion}
            >
                {quizEnded ? 'Final Results' : 'Next Question'}
                <MdNavigateNext className="group-hover:translate-x-0.5 transform ease-in duration-150" />
            </Button>
        </div>
    );
}
