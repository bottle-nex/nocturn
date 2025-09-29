'use client';
import { JSX } from 'react';
import DashboardLeft from './DashboardLeft';
import DashboardRight from './DashboardRight';
import { useEffect } from 'react';
import axios from 'axios';
import { GET_ALL_OWNER_QUIZ_URL } from 'routes/api_routes';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';

export default function DashBoard(): JSX.Element {
    const { session } = useUserSessionStore();
    const { setAllQuizs } = useAllQuizsStore();

    useEffect(() => {
        async function getUserAllQuizs() {
            if (!session?.user.token) return;
            try {
                const { data } = await axios.get(GET_ALL_OWNER_QUIZ_URL, {
                    headers: {
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                });
                if (data.success) {
                    setAllQuizs(data.quizzes);
                }
            } catch (err) {
                console.error('Error in getting all the quizzes', err);
            }
        }

        getUserAllQuizs();
    }, [session?.user.token, setAllQuizs]);
    return (
        <div className="flex h-screen">
            <DashboardLeft />
            <DashboardRight />
        </div>
    );
}
