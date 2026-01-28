'use client';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useMemo } from 'react';
import { templates } from '@/lib/templates';
import EmptyCanvas from '../canvas/EmptyCanvas';
import moment from 'moment';
import HeartButton from '../ui/HeartButton';
import QuizActions from '@/lib/backend/home/quiz-actions';

export default function FavouriteQuizzesPanel() {
    const { session } = useUserSessionStore();

    const quizs = useAllQuizsStore((state) => state.quizs);
    const updateQuizFavourite = useAllQuizsStore((state) => state.updateQuizFavourite);

    const favouriteQuizzes = useMemo(() => quizs.filter((q) => q.isFavourite), [quizs]);

    async function handleFavouriteToggle(quizId: string, isFavourite: boolean) {
        if (!session?.user.token) return;

        updateQuizFavourite(quizId, isFavourite);

        try {
            await QuizActions.toggle_favourite_quiz(session.user.token, quizId, isFavourite);
        } catch {
            updateQuizFavourite(quizId, !isFavourite);
        }
    }

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 py-12">
            <div className="text-4xl text-light-base/90">Favourite Quizzes</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {favouriteQuizzes.length > 0 ? (
                    favouriteQuizzes.map((quiz) => {
                        const currTemplate = templates.find((t) => t.id === quiz.theme);
                        if (!currTemplate) return null;
                        const formattedTime = moment(quiz.createdAt).format('MMM D, YYYY');

                        return (
                            <div key={quiz.id} className="p-1">
                                <EmptyCanvas
                                    className="w-full aspect-video rounded-[10px] outline-2 outline-black/40 dark:outline-white/40"
                                    question={quiz.questions[0].question}
                                    options={quiz.questions[0].options}
                                    template={currTemplate}
                                />

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
                        );
                    })
                ) : (
                    <div className="opacity-60">No favourite quizzes yet ❤️</div>
                )}
            </div>
        </div>
    );
}
