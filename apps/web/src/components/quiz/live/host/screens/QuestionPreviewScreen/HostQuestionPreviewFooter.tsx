import UtilityCard from '@/components/utility/UtilityCard';
import LiveQuizBackendActions from '@/lib/backend/live/live-quiz-backend-actions';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { IoIosReturnLeft } from 'react-icons/io';
import { FaLightbulb } from 'react-icons/fa';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import DifficultyTicker from '@/components/tickers/DifficultyTicker';
import { QuizType } from '@nocturn/types';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { cn } from '@/lib/utils';

export default function HostQuestionPreviewFooter() {
    const { quiz, currentQuestion, updateQuiz, updateCurrentQuestion } = useLiveQuizStore();
    const theme = quiz.template;
    const { session } = useUserSessionStore();
    const [openExplanation, setOpenExplanation] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { handleSendHostLaunchQuestion, handleUpdateCurrentQuestion } = useWebSocket();
    const [isQuestionAvailable, setIsQuestionAvailable] = useState<{ left: boolean, right: boolean }>({ left: true, right: true });

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
            prevQuestion();
        } else if (event.key === 'ArrowRight') {
            nextQuestion();
        }
    };

    function handleLaunchQuestion() {
        handleSendHostLaunchQuestion({
            questionId: currentQuestion?.id,
            questionIndex: currentQuestion?.orderIndex,
        });
    }

    useEffect(() => {
        function checkKeyPress(e: KeyboardEvent) {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && currentQuestion) {
                e.preventDefault();
                handleLaunchQuestion();
            }
        }

        document.addEventListener('keydown', checkKeyPress);
        return () => {
            document.removeEventListener('keydown', checkKeyPress);
        };
    });

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    });

    // this is for handling the arrows button active or disabled
    useEffect(() => {
        if (currentQuestion?.orderIndex === 0) setIsQuestionAvailable(prev => ({ left: false, right: prev.right }));
        else setIsQuestionAvailable(prev => ({ left: true, right: prev.right }));

        const questionCount = (quiz as QuizType & {
            _count: { questions: number };
        })._count.questions;
        if (currentQuestion?.orderIndex === questionCount - 1) setIsQuestionAvailable(prev => ({ left: prev.left, right: false }));
        else setIsQuestionAvailable(prev => ({ left: prev.left, right: true }));
    }, [currentQuestion]);

    async function handleUpdateQuestion(index: number, after: boolean) {

        if (!session?.user.token || !currentQuestion) {
            setLoading(false);
            return;
        }

        const data = await LiveQuizBackendActions.getUnAskedQuestion(session.user.token, quiz.id, { after, index: index });

        if (data?.end) {
            // no more questions left
        }
        if (data?.question) {
            if (quiz.questions) {
                updateQuiz({ questions: [...quiz.questions, data.question] });
            } else {
                updateQuiz({ questions: [data.question] });
            }

            updateCurrentQuestion(data.question);
            handleUpdateCurrentQuestion({
                questionId: data.question.id,
                questionIndex: data.question.orderIndex,
            });
        }
        setLoading(false);
    }

    function prevQuestion() {
        if (loading) return;
        if (!session?.user.token || !currentQuestion) return;
        if (!isQuestionAvailable.left) return;

        setLoading(true);

        if (quiz.questions && quiz.questions.length !== 0) {
            const questions = quiz.questions.sort((a, b) => b.orderIndex - a.orderIndex);
            const prevQuestion = questions.find(q => q.orderIndex < currentQuestion.orderIndex);
            if (prevQuestion) {
                updateCurrentQuestion(prevQuestion);
                handleUpdateCurrentQuestion({
                    questionId: prevQuestion.id,
                    questionIndex: prevQuestion.orderIndex,
                });
                setLoading(false);
                return;
            }
        }
        handleUpdateQuestion(currentQuestion.orderIndex, false);
    }

    async function nextQuestion() {
        if (loading) return;
        if (!session?.user.token || !currentQuestion) return;
        if (!isQuestionAvailable.right) return;

        setLoading(true);

        if (quiz.questions && quiz.questions.length !== 0) {
            const questions = quiz.questions.sort((a, b) => a.orderIndex - b.orderIndex);
            const nextQuestion = questions.find((q) => q.orderIndex > currentQuestion.orderIndex);
            if (nextQuestion) {
                updateCurrentQuestion(nextQuestion);
                handleUpdateCurrentQuestion({
                    questionId: nextQuestion.id,
                    questionIndex: nextQuestion.orderIndex,
                });
                setLoading(false);
                return;
            }
        }
        handleUpdateQuestion(currentQuestion.orderIndex, true);
    }

    const [platform, setPlatform] = useState<'mac' | 'windows' | 'other'>('other');
    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform.toLowerCase();

        if (platform.includes('mac') || userAgent.includes('mac')) {
            setPlatform('mac');
        } else if (platform.includes('win') || userAgent.includes('win')) {
            setPlatform('windows');
        }
    }, []);

    return (
        <div className="absolute bottom-4 left-4 z-100">
            <section className="flex items-center flex-shrink-0 gap-x-6 relative">
                <div className="w-fit flex items-center justify-center gap-x-4 relative">
                    <ToolTipComponent content="previous question">
                        <BsArrowLeft
                            onClick={prevQuestion}
                            strokeWidth={0.8}
                            style={{
                                border: `1px solid ${theme.borderColor}50`,
                                backgroundColor: `${theme.textColor}20`,
                                opacity: !isQuestionAvailable.left ? 0.5 : 1,
                            }}
                            size={32}
                            className={cn(
                                `rounded-full p-1.5 cursor-pointer`,
                                !isQuestionAvailable.left ? 'cursor-not-allowed' : 'cursor-pointer',
                            )}
                        />
                    </ToolTipComponent>
                    <div
                        className="relative"
                        onMouseEnter={() => setOpenExplanation(true)}
                        onMouseLeave={() => setOpenExplanation(false)}
                    >
                        <FaLightbulb
                            strokeWidth={0.8}
                            style={{
                                border: `1px solid ${theme.borderColor}50`,
                                backgroundColor: `${theme.textColor}20`,
                            }}
                            size={32}
                            className="rounded-full p-1.5 cursor-pointer"
                        />
                        {openExplanation && currentQuestion?.hint && (
                            <UtilityCard className="absolute bottom-10 min-w-[16rem] w-fit px-4 py-2 text-wrap">
                                <div className="text-sm tracking-wide dark:text-light-base text-dark-alpha font-light">
                                    {currentQuestion?.hint}
                                </div>
                            </UtilityCard>
                        )}
                    </div>
                    <ToolTipComponent content="next question">
                        <BsArrowRight
                            onClick={nextQuestion}
                            strokeWidth={0.8}
                            style={{
                                border: `1px solid ${theme.borderColor}50`,
                                backgroundColor: `${theme.textColor}20`,
                                opacity: !isQuestionAvailable.right ? 0.5 : 1,
                            }}
                            size={32}
                            className={cn(
                                `rounded-full p-1.5 cursor-pointer`,
                                !isQuestionAvailable.right ? 'cursor-not-allowed' : 'cursor-pointer',
                            )}
                        />
                    </ToolTipComponent>
                </div>
                <DifficultyTicker
                    className="font-light tracking-wide bg-light-base dark:bg-dark-base px-4 rounded-full"
                    difficulty={currentQuestion?.difficulty}
                />
                <div className="flex justify-center group">
                    <div
                        onClick={() => handleLaunchQuestion()}
                        className="flex items-center gap-x-1.5 bg-neutral-100 w-fit px-4 py-2.5 rounded-full shadow-md z-10"
                    >
                        <div className="text-xs text-neutral-700 font-light tracking-wide">
                            Press
                        </div>
                        <ToolTipComponent content="Pressing enter will launch the current question previewing on the screen">
                            <span className="bg-neutral-900 text-neutral-100 text-xs font-light tracking-wider px-3 py-1 rounded-lg flex items-center justify-center gap-x-2 cursor-pointer">
                                <IoIosReturnLeft className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden" />
                                {platform === 'mac' ? '⌘' : 'Ctrl'} + ENTER
                            </span>
                        </ToolTipComponent>
                        <div className="text-xs text-neutral-700 font-light tracking-wide">
                            to launch this question
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

