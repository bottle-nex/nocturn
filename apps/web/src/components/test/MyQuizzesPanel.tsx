'use client';
import QuizFolderBackendActions from '@/lib/backend/home/quiz-folder-backend-actions';
import { useQuizFolderStore } from '@/store/quiz-folder/useQuizFolderStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { FiPlus } from 'react-icons/fi';
import { BsFolderPlus } from 'react-icons/bs';
import { cn } from '@/lib/utils';
import ToolTipComponent from '../utility/TooltipComponent';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { Input } from '../ui/input';
import { GoArrowRight } from 'react-icons/go';
import { FcFolder } from 'react-icons/fc';
import { useRouter } from 'next/navigation';

export default function MyQuizzesPanel() {
    const { folders, addFolder, setFolders } = useQuizFolderStore();
    const { session } = useUserSessionStore();
    const [folderName, setFolderName] = useState<string>('');
    const [createFolderPanel, setCreateFolderPanel] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        async function getFolders() {
            if (!session?.user.token) return;

            try {
                const fetchedFolders = await QuizFolderBackendActions.get_all_quiz_folders(
                    session.user.token,
                );

                if (fetchedFolders) {
                    setFolders(fetchedFolders);
                }
            } catch (error) {
                console.error('Error in fetching folders', error);
            }
        }

        getFolders();
    }, [session?.user.token, setFolders]);

    function handleCreateNewQuiz() {
        router.push('/new');
    }

    async function handleCreateFolder() {
        if (!session?.user.token || !folderName.trim()) return;

        try {
            const folder = await QuizFolderBackendActions.create_folder(
                session.user.token,
                folderName.trim(),
            );

            if (folder) {
                addFolder(folder);
                setFolderName('');
                setCreateFolderPanel(false);
            }
        } catch (error) {
            console.error('Error in creating folder:', error);
        }
    }

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 py-12 flex flex-col">
            <div className="w-full flex justify-between">
                <div className="text-4xl text-light-base/90">My Quizzes</div>

                <div className="flex gap-x-3 relative">
                    <Button
                        onClick={handleCreateNewQuiz}
                        className="rounded-sm h-11 w-32 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white active:scale-98"
                    >
                        <FiPlus />
                        <span>New Quiz</span>
                    </Button>

                    <Button
                        onClick={() => setCreateFolderPanel((prev) => !prev)}
                        className="rounded-sm h-11 w-34 bg-light-base hover:bg-light-base/80 transition-colors text-indigo-800 active:scale-98"
                    >
                        <BsFolderPlus />
                        <span>New Folder</span>
                    </Button>

                    {createFolderPanel && (
                        <div
                            className={cn(
                                'absolute top-14 right-0',
                                'flex flex-col gap-y-5 p-4',
                                'dark:bg-dark-base bg-light-base dark:text-light-base text-dark-base border border-neutral-800',
                                'rounded-sm w-80',
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div>Create new folder</div>

                                <ToolTipComponent content="You can manage quizzes in folders">
                                    <AiOutlineQuestionCircle size={15} />
                                </ToolTipComponent>
                            </div>

                            <div className="flex items-center gap-x-2">
                                <Input
                                    value={folderName}
                                    placeholder="enter folder name"
                                    className="rounded-sm"
                                    onChange={(e) => setFolderName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleCreateFolder();
                                        }
                                    }}
                                />

                                <Button
                                    onClick={handleCreateFolder}
                                    className="h-9 w-9 bg-light-base hover:bg-light-base/90 text-dark-base rounded-sm"
                                >
                                    <GoArrowRight />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                {folders.map((folder) => (
                    <div
                        key={folder.id}
                        className="w-fit max-w-35 h-auto p-2.5 px-4 rounded-sm bg-light-base flex justify-between items-center text-dark-base gap-x-2.5"
                    >
                        <FcFolder className="size-6" />
                        <span className="truncate">{folder.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
