'use client';
import { useEffect, useState } from 'react';
import { SlArrowDown } from 'react-icons/sl';
import ToolTipComponent from '../utility/TooltipComponent';
import { IoIosPlay } from 'react-icons/io';
import { CiSaveDown1 } from 'react-icons/ci';
import { MdPublish } from 'react-icons/md';
import CreateQuizActionPanel from '../utility/CreateQuizActionPanel';
import BackendActions from '@/lib/backend/quiz-backend-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { QuizStatusEnum } from '@nocturn/types';
import { toast } from 'sonner';
import QuizStatusTicker from '../tickers/QuizstatusTicker';
import AutoSaveComponent from '../utility/AutoSave';
import { useRouter } from 'next/navigation';

interface Option {
    name: string;
    description?: string;
    icon: React.ReactNode;
    action?: () => void | Promise<void>;
}

export default function NavbarQuizAction() {
    const [actionsPanel, setActionsPanel] = useState<boolean>(false);
    const [currentAction, setCurrentAction] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { session } = useUserSessionStore();
    const { quiz, updateQuiz } = useNewQuizStore();
    const { updateQuiz: updateAllQuiz } = useAllQuizsStore();
    const router = useRouter();

    async function handleSaveDraft() {
        if (!quiz || !session?.user.token) {
            console.error('Quiz or token is missing');
            return;
        }
        setIsLoading(true);
        try {
            const isSaved = await BackendActions.upsertQuizAction(quiz, session.user.token);
            if (isSaved) {
                updateAllQuiz(quiz.id, {
                    status: QuizStatusEnum.CREATED,
                });
                updateQuiz({ status: QuizStatusEnum.CREATED });
                toast.success('Draft saved');
                return;
            }
            toast.error('Failed to save draft');
        } catch (error) {
            console.error('Failed to save quiz:', error);
        } finally {
            setIsLoading(false);
            setActionsPanel(false);
        }
    }

    async function handlePublishQuiz() {
        if (!quiz || !session?.user.token) {
            console.error('Quiz or token is missing');
            return;
        }
        setIsLoading(true);
        try {
            const isPublished = await BackendActions.publishQuiz(quiz, session.user.token);
            if (isPublished) {
                updateAllQuiz(quiz.id, {
                    status: QuizStatusEnum.PUBLISHED,
                });
                updateQuiz({ status: QuizStatusEnum.PUBLISHED });
                toast.success('Quiz published successfully');
                return;
            }
            toast.error('Failed to publish quiz');
        } catch (error) {
            console.error('Failed to save quiz:', error);
        } finally {
            setIsLoading(false);
            setActionsPanel(false);
        }
    }

    async function handleLaunchQuiz() {
        if (!quiz || !session?.user.token) {
            console.error('Quiz or token is missing');
            return;
        }
        setIsLoading(true);
        try {
            const isPublished = await BackendActions.launchQuiz(quiz, session.user.token);
            if (isPublished) {
                updateAllQuiz(quiz.id, {
                    status: QuizStatusEnum.LIVE,
                });
                updateQuiz({ status: QuizStatusEnum.LIVE });
                toast.success('Quiz launched successfully');
                router.push(`/live/${quiz.id}`);
                return;
            }
            toast.error('Failed to publish quiz');
        } catch (error) {
            console.error('Failed to save quiz:', error);
        } finally {
            setIsLoading(false);
            setActionsPanel(false);
        }
    }

    const options: Option[] = [
        {
            name: 'Launch Quiz',
            icon: <IoIosPlay size={'24px'} />,
            action: handleLaunchQuiz,
        },
        {
            name: 'Save Draft',
            description: 'Store your progress — you can edit and publish it later',
            icon: <CiSaveDown1 size={'24px'} />,
            action: handleSaveDraft,
        },
        {
            name: 'Publish Quiz',
            description: 'Make your quiz live and shareable with participants',
            icon: <MdPublish size={'24px'} />,
            action: handlePublishQuiz,
        },
    ];

    useEffect(() => {
        // Auto-save functionality (commented out for now)
        // const interval = setInterval(() => {
        //     handleSaveDraft();
        // }, 30 * 1000); // 30 seconds
        // return () => {
        //     clearInterval(interval);
        // }
    }, []);

    return (
        <div
            className="relative select-none flex flex-shrink-0 items-center gap-x-3"
            onClick={() => setActionsPanel((prev) => !prev)}
        >
            {Boolean(quiz.status !== QuizStatusEnum.NULL)}
            {quiz.status !== QuizStatusEnum.NULL && (
                <QuizStatusTicker className="" status={quiz?.status} />
            )}
            {/* <AutoSaveComponent /> */}
            <ToolTipComponent content={'this will be saved every 30sec'}>
                <div className="w-full flex justify-around items-center gap-x-2 bg-alpha/50 transition-colors rounded-full cursor-pointer px-4 py-2">
                    <div className="rounded-l-full text-[13px] font-normal flex justify-center items-center ">
                        {isLoading ? 'Saving...' : (currentAction ?? options[1]?.name)}
                    </div>
                    <div className="rounded-r-full text-[13px] flex justify-center items-center ">
                        <SlArrowDown
                            className={`${actionsPanel ? 'rotate-180' : ''} transition-all`}
                        />
                    </div>
                </div>
            </ToolTipComponent>
            {actionsPanel && (
                <CreateQuizActionPanel
                    setCurrentAction={setCurrentAction}
                    actions={options}
                    setActionsPanel={setActionsPanel}
                />
            )}
        </div>
    );
}
