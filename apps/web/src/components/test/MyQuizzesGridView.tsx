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
import { QuizType } from '@nocturn/types';
import HeartButton from '../ui/HeartButton';
import { Template } from '@/lib/templates';

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
    const { updateQuizFavourite, deleteQuiz } = useAllQuizsStore();

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
        <div key={quiz.id} className="max-w-[400px] w-full p-1 flex flex-col relative group">
            <div
                className={cn(
                    'absolute top-5 z-50 pr-6 pl-4 flex justify-between gap-x-2 w-full transition-all duration-300',
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
            >
                <div
                    onClick={() => toggleQuizSelection(quiz.id)}
                    className="text-dark-base flex justify-center items-center rounded-[4px] cursor-pointer"
                >
                    {isSelected ? (
                        <MdCheckBox className="size-6 text-indigo-700" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="size-6 text-indigo-700" />
                    )}
                </div>

                <div className="flex gap-x-2.5">
                    <ToolTipComponent content="delete">
                        <div
                            onClick={() => {
                                toggleQuizSelection(quiz.id);
                                handleDeleteQuiz(quiz.id);
                            }}
                            className="bg-light-base text-dark-base h-8 w-8 flex justify-center items-center rounded-[4px] ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                        >
                            <PiTrashSimple className="size-5" />
                        </div>
                    </ToolTipComponent>

                    <ToolTipComponent content="launch">
                        <div
                            onClick={() => router.push(`/new/${quiz.id}`)}
                            className="bg-light-base text-dark-base h-8 w-8 flex justify-center items-center rounded-[4px] ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                        >
                            <PiPresentationChart className="size-5" />
                        </div>
                    </ToolTipComponent>
                </div>
            </div>

            <EmptyCanvas
                onClick={() => router.push(`/new/${quiz.id}`)}
                question={quiz.questions[0].question}
                options={quiz.questions[0].options}
                className={cn(
                    'w-full aspect-video rounded-[10px] outline-2 select-none',
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
        </div>
    );
}
