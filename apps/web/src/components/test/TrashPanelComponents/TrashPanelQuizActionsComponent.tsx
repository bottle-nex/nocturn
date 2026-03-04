import ToolTipComponent from '@/components/utility/TooltipComponent';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import { IoMdRefresh } from 'react-icons/io';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { PiTrashSimple } from 'react-icons/pi';

interface TrashPanelQuizActionsProps {
    quizId: string;
    isOperating: boolean;
    isSelected: boolean;
    quizActionLoading: Record<string, 'restore' | 'delete' | null>;
    toggleSelectQuiz: (id: string) => void;
    handleRestoreQuiz: (id: string) => void;
    handlePermanentlyDeleteQuiz: (id: string) => void;
}

export default function TrashPanelQuizActionsComponent({
    quizId,
    isOperating,
    isSelected,
    quizActionLoading,
    toggleSelectQuiz,
    handleRestoreQuiz,
    handlePermanentlyDeleteQuiz,
}: TrashPanelQuizActionsProps) {
    return (
        <div
            className={cn(
                'absolute top-5 z-50 px-5 flex justify-between w-full transition-all duration-100',
                isOperating || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            )}
        >
            <div>
                <ToolTipComponent content={isSelected ? 'unselect' : 'select'}>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectQuiz(quizId);
                        }}
                        className={cn(
                            'backdrop-blur-sm text-dark-base h-6 w-6 flex justify-center items-center cursor-pointer',
                        )}
                    >
                        {isSelected ? (
                            <MdCheckBox className="size-6 text-indigo-700" />
                        ) : (
                            <MdCheckBoxOutlineBlank className="size-6 text-indigo-700" />
                        )}
                    </div>
                </ToolTipComponent>
            </div>
            <div className="flex gap-x-2.5 items-center">
                <ToolTipComponent content="restore">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreQuiz(quizId);
                        }}
                        className={cn(
                            'bg-light-base/70 backdrop-blur-sm text-dark-base h-6 w-6 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer',
                            isOperating &&
                                quizActionLoading[quizId] !== 'restore' &&
                                'pointer-events-none',
                        )}
                    >
                        {quizActionLoading[quizId] === 'restore' ? (
                            <Loader className="size-3.5 animate-spin" />
                        ) : (
                            <IoMdRefresh style={{ transform: 'scaleX(-1)' }} className="size-3.5" />
                        )}
                    </div>
                </ToolTipComponent>

                <ToolTipComponent content="delete permanently">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentlyDeleteQuiz(quizId);
                        }}
                        className={cn(
                            'bg-light-base/70 backdrop-blur-sm text-red-600 h-6 w-6 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer',
                            isOperating &&
                                quizActionLoading[quizId] !== 'delete' &&
                                'pointer-events-none',
                        )}
                    >
                        {quizActionLoading[quizId] === 'delete' ? (
                            <Loader className="size-3.5 animate-spin" />
                        ) : (
                            <PiTrashSimple className="size-3.5 stroke-2" />
                        )}
                    </div>
                </ToolTipComponent>
            </div>
        </div>
    );
}
