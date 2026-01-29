import { Template } from '@/lib/templates';
import { QuizType } from '@nocturn/types';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { toast } from 'sonner';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import ToolTipComponent from '../utility/TooltipComponent';
import { PiPresentationChart, PiTrashSimple } from 'react-icons/pi';
import { useRouter } from 'next/navigation';

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
    const { deleteQuiz } = useAllQuizsStore();

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

    return (
        <div
            key={quiz.id}
            className="dark:bg-neutral-800/40 bg-light-base rounded-[8px] relative flex items-center gap-x-3 p-2 border dark:border-neutral-800/40 border-neutral-300 group"
        >
            <div className="flex items-center gap-x-3 w-[85%] h-full">
                {currTemplate && (
                    <div className="relative group flex items-center gap-x-2">
                        <EmptyCanvas
                            className="w-20 h-14 !rounded-[11px] border border-neutral-400/50 dark:border-none cursor-auto"
                            template={currTemplate}
                        />
                        <div
                            onClick={() => toggleQuizSelection(quiz.id)}
                            className="text-dark-base flex justify-center items-center rounded-[4px] cursor-pointer absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-all transform duration-200"
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
                    <div className="min-w-0 flex flex-col items-around justify-between h-full py-1">
                        <span className="block text-normal truncate">{quiz.title}</span>

                        <span className="block dark:text-light-base/60 text-black/60 text-[13px] flex items-center gap-x-3 tracking-wide">
                            <span>Deleted at {formattedTime}</span>

                            <span>Created by {quiz.host?.name}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-x-2.5 opacity-0 group-hover:opacity-100 transition-all transform duration-200">
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
    );
}
