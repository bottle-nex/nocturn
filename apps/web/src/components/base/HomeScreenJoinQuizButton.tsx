'use client';
import { cn } from '@/lib/utils';
import { ShinyButton } from '../magicui/shiny-button';
import React, { useState } from 'react';
import { Input } from '../ui/input';
import userQuizAction from '@/lib/backend/user-quiz-action';
import { useRouter } from 'next/navigation';
import ToolTipComponent from '../utility/TooltipComponent';
import { useJoinQuizStore } from '@/store/home/useJoinQuizStore';

export default function HomeScreenJoinQuizButton() {
    const [code, setCode] = useState<string>('');
    const [hovered, setHovered] = useState(false);
    const router = useRouter();
    const { showJoinInput } = useJoinQuizStore();

    async function joinQuizHandler() {
        const quizId = await userQuizAction.joinQuiz(removeHyphen(code));
        if (!quizId) return;
        router.push(`/live/${quizId}`);
    }

    function handleOnEnter(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            joinQuizHandler();
        }
    }

    function removeHyphen(str: string): string {
        const code = str.split('-').join('');
        return code;
    }

    const shouldShowInput = showJoinInput || hovered;

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <ToolTipComponent content="Press ENTER to join">
                <Input
                    type="text"
                    placeholder="1 2 3 - 4 5 6"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleOnEnter}
                    className={cn(
                        'absolute left-[-200px] top-1/2 -translate-y-1/2 z-[999]',
                        'w-45 px-5 py-3 rounded-lg border border-neutral-300',
                        'dark:bg-neutral-900 dark:border-neutral-700 dark:text-white',
                        ' placeholder:font-mono placeholder:text-center placeholder:px-3',
                        'focus:border-none',
                        'transition-all duration-300 ease-in-out',
                        shouldShowInput ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5',
                    )}
                    autoFocus={shouldShowInput}
                />
            </ToolTipComponent>

            <ShinyButton
                onClick={joinQuizHandler}
                className={cn(`border rounded-2xl !text-xl dark:bg-[#4f2b82] px-6 py-2 uppercase`)}
            >
                Join Quiz
            </ShinyButton>
        </div>
    );
}
