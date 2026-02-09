'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { templates } from '@/lib/templates';
import moment from 'moment';
import MyQuizzesGridView from './MyQuizzesGridView';
import { QuizType } from '@nocturn/types';

export enum Layouts {
    GRID = 'GRID',
    LIST = 'LIST',
}

export default function SharedQuizPanel() {
    const [_loading, setLoading] = useState<boolean>(false);
    const [sharedQuizs, setSharedQuizs] = useState<QuizType[]>([]);
    const { session } = useUserSessionStore();

    useEffect(() => {
        async function get_shared_quiz_data() {
            try {
                setLoading(true);
                if (!session?.user.token) return;
                const _quiz_response = await QuizActions.get_shared_quizzes(session.user.token);

                setSharedQuizs(_quiz_response || []);
            } catch (error) {
                console.error('Error in getting quiz', error);
            } finally {
                setLoading(false);
            }
        }
        get_shared_quiz_data();
    }, [session?.user.token]);

    return (
        <main className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col">
            <div className="w-full flex justify-start flex-col">
                <div className="flex justify-between">
                    <div className="text-4xl  text-dark-base dark:text-light-base">
                        Shared Quizzes
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sharedQuizs.map((quiz) => {
                    const currTemplate = templates.find((t) => t.id === quiz.theme);
                    if (!currTemplate) return null;

                    const formattedTime = moment(quiz.createdAt).format('MMM D, YYYY');

                    return (
                        <MyQuizzesGridView
                            key={quiz.id}
                            quiz={quiz}
                            currTemplate={currTemplate}
                            formattedTime={formattedTime}
                        />
                    );
                })}
            </div>
        </main>
    );
}
