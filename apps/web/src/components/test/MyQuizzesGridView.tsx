import { cn } from '@/lib/utils';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import ToolTipComponent from '../utility/TooltipComponent';
import { PiPresentationChart, PiTrashSimple } from 'react-icons/pi';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { useRouter } from 'next/navigation';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { toast } from 'sonner';
import Image from 'next/image';
import { QuizStatusEnum, QuizType } from '@nocturn/types';
import HeartButton from '../ui/HeartButton';
import { Template } from '@/lib/templates';
import QuizStatusTicker from '../tickers/QuizstatusTicker';
import { FaRegClone } from 'react-icons/fa6';
import { BiPencil } from 'react-icons/bi';
import { useState } from 'react';
import QuizTitleChangePanel from './QuizTitleChangePanel';
import { VscPreview } from 'react-icons/vsc';
import PreviewQuiz from '../home/AiChat/PreviewQuiz';
import PreviewQuizSkeleton from '../skeletons/PreviewQuizSkeleton';

interface MyQuizzesGridViewProps {
    formattedTime: string;
    currTemplate: Template;
    quiz: QuizType;
    isSelected: boolean;
    toggleQuizSelection: (quizId: string) => void;
}

export default function MyQuizzesGridView({
    quiz,
    isSelected,
    toggleQuizSelection,
    currTemplate,
    formattedTime,
}: MyQuizzesGridViewProps) {
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { updateQuizFavourite, deleteQuiz, addQuiz } = useAllQuizsStore();
    const [showQuizTitleChangePanel, setShowQuizTitleChangePanel] = useState<boolean>(false);
    const [showPreview, setShowPreview] = useState<boolean>(false);

    async function handleDeleteQuiz(quizId: string) {
        if (!session?.user.token) return;
        try {
            await QuizActions.delete_quiz(session.user.token, quizId);
            deleteQuiz(quizId);
            toast.success('Quiz deleted successfully');
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

    async function handleFavouriteToggle(quizId: string, isFavourite: boolean) {
        if (!session?.user.token) return;

        try {
            await QuizActions.toggle_favourite_quiz(session.user.token, quizId, isFavourite);
            updateQuizFavourite(quizId, isFavourite);
        } catch (error) {
            console.error('Error in adding quiz to favourites:', error);
        }
    }

    return (
        <div
            key={quiz.id}
            className="max-w-[400px] w-full p-1 flex flex-col relative group "
            data-lenis-prevent
        >
            <div
                className={cn(
                    'absolute top-5 z-50 pr-6 pl-4 flex justify-between gap-x-2 w-full transition-all duration-100',
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
            >
                <div
                    onClick={() => toggleQuizSelection(quiz.id)}
                    className="text-dark-base flex justify-center items-center rounded-alpha cursor-pointer"
                >
                    {isSelected ? (
                        <MdCheckBox className="size-6 text-indigo-700" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="size-6 text-indigo-700" />
                    )}
                </div>

                <div className="flex gap-x-2.5 items-center">
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
                            className="bg-light-base/70 backdrop-blur-sm text-dark-base h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                        >
                            <BiPencil className="size-5" />
                        </div>
                    </ToolTipComponent>

                    <ToolTipComponent content="preview">
                        <div
                            onClick={() => setShowPreview(true)}
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
                            onClick={() => {
                                toggleQuizSelection(quiz.id);
                                handleDeleteQuiz(quiz.id);
                            }}
                            className="bg-light-base/70 backdrop-blur-sm text-pink-600 h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                        >
                            <PiTrashSimple className="size-5 stroke-3" />
                        </div>
                    </ToolTipComponent>
                </div>
            </div>

            <EmptyCanvas
                onClick={() => router.push(`/new/${quiz.id}`)}
                question={quiz.questions[0].question}
                options={quiz.questions[0].options}
                className={cn(
                    'w-full aspect-video rounded-[8px] outline-2 select-none',
                    isSelected ? 'outline-indigo-600' : 'outline-black/40 dark:outline-white/40',
                )}
                template={currTemplate}
            />

            <div className="flex items-center gap-x-2.5 pt-2">
                {quiz.host?.image && (
                    <Image
                        src={quiz.host.image}
                        width={32}
                        height={32}
                        alt="user-logo"
                        className="rounded-full"
                    />
                )}

                <div className="flex items-center justify-between w-full">
                    <div>
                        <span className="block text-normal mt-1 text-dark-base dark:text-light-base">
                            {quiz.title?.slice(0, 28)}…
                        </span>
                        <span className="block dark:text-white/60 text-black/60 text-[13px]">
                            last viewed {formattedTime}
                        </span>
                    </div>
                    <HeartButton
                        liked={quiz.isFavourite}
                        onToggle={(toggle) => handleFavouriteToggle(quiz.id, toggle)}
                    />
                </div>
            </div>

            {showQuizTitleChangePanel && (
                <QuizTitleChangePanel
                    quizId={quiz.id}
                    setShowQuizTitleChangePanel={setShowQuizTitleChangePanel}
                />
            )}

            {showPreview && (
                <PreviewQuizSkeleton onPreviewClose={() => setShowPreview(false)} />
            )}
        </div>
    );
}
