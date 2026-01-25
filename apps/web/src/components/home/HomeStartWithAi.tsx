'use client';
import StartWithAi from './StartWithAi';
import { IoArrowUpSharp } from 'react-icons/io5';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

export default function HomeStartWithAi() {
    const [input, setInput] = useState<string>('');
    const [openAiComponent, setOpenAiComponent] = useState<boolean>(false);
    const { session } = useUserSessionStore();
    // const { updateQuiz } = useNewQuizStore();
    // const router = useRouter();

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
    }

    async function handleAiFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (input.trim().length === 0) return;
        // setOpenAiComponent(true);

        if (!session || !session.user) return;

        // const quiz = await StartWithAIAction.create_quiz(input, session.user.token);

        // if (!quiz) return;

        // // setting the data
        // updateQuiz(quiz);

        // // changing the route
        // router.push(`/new/${quiz.id}`);
    }

    return (
        <>
            <section className="flex items-center justify-start gap-x-3 mt-10 w-full">
                <form className="relative min-w-sm w-full h-15">
                    <Input
                        onChange={handleInputChange}
                        placeholder="Start creating quiz with AI..."
                        className={cn(
                            'border hover:border-[#5769e7]',
                            'rounded-sm h-full w-full pl-12',
                            'bg-background',
                            'placeholder:text-black/60 dark:placeholder:text-neutral-500 placeholder:text-base',
                            'focus-visible:ring-4 focus-visible:ring-[#5769e750] focus-visible:border-[#5769e7]',
                            'focus-visible:ring-offset-3 focus-visible:ring-offset-background',
                        )}
                    />
                    <Image
                        src={'/icons/ai.png'}
                        alt="AI Icon"
                        width={24}
                        height={20}
                        unoptimized
                        className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 dark:invert"
                    />
                    <Button
                        typeof="submit"
                        className="absolute top-1/2 right-3 -translate-y-1/2 bg-black dark:bg-white h-9 w-9 rounded-full p-0 flex items-center justify-center dark:text-black text-white"
                        onClick={handleAiFormSubmit}
                        disabled={input.trim().length === 0}
                    >
                        <IoArrowUpSharp size={20} />
                    </Button>
                </form>
            </section>
            <StartWithAi setOpen={setOpenAiComponent} open={openAiComponent} />
        </>
    );
}
