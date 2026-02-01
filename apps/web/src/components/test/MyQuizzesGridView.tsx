import { cn } from '@/lib/utils';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { useRouter } from 'next/navigation';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import Image from 'next/image';
import { QuizType } from '@nocturn/types';
import HeartButton from '../ui/HeartButton';
import { Template } from '@/lib/templates';
import { useState } from 'react';
import QuizTitleChangePanel from './QuizTitleChangePanel';
import PreviewQuiz from '../home/AiChat/PreviewQuiz';
import QuizOptionsPanel from './QuizOptionsPanel';

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
    const { updateQuizFavourite } = useAllQuizsStore();
    const [showQuizTitleChangePanel, setShowQuizTitleChangePanel] = useState<boolean>(false);
    const [showPreview, setShowPreview] = useState<boolean>(false);

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
            className="max-w-100 w-full p-1 flex flex-col relative group "
            data-lenis-prevent
        >
            <div
                className={cn(
                    'absolute top-5 z-10 pr-6 pl-4 flex justify-between gap-x-2 w-full transition-all duration-100',
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

                <QuizOptionsPanel
                    quiz={quiz}
                    toggleQuizSelection={toggleQuizSelection}
                    setShowQuizTitleChangePanel={setShowQuizTitleChangePanel}
                    setShowPreview={setShowPreview}
                />
            </div>

            <EmptyCanvas
                onClick={() => router.push(`/new/${quiz.id}`)}
                question={quiz.questions[0].question}
                options={quiz.questions[0].options}
                className={cn(
                    'w-full aspect-video rounded-[8px] outline select-none ',
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
                <PreviewQuiz
                    onPreviewClose={() => setShowPreview(false)}
                    quizId={quiz.id}
                    fetchFromServer
                />
            )}
        </div>
    );
}
