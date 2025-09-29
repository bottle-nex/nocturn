'use client';
import { Button } from '../ui/button';
import { RiUserFill } from 'react-icons/ri';
import { Input } from '../ui/input';
import { MdChevronRight } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { useState } from 'react';
// import { useLiveQuizStore } from '@/store/useLiveQuizStore';
import { useRouter } from 'next/navigation';
import userQuizAction from '@/lib/backend/user-quiz-action';

export default function DashboardStakedAmountCard() {
    const [code, setCode] = useState<string>('');
    // const { updateQuiz, updateGameSession } = useLiveQuizStore();
    const router = useRouter();

    async function joinQuizHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const quizId = await userQuizAction.joinQuiz(code);
        if (!quizId) return;
        router.push(`/live/${quizId}`);
    }

    return (
        <div className="flex-1 overflow-hidden w-full">
            <div className="bg-primary h-full rounded-3xl p-6 relative overflow-hidden select-none">
                <div className="flex flex-col justify-between gap-y-2 h-full">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex flex-col items-start gap-y-2">
                            <h2 className="text-2xl font-semibold">Join using code</h2>
                            <form
                                onSubmit={joinQuizHandler}
                                className="flex items-center justify-start gap-x-3"
                            >
                                <Input
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="your code"
                                    className={cn(
                                        'max-w-[10rem] h-10',
                                        'placeholder:tracking-wider placeholder:text-center placeholder:text-gray-400',
                                        'text-center font-mono text-sm text-dark-base dark:text-light-base',
                                        'border-primary dark:border-primary',
                                        'focus:ring-2 focus:ring-primary focus:border-primary',
                                        'bg-light-base dark:bg-dark-base',
                                        'transition-all duration-200',
                                        'shadow-sm hover:shadow-md',
                                    )}
                                />
                                <Button
                                    className="aspect-square rounded-full dark:bg-dark-base hover:bg-dark-base/80 bg-light-base dark:hover:bg-light-base/80 dark:text-light-base text-dark-base"
                                    variant={'ghost'}
                                    type="submit"
                                >
                                    <MdChevronRight />
                                </Button>
                            </form>
                        </div>
                        {/* <div>
                            <h2 className="text-xl font-semibold">Staked Amount</h2>
                            <span className="font-light text-sm">updated 1 day ago</span>
                        </div> */}
                    </div>
                    <div className="w-full flex flex-col gap-y-3 sm:flex-row-reverse sm:items-end justify-between ">
                        {/* staked amount */}
                        {/* <div className="w-full flex justify-end flex-col gap-y-3 group">
                            <div className="flex items-center justify-end gap-x-2 text-white/80">
                                <span className="font-light">Staked amount</span>
                                <div className="relative">
                                    <SiSolana className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                                </div>
                            </div>
                            <div className="relative flex justify-end">
                                <div className="bg-black/70 hover:bg-black/80 backdrop-blur-sm rounded-xl px-6 py-2 border border-white/10 transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/20 group-hover:shadow-lg group-hover:shadow-yellow-400/10">
                                    <span className="text-6xl font-black text-white relative">
                                        0.02 SOL
                                    </span>
                                </div>
                            </div>
                        </div> */}

                        {/* participants */}
                        <div className="flex justify-start sm:justify-between flex-col gap-y-3">
                            <div className="flex items-center gap-x-2 text-white/80">
                                <span className="font-light">Participants</span>
                                <RiUserFill />
                            </div>
                            <div>
                                <span className="text-6xl font-black">1,200</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
