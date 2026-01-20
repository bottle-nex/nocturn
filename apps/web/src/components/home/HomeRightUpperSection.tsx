import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import { Input } from '../ui/input';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { v4 as uuid } from 'uuid';
import { useRef } from 'react';

export default function HomeRightUpperSection() {
    const router = useRouter();
    const { session } = useUserSessionStore();
    const inputRef = useRef<HTMLInputElement>(null);

    function handleCreateNewQuiz() {
        router.push(`/new/${uuid()}`);
    }

    return (
        <section className="flex items-center justify-between">
            <div>
                <span className="text-4xl text-black dark:text-white">
                    Welcome {session?.user.name}!
                </span>
            </div>
            <div className="flex items-center justify-end gap-4">
                <Button
                    onClick={handleCreateNewQuiz}
                    className="rounded-full w-32 bg-delta hover:bg-delta text-white active:scale-98"
                >
                    <FiPlus />
                    <span>New Quiz</span>
                </Button>
                <div className="relative max-w-sm w-full h-11">
                    <Input
                        placeholder="Serch your quizzes.."
                        className="border-neutral-800 dark:border-neutral-700 dark:bg-zinc-800 dark:text-white rounded h-full w-full pl-10 focus:outline-none focus:border-neutral-800 dark:focus:border-neutral-600 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gamma/40 dark:placeholder:text-neutral-500"
                        ref={inputRef}
                    />
                    <PiMagnifyingGlass
                        size={20}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                    />
                </div>
            </div>
        </section>
    );
}
