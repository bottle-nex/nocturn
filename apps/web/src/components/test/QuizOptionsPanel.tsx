'use client';
import { QuizStatusEnum, QuizType } from '@nocturn/types';
import QuizStatusTicker from '../tickers/QuizstatusTicker';
import ToolTipComponent from '../utility/TooltipComponent';
import { PiPresentationChart, PiTrashSimple } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { BiPencil } from 'react-icons/bi';
import { FaRegClone } from 'react-icons/fa6';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { toast } from 'sonner';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { VscPreview } from 'react-icons/vsc';

interface QuizOptionsPanelProps {
    quiz: QuizType;
    toggleQuizSelection?: (quizId: string) => void;
    setShowQuizTitleChangePanel: (val: boolean) => void;
    setShowPreview?: (val: boolean) => void;
}

export default function QuizOptionsPanel({
    quiz,
    toggleQuizSelection,
    setShowQuizTitleChangePanel,
    setShowPreview,
}: QuizOptionsPanelProps) {
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { deleteQuiz, addQuiz } = useAllQuizsStore();

    async function handleDeleteQuiz(quizId: string) {
        if (!session?.user.token) return;
        try {
            const res = await QuizActions.delete_quiz(session.user.token, quizId);
            if (res) {
                deleteQuiz(quizId);
                toast.success('Deleted quiz successfully');
            }
        } catch {
            console.error('Failed to delete the quiz');
        }
    }

    async function handleDuplicateQuiz(quizId: string) {
        if (!session?.user.token) return;
        try {
            const duplicatedQuiz = await QuizActions.duplicate_quiz(session.user.token, quizId);
            if (duplicatedQuiz) {
                addQuiz(duplicatedQuiz);
            }
        } catch (error) {
            console.error('Error in duplicating quiz: ', error);
            return;
        }
    }

    return (
        <div className="flex gap-x-2.5 items-center z-10">
            {quiz.status === QuizStatusEnum.LIVE && (
                <QuizStatusTicker className="!rounded-[px]" status={quiz.status} />
            )}

            {quiz.status === QuizStatusEnum.COMPLETED && (
                <ToolTipComponent content="results">
                    <div
                        onClick={() => router.push(`/new/${quiz.id}`)}
                        className="bg-light-base text-dark-base h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                    >
                        <PiPresentationChart className="size-5" />
                    </div>
                </ToolTipComponent>
            )}

            <ToolTipComponent content="rename">
                <div
                    onClick={() => setShowQuizTitleChangePanel(false)}
                    className="bg-light-base/70 backdrop-blur-xs text-dark-base h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                >
                    <BiPencil className="size-5" />
                </div>
            </ToolTipComponent>

            <ToolTipComponent content="preview">
                <div
                    onClick={() => setShowPreview!(true)}
                    className="bg-light-base/70 backdrop-blur-sm text-dark-base h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                >
                    <VscPreview className="size-5" />
                </div>
            </ToolTipComponent>

            <ToolTipComponent content="duplicate">
                <div
                    onClick={() => handleDuplicateQuiz(quiz.id)}
                    className="bg-light-base/70 backdrop-blur-sm text-dark-base h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                >
                    <FaRegClone className="size-4" />
                </div>
            </ToolTipComponent>

            <ToolTipComponent content="delete">
                <div
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (toggleQuizSelection) {
                            toggleQuizSelection(quiz.id);
                        }
                        handleDeleteQuiz(quiz.id);
                    }}
                    className="bg-light-base/70 backdrop-blur-sm text-pink-600 h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                >
                    <PiTrashSimple className="size-5 stroke-3" />
                </div>
            </ToolTipComponent>
        </div>
    );
}
