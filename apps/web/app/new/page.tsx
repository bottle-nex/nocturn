'use client';
import BackendActions from '@/lib/backend/quiz-backend-actions';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function New() {
    const { quiz } = useNewQuizStore();
    const { session } = useUserSessionStore();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const hasCreatedQuizRef = useRef<boolean>(false);

    useEffect(() => {
        async function createQuiz() {
            if (hasCreatedQuizRef.current) return;
            hasCreatedQuizRef.current = true;
            setLoading(true);

            if (!session?.user.token || !quiz) return;

            const res = await BackendActions.createQuiz(session.user.token, quiz);
            if (res) {
                router.replace(`/new/${res.id}`);
                setLoading(false);
            }
        }

        createQuiz();
    }, [session, quiz, router]);

    return (
        <div className="h-screen w-screen flex justify-center items-center text-4xl bg-dark-alpha text-light-base">
            {loading && (
                <div className="text-alpha w-screen h-screen flex items-center justify-center">
                    <Loader className="animate-spin" />
                </div>
            )}
        </div>
    );
}
