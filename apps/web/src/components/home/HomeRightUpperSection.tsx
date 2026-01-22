import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import { Input } from '../ui/input';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { v4 as uuid } from 'uuid';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { CgFileAdd } from "react-icons/cg";
import ToolTipComponent from '../utility/TooltipComponent';
import RecentAICreatedCard from '../ui/RecentAICreationCard';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import AnimatedFolderIcon from '../ui/animated-icons/AnimatedFolderIcon';

export default function HomeRightUpperSection() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const { quizs } = useAllQuizsStore();
    const [recentAIBuildsPanel, setRecentAIBuildsPanel] = useState<boolean>(false);

    function handleCreateNewQuiz() {
        router.push(`/new/${uuid()}`);
    }

    function handleAIBuildsPanelToggle() {
        setRecentAIBuildsPanel(t => !t);
    }

    return (
        <section className="flex items-center justify-between">
            <div></div>
            <div
                className={cn(
                    "relative max-w-sm w-full h-11 rounded-[6px] ",
                    "border-neutral-800 dark:border-neutral-700 dark:bg-zinc-800 dark:text-white",
                    "focus:outline-none focus:border-neutral-800 dark:focus:border-neutral-600 focus-visible:ring-0 focus-visible:ring-offset-0",
                )}
                onClick={handleAIBuildsPanelToggle}
            >
                <Input
                    placeholder="Start creating quiz with AI..."
                    className={cn(
                        "h-full w-full pl-10  placeholder:text-gamma/40 dark:placeholder:text-neutral-500",
                        "rounded-[6px]"
                    )}
                    ref={inputRef}
                />
                <PiMagnifyingGlass
                    size={20}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 rounded-full"
                />
                <ToolTipComponent
                    content={"upload pdf"}
                    className='cursor-pointer '
                >
                    <div
                        className={cn(
                            "absolute top-1/2 right-3 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 ",
                            'p-1'
                        )}
                    >
                        <AnimatedFolderIcon 
                            strokeWidth={1.5}
                            stroke={'#737373'}
                            className='size-5 text-neutral-500 dark:text-neutral-400'
                        />
                    </div>
                </ToolTipComponent>

                {recentAIBuildsPanel && (
                    <div
                        className={cn(
                            'absolute z-50 top-12 w-full h-100 rounded-[6px] shadow-md px-2 py-3',
                            'dark:bg-zinc-800 dark:text-white',
                            'flex flex-col gap-y-2',
                        )}
                    >
                        <div className='text-xs px-2'>
                            Recent AI creations
                        </div>
                        <div className='flex flex-col '>
                            {quizs.map((q) => (
                                <RecentAICreatedCard
                                    theme={q.theme}
                                    title={q.title}
                                    difficulty={5}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>
            <div className="flex items-center justify-end gap-4">
                <Button
                    onClick={handleCreateNewQuiz}
                    className="rounded-[4px] h-11 w-32 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white active:scale-98"
                >
                    <FiPlus />
                    <span>New Quiz</span>
                </Button>
            </div>
        </section>
    );
}
