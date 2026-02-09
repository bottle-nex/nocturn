'use client';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { PiMagnifyingGlass, PiTrashSimple } from 'react-icons/pi';
import { Button } from '../ui/button';
import { FiPlus } from 'react-icons/fi';
import { TbLayoutGridFilled } from 'react-icons/tb';
import { FaAlignJustify } from 'react-icons/fa6';
import { RiCircleLine, RiRecordCircleLine } from 'react-icons/ri';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useRouter } from 'next/navigation';
import { Layouts } from './MyQuizzesPanel';

interface QuizzesUpperSectionData {
    onDeleteSelected?: () => void;
    selectedQuizes?: number;
    onToggleSelectAll?: () => void;
    isAllSelected?: boolean;
    activeLayoutTab?: Layouts;
    onLayoutChange?: (layout: Layouts) => void;
}

export default function QuizzesUpperSection({
    onDeleteSelected,
    selectedQuizes,
    onToggleSelectAll,
    isAllSelected,
    activeLayoutTab,
    onLayoutChange,
}: QuizzesUpperSectionData) {
    const { session } = useUserSessionStore();
    const router = useRouter();

    function handleCreateQuiz() {
        if (!session?.user.token) return;
        router.push('/new');
    }

    return (
        <div className="flex flex-col gap-y-6 relative justify-between items-start mt-10">
            <div className="flex justify-between gap-x-4 w-full">
                <div
                    className={cn(
                        'relative w-md h-11 rounded-beta',
                        'border-dark-base dark:border-neutral-700 dark:bg-zinc-800 dark:text-white',
                    )}
                >
                    <Input
                        placeholder="search quizzes"
                        className={cn(
                            'h-full w-full pl-10 rounded-beta',
                            'placeholder:text-dark-base/60 dark:placeholder:text-neutral-500',
                            'dark:!bg-dark-base !bg-light-base border-neutral-800',
                        )}
                    />

                    <PiMagnifyingGlass
                        size={20}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                    />
                </div>

                <Button
                    size={'sm'}
                    onClick={handleCreateQuiz}
                    className="rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <FiPlus />
                    <span>New Quiz</span>
                </Button>
            </div>

            <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-x-1 h-11">
                    <Button
                        onClick={() => onLayoutChange?.(Layouts.GRID)}
                        className={cn(
                            'flex justify-center items-center rounded-sm border shadow-none hover:bg-indigo-600/20 h-7 w-7',
                            activeLayoutTab === Layouts.GRID
                                ? 'bg-indigo-600/20 border-indigo-800/70'
                                : 'border-transparent bg-indigo-600/5',
                        )}
                    >
                        <TbLayoutGridFilled
                            className={cn(
                                'size-4',
                                activeLayoutTab === Layouts.GRID
                                    ? 'text-indigo-700 dark:text-light-base'
                                    : 'text-indigo-900',
                            )}
                        />
                    </Button>

                    <Button
                        onClick={() => onLayoutChange?.(Layouts.LIST)}
                        className={cn(
                            'flex justify-center items-center rounded-sm border shadow-none hover:bg-indigo-600/20 h-7 w-7',
                            activeLayoutTab === Layouts.LIST
                                ? 'bg-indigo-600/20 border-indigo-800/70'
                                : 'border-transparent bg-indigo-600/5',
                        )}
                    >
                        <FaAlignJustify
                            className={cn(
                                'size-4',
                                activeLayoutTab === Layouts.LIST
                                    ? 'text-indigo-700 dark:text-light-base'
                                    : 'text-indigo-900',
                            )}
                        />
                    </Button>

                    {(selectedQuizes ?? 0) > 0 && (
                        <div
                            onClick={onToggleSelectAll}
                            className="pl-4 flex gap-x-1.5 cursor-pointer select-none items-center text-light-base/80"
                        >
                            {isAllSelected ? <RiRecordCircleLine /> : <RiCircleLine />}
                            <span className="text-lg text-light-base/80">select all</span>
                        </div>
                    )}
                </div>

                {(selectedQuizes ?? 0) > 0 && (
                    <Button
                        onClick={onDeleteSelected}
                        className="rounded-sm h-11 w-45 bg-red-700 hover:bg-red-700/80 text-white flex items-center"
                    >
                        <PiTrashSimple className="size-4.5 mb-px" />
                        <span>Delete selected ({selectedQuizes})</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
