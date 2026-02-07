'use client';

import userQuizAction from '@/lib/backend/base/user-quiz-action';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const params = useParams();
    const searchParams = useSearchParams();
    const quizId = params.quizId;
    const token = searchParams.get('spectator_token');
    const router = useRouter();

    useEffect(() => {
        async function getLiveData() {
            if (!token || !quizId) {
                return;
            }

            try {
                const validate = await userQuizAction.spectatorJoinQuizViaURL(
                    quizId as string,
                    token,
                );
                if (validate.success) {
                    router.push(`/live/${quizId}`);
                } else {
                    router.push('/');
                }
            } catch {
                router.push('/');
            }
        }

        getLiveData();
    }, [token, quizId, router]);
}
