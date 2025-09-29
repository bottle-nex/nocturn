'use client';
import { IoIosPlay } from 'react-icons/io';
import UtilityCard from '../utility/UtilityCard';
import DateActions from '@/lib/dates';
import QuizStatusTicker from '../tickers/QuizstatusTicker';
import { cn } from '@/lib/utils';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { useRouter } from 'next/navigation';
import { MouseEvent, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { BiTrash } from 'react-icons/bi';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { MdPublish } from 'react-icons/md';
import axios from 'axios';
import { DELETE_QUIZ_URL } from 'routes/api_routes';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from 'sonner';
import BackendActions from '@/lib/backend/quiz-backend-actions';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { QuizStatusEnum } from '@/types/prisma-types';
import Image from 'next/image'; // ✅ import Image for illustration

export default function InvertedQuizCards() {
    const { session } = useUserSessionStore();
    const [openQuizOptionId, setOpenQuizOptionId] = useState<string | null>(null);
    const [_selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const optionRef = useRef<HTMLElement>(null);
    const { quizs, updateQuiz: updateAllQuiz } = useAllQuizsStore();
    const { quiz, updateQuiz } = useNewQuizStore();

    const router = useRouter();
    const displayQuizs = quizs.slice(0, 4);

    useHandleClickOutside([dropdownRef, optionRef], () => setOpenQuizOptionId(null));

    function handleOpenOption(e: MouseEvent<SVGElement>, quizId: string) {
        e.stopPropagation();
        setOpenQuizOptionId((prev) => (prev === quizId ? null : quizId));
    }

    async function handleDeleteQuiz(quizId: string) {
        if (!quizId || !session?.user.token) {
            console.error('quiz-id or token is missing');
            return;
        }
        try {
            await axios.delete(`${DELETE_QUIZ_URL}/${quizId}`, {
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                },
            });
            toast.success('Quiz deleted successfully');
            useAllQuizsStore.getState().deleteQuiz(quizId);
            setOpenQuizOptionId(null);
        } catch (err) {
            console.error('Quiz deletion failed: ', err);
            toast.error('Failed to delete the quiz');
        }
    }

    async function handlePublishQuiz(quizId: string) {
        if (!quizId || !session?.user.token) {
            console.error('quiz-id or token is missing');
            return;
        }

        try {
            const isPublished = await BackendActions.publishQuiz(quiz, session.user.token);
            if (isPublished) {
                updateAllQuiz(quizId, {
                    status: QuizStatusEnum.PUBLISHED,
                });

                if (quiz.id === quizId) {
                    updateQuiz({ status: QuizStatusEnum.PUBLISHED });
                }
                setOpenQuizOptionId(null);
                toast.success('Quiz published successfully');
            }
        } catch (err) {
            console.error("Quiz didn't publish: ", err);
            toast.error('Failed to publish quiz');
        }
    }

    async function handleLaunchQuiz(quizId: string) {
        if (!quizId || !session?.user.token) {
            console.error('quiz-id or token is missing');
            return;
        }

        try {
            const isLaunched = await BackendActions.launchQuiz(quiz, session.user.token);
            if (isLaunched) {
                updateAllQuiz(quizId, {
                    status: QuizStatusEnum.LIVE,
                });

                if (quiz.id === quizId) {
                    updateQuiz({ status: QuizStatusEnum.LIVE });
                }
                setOpenQuizOptionId(null);
                toast.success('Quiz Launched successfully');
                router.push(`/live/${quizId}`);
                return;
            }
        } catch (error) {
            console.error('Failed to launch quiz: ', error);
            toast.error('Failed to launch quiz');
        }
    }

    return (
        <div className="relative max-h-[24rem] h-full flex flex-row items-start justify-center">
            {quizs.length > 0 ? (
                <div className="mt-12 relative w-[20rem] h-fit">
                    <div className="absolute bottom-6 left-3 w-[90%] h-full rounded-3xl bg-dark-base/50 dark:bg-neutral-100/50 scale-95 z-0"></div>
                    <UtilityCard className="relative bg-dark-base dark:bg-neutral-200 max-w-[20rem] w-[20rem] rounded-3xl z-10 shadow-lg border-none transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl p-0 cursor-pointer">
                        <div className="flex flex-col items-start justify-between h-fit select-none">
                            {displayQuizs.map((quiz, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => router.push(`/new/${quiz.id}`)}
                                    className={cn(
                                        'flex items-start justify-between w-full hover:bg-dark-primary/10 hover:dark:bg-neutral-400/10 px-8 py-2 min-h-[60px] relative',
                                        idx === displayQuizs.length - 1 && 'pb-7',
                                        idx === 0 && 'pt-7',
                                    )}
                                >
                                    <div className="flex-1 min-w-0">
                                        <span className="dark:text-neutral-900 text-neutral-500 text-sm font-medium block truncate">
                                            {quiz.title.slice(0, 28)}...
                                        </span>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="dark:text-neutral-900 text-neutral-300 text-[11px] font-light tracking-wide">
                                                {DateActions.formatFullDateTime(
                                                    new Date(quiz?.scheduledAt ?? Date.now()),
                                                )}
                                            </p>
                                            <QuizStatusTicker
                                                className="scale-80"
                                                status={quiz.status}
                                            />
                                        </div>
                                    </div>

                                    <div className="relative mt-4 ml-2 flex-shrink-0">
                                        <span ref={optionRef}>
                                            <BsThreeDotsVertical
                                                onClick={(e) => handleOpenOption(e, quiz.id)}
                                                className="dark:text-neutral-900 text-neutral-500 cursor-pointer"
                                            />
                                        </span>

                                        {openQuizOptionId === quiz.id && (
                                            <div
                                                ref={dropdownRef}
                                                className={cn(
                                                    'absolute left-full top-full mt-1',
                                                    'bg-light-base/90 dark:bg-dark-base/90 border border-neutral-200 dark:border-neutral-700',
                                                    'w-[8rem] rounded-md overflow-hidden shadow-lg z-[1000]',
                                                )}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Button
                                                    onClick={() => {
                                                        setSelectedQuizId(quiz.id);
                                                        if (
                                                            quiz.status !== QuizStatusEnum.PUBLISHED
                                                        ) {
                                                            toast.error(
                                                                'Please publish the quiz before launching it',
                                                            );
                                                            return;
                                                        }

                                                        handleLaunchQuiz(quiz.id);
                                                    }}
                                                    className={cn(
                                                        'px-3 py-2 text-dark-base dark:text-neutral-300 w-full bg-transparent hover:bg-transparent cursor-pointer font-light shadow-none',
                                                        'flex items-center justify-between dark:hover:bg-neutral-900 rounded-b-none',
                                                    )}
                                                >
                                                    <span className="text-xs">launch</span>
                                                    <IoIosPlay size={12} />
                                                </Button>

                                                <hr className="border-0 h-[0.3px] bg-neutral-300 dark:bg-neutral-700" />

                                                <Button
                                                    onClick={() => {
                                                        setSelectedQuizId(quiz.id);
                                                        handlePublishQuiz(quiz.id);
                                                    }}
                                                    className={cn(
                                                        'px-3 py-2 text-dark-base dark:text-neutral-300 w-full bg-transparent hover:bg-transparent cursor-pointer font-light shadow-none',
                                                        'flex items-center justify-between dark:hover:bg-neutral-900 rounded-none',
                                                    )}
                                                >
                                                    <span className="text-xs">publish</span>
                                                    <MdPublish size={12} />
                                                </Button>

                                                <hr className="border-0 h-[0.3px] bg-neutral-300 dark:bg-neutral-700" />

                                                <Button
                                                    onClick={() => {
                                                        setSelectedQuizId(quiz.id);
                                                        handleDeleteQuiz(quiz.id);
                                                    }}
                                                    className={cn(
                                                        'px-3 py-2 text-red-500 w-full bg-transparent hover:bg-transparent cursor-pointer',
                                                        'flex items-center justify-between',
                                                        'dark:hover:bg-neutral-900 rounded-md rounded-t-none',
                                                    )}
                                                >
                                                    <span className="text-xs">delete</span>
                                                    <BiTrash size={12} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </UtilityCard>
                </div>
            ) : (
                <div className="absolute bottom-10 right-10 flex flex-col items-center justify-center">
                    <div className="relative h-48 w-48 mb-4">
                        <Image
                            src="/illustrations/working.svg"
                            alt="No quizzes"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">Start by creating a quiz</p>
                </div>
            )}
        </div>
    );
}
