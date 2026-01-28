'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { templates } from '@/lib/templates';
import EmptyCanvas from '../canvas/EmptyCanvas';
import Image from 'next/image';
import moment from 'moment';
import HeartButton from '../ui/HeartButton';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { PiMagnifyingGlass } from 'react-icons/pi';
import ToolTipComponent from '../utility/TooltipComponent';
import UploadPDFButton from '../ui/UploadPDFButton';
import AnimatedFolderIcon from '../ui/animated-icons/AnimatedFolderIcon';
import QuizzesUpperSection from './QuizzesUpperSection';

export default function MyQuizzesPanel() {
    const { session } = useUserSessionStore();
    const router = useRouter();
    const [_loading, setLoading] = useState<boolean>(false);
    const { setAllQuizs, quizs, updateQuizFavourite } = useAllQuizsStore();

    useEffect(() => {
        async function get_quiz_data() {
            try {
                setLoading(true);
                if (!session?.user.token) return;

                const quiz_response = await QuizActions.get_quizzes(session.user.token);

                setAllQuizs(quiz_response?.quizzes || []);
            } catch (error) {
                console.error('Error in getting quiz', error);
            } finally {
                setLoading(false);
            }
        }

        get_quiz_data();
    }, [session?.user.token, setAllQuizs]);

    async function handleFavouriteToggle(quizId: string, isFavourite: boolean) {
        if (!session?.user.token) return;

        try {
            await QuizActions.toggle_favourite_quiz(session.user.token, quizId, isFavourite);
            updateQuizFavourite(quizId, isFavourite);
        } catch (error) {
            console.error('Error in adding uiz to favourites: ', error);
            return;
        }
    }

    function handleCreateNewQuiz() {
        router.push('/new');
    }

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-20 flex flex-col">
            <div className="w-full flex justify-start flex-col">
                <div className="text-4xl text-light-base/90">My Quizzes</div>

                <QuizzesUpperSection/>

            </div>

            <div className="w-full mt-16 overflow-y-auto text-light-base">
                <div className="w-full overflow-y-auto text-light-base grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizs.length > 0 ? (
                        quizs.map((quiz) => {
                            const currTemplate = templates.find((t) => t.id === quiz.theme);
                            if (!currTemplate) return null;
                            const formattedTime = moment(quiz.createdAt).format('MMM D, YYYY');

                            return (
                                <div
                                    key={quiz.id}
                                    className="max-w-[400px] w-full p-1 flex flex-col"
                                >
                                    <EmptyCanvas
                                        question={quiz.questions[0].question}
                                        options={quiz.questions[0].options}
                                        className="w-full aspect-video rounded-[10px] outline-2 outline-black/40 dark:outline-white/40"
                                        template={currTemplate}
                                    />

                                    <div className="flex items-center justify-start gap-x-2.5 pt-2">
                                        {quiz.host?.image && (
                                            <Image
                                                src={quiz.host.image}
                                                width={32}
                                                height={32}
                                                alt="user-logo"
                                                className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all rounded-full"
                                            />
                                        )}

                                        <div className="flex items-center justify-between w-full">
                                            <div>
                                                <span className="block text-normal mt-1">
                                                    {quiz.title?.slice(0, 28)}...
                                                </span>
                                                <span className="block dark:text-white/60 text-black/60 text-[13px]">
                                                    last viewed {formattedTime}
                                                </span>
                                            </div>
                                            <HeartButton
                                                liked={quiz.isFavourite}
                                                onToggle={(toggle) =>
                                                    handleFavouriteToggle(quiz.id, toggle)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div>no quizzes found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
