"use client";
import axios from "axios";
import InvertedQuizCards from "@/components/utility/InvertedQuizCards";
import { SiGooglegemini } from "react-icons/si";
import { useAllQuizsStore } from "@/store/user/useAllQuizsStore";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";
import { useEffect } from "react";
import { GET_ALL_OWNER_QUIZ_URL } from "routes/api_routes";
import { Input } from "@/components/ui/input";
import { PiMagnifyingGlass } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { FiPlus } from "react-icons/fi";
import { v4 as uuid } from "uuid";
import { useRouter } from "next/navigation";


export default function Page() {
    const router = useRouter();
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
                    setAllQuizs(data.data);
                }
            } catch (err) {
                console.error('Error in getting all the quizzes', err);
            }
        }

        getUserAllQuizs();
    }, [session?.user.token, setAllQuizs]);

    function handleCreateNewQuiz() {
        const newQuizId = uuid();
        router.push(`/new/${newQuizId}`);
    }

    return (
        <div className="bg-dark-base w-full h-full rounded-sm px-12 py-10">
            <section className="flex items-center justify-between">
                <div>
                    <span className="text-4xl text-white">Welcome {session?.user.name}!!</span>
                </div>
                <div className="relative max-w-sm w-full h-11">
                    <Input placeholder="Serch your quizzes.." className="border-neutral-800 rounded h-full w-full pl-10 focus:outline-none focus:border-neutral-800 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gamma/40" />
                    <PiMagnifyingGlass size={20} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" />
                </div>
            </section>
            <section className="flex items-center justify-start gap-x-3 mt-10">
                <Button onClick={handleCreateNewQuiz} className="rounded-full w-32 bg-delta hover:bg-delta text-white active:scale-98">
                    <FiPlus />
                    <span>New Quiz</span>
                </Button>
                <Button variant={'outline'} className="rounded-full w-36 bg-gray-500/10 dark:bg-gray-500/10 hover:dark:bg-gray-500/20 hover:bg-gray-500/20 border-neutral-700 text-white! dark:text-white active:scale-98">
                    <SiGooglegemini size={20} />
                    <span>Start with AI</span>
                </Button>
            </section>
            <section className="w-[24rem] flex flex-col relative h-full -ml-8 mt-6">
                <InvertedQuizCards />
            </section>
            <section className="mt-8">

            </section>
        </div>
    )
}
