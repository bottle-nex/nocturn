import { Template } from '@/lib/templates';
import { QuizStatusEnum, QuizType } from '@nocturn/types';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { toast } from 'sonner';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import ToolTipComponent from '../utility/TooltipComponent';
import { PiPresentationChart, PiTrashSimple } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FaRegClone } from 'react-icons/fa6';
import { BsDot } from 'react-icons/bs';
import { useState } from 'react';
import QuizStatusTicker from '../tickers/QuizstatusTicker';
import { BiPencil } from 'react-icons/bi';
import QuizTitleChangePanel from './QuizTitleChangePanel';

interface MyQuizzesListViewProps {
    formattedTime: string;
    currTemplate: Template;
    quiz: QuizType;
    isSelected: boolean;
    toggleQuizSelection: (quizId: string) => void;
}

export default function MyQuizzesListView({
    formattedTime,
    currTemplate,
    quiz,
    isSelected,
    toggleQuizSelection,
}: MyQuizzesListViewProps) {
    const { session } = useUserSessionStore();
    const router = useRouter();
    const { deleteQuiz, addQuiz } = useAllQuizsStore();
    const [showQuizTitleChangePanel, setShowQuizTitleChangePanel] = useState<boolean>(false);

    async function handleDeleteQuiz(id: string) {
        if (!session?.user.token) return;
        try {
            await QuizActions.delete_quiz(session.user.token, id);
            deleteQuiz(id);
            toast.success('Quiz deleted successfully');
        } catch {
            toast.error('Failed to delete the quiz');
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
        <div
            key={quiz.id}
            onClick={() => router.push(`/new/${quiz.id}`)}
            data-lenis-prevent
            className={cn(
                'dark:bg-neutral-800/40 bg-light-base rounded-[8px]',
                'relative flex items-center gap-x-3 p-2',
                'border group cursor-pointer overflow-y-auto',
                isSelected
                    ? 'border border-indigo-800'
                    : 'dark:border-neutral-800/40 border-neutral-300 ',
            )}
        >
            <div className="flex items-center gap-x-3 max-w-[85%] w-full h-full">
                {currTemplate && (
                    <div className="relative group flex items-center gap-x-2">
                        <EmptyCanvas
                            className={cn('w-20 h-14 !rounded-[8px] cursor-auto')}
                            template={currTemplate}
                        />
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleQuizSelection(quiz.id);
                            }}
                            className={`text-dark-base flex justify-center items-center rounded-alpha cursor-pointer absolute top-1 left-1 transition-all transform duration-200 ${
                                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            {isSelected ? (
                                <MdCheckBox className="size-6 text-indigo-700" />
                            ) : (
                                <MdCheckBoxOutlineBlank className="size-6 text-indigo-700" />
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-between justify-start gap-x-2.5 px-1 h-full">
                    <div className="min-w-0 flex flex-col items-around justify-between h-12 max-w-180">
                        <span className="block text-normal dark:text-light-base text-dark-base truncate">
                            {quiz.title}
                        </span>

                        <span className="block dark:text-light-base/60 text-black/60 text-[13px] flex items-center gap-x-1 tracking-wide">
                            <span>Created at {formattedTime}</span>
                            <BsDot />
                            <span>{quiz.host?.name}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center w-[15%] px-5 opacity-0 group-hover:opacity-100 transition-all transform duration-200">
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
                        onClick={() => setShowQuizTitleChangePanel((prev) => !prev)}
                        className="bg-light-base text-dark-base h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                    >
                        <BiPencil className="size-5" />
                    </div>
                </ToolTipComponent>

                <ToolTipComponent content="duplicate">
                    <div
                        onClick={() => handleDuplicateQuiz(quiz.id)}
                        className="bg-light-base text-dark-base h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                    >
                        <FaRegClone className="size-4.5" />
                    </div>
                </ToolTipComponent>

                <ToolTipComponent content="delete">
                    <div
                        onClick={() => {
                            toggleQuizSelection(quiz.id);
                            handleDeleteQuiz(quiz.id);
                        }}
                        className="bg-light-base text-pink-600 h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                    >
                        <PiTrashSimple className="size-5 stroke-3" />
                    </div>
                </ToolTipComponent>
            </div>
            {showQuizTitleChangePanel && (
                <QuizTitleChangePanel
                    quizId={quiz.id}
                    setShowQuizTitleChangePanel={setShowQuizTitleChangePanel}
                />
            )}
        </div>
    );
}
