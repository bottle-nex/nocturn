import { QuizType, TemplateType } from '@nocturn/types';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BsDot } from 'react-icons/bs';
import { useState } from 'react';
import QuizTitleChangePanel from './QuizTitleChangePanel';
import QuizOptionsPanel from './QuizOptionsPanel';

interface MyQuizzesListViewProps {
    formattedTime: string;
    currTemplate: TemplateType;
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
    const router = useRouter();
    const [showQuizTitleChangePanel, setShowQuizTitleChangePanel] = useState<boolean>(false);

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

            <div className="flex justify-end items-center w-[30%] opacity-0 group-hover:opacity-100 transition-all transform duration-200 pr-4">
                <QuizOptionsPanel
                    quiz={quiz}
                    toggleQuizSelection={toggleQuizSelection}
                    setShowQuizTitleChangePanel={setShowQuizTitleChangePanel}
                    // setShowPreview={setShowPreview}
                />
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
