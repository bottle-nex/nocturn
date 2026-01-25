import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import { Input } from '../ui/input';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { v4 as uuid } from 'uuid';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import ToolTipComponent from '../utility/TooltipComponent';
import RecentAICreatedCard from '../ui/RecentAICreationCard';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import AnimatedFolderIcon from '../ui/animated-icons/AnimatedFolderIcon';
import UploadPDFButton from '../ui/UploadPDFButton';
import { AiQuizChatRole, AiQuizMessage, QuizType } from '@nocturn/types';
import PdfPreview from '../ui/PdfPreview';
import StartWithAi from './StartWithAi';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import AiBackendAction from '@/lib/backend/home/start-with-ai-action';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

enum COMMON_PANEL_DATA {
    RECENTS = 'RECENTS',
    PDF = 'PDF',
}

export default function HomeRightUpperSection() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [prompt, setPrompt] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    const { quizs } = useAllQuizsStore();
    const { appendMessage } = useAiChatStore();
    const { session } = useUserSessionStore();

    const [openAiComponent, setOpenAiComponent] = useState<boolean>(false);
    const [commonPanel, setCommonPanel] = useState<boolean>(false);
    const [commonPanelData, setCommonPanelData] = useState<COMMON_PANEL_DATA>(
        COMMON_PANEL_DATA.RECENTS,
    );
    const [pdf, setPdf] = useState<File | null>(null);

    function handleCreateNewQuiz() {
        router.push(`/new/${uuid()}`);
    }

    function onPdfSelect(file: File) {
        setPdf(file);
        setCommonPanel(true);
        setCommonPanelData(COMMON_PANEL_DATA.PDF);
    }

    function handleCommonPanelDataAppearance() {
        switch (commonPanelData) {
            case COMMON_PANEL_DATA.RECENTS:
                return <AIBuiltQuizs quizs={quizs} />;
            case COMMON_PANEL_DATA.PDF:
                return (
                    <PdfPreview
                        file={pdf}
                        onRemove={() => {
                            setPdf(null);
                            setCommonPanelData(COMMON_PANEL_DATA.RECENTS);
                        }}
                    />
                );
            default:
                return null;
        }
    }

    function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleSubmit() {
        if (!prompt.trim()) return;

        // open the chatting panel
        setOpenAiComponent(true);

        // temporary session-id
        const sessionId = uuid();

        // create the user message
        const message: AiQuizMessage = {
            id: uuid(),
            aiQuizChatSessionId: sessionId,
            role: AiQuizChatRole.USER,
            content: prompt,
        };

        // append the message in client side
        appendMessage(message);

        // send the prompt
        AiBackendAction.create_quiz(session?.user.token, sessionId, prompt);

        setPrompt('');
        setCommonPanel(false);
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setCommonPanel(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <section className="flex items-center justify-between">
            <div />

            <div
                ref={containerRef}
                className={cn(
                    'relative max-w-sm w-full h-11 rounded-[6px]',
                    'border-neutral-800 dark:border-neutral-700 dark:bg-zinc-800 dark:text-white',
                )}
            >
                <Input
                    ref={inputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Start creating quiz with AI..."
                    onFocus={() => setCommonPanel(true)}
                    className={cn(
                        'h-full w-full pl-10 rounded-[6px]',
                        'placeholder:text-gamma/40 dark:placeholder:text-neutral-500',
                    )}
                    onKeyDown={handleInputKeyDown}
                />

                <PiMagnifyingGlass
                    size={20}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                />

                <ToolTipComponent content="upload pdf" className="cursor-pointer">
                    <UploadPDFButton onPdfSelect={onPdfSelect}>
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 p-1">
                            <AnimatedFolderIcon
                                strokeWidth={1.5}
                                stroke="#737373"
                                className="size-5 text-neutral-500 dark:text-neutral-400 "
                            />
                        </div>
                    </UploadPDFButton>
                </ToolTipComponent>

                {commonPanel && (
                    <div
                        className={cn(
                            'absolute z-50 top-12 w-full rounded-[6px]',
                            'shadow-md px-2 py-3',
                            'dark:bg-zinc-800 dark:text-white',
                            'flex flex-col gap-y-2',
                        )}
                    >
                        {handleCommonPanelDataAppearance()}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-4">
                <Button
                    onClick={handleCreateNewQuiz}
                    className="rounded-[4px] h-11 w-32 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white active:scale-98"
                >
                    <FiPlus />
                    <span>New Quiz</span>
                </Button>
            </div>
            <StartWithAi setOpen={setOpenAiComponent} open={openAiComponent} />
        </section>
    );
}

function AIBuiltQuizs({ quizs }: { quizs: QuizType[] }) {
    // quizes created using AI
    const ai_quizs = quizs.filter((q) => q.aiChat);

    return (
        <>
            <div className="text-xs px-2">Recent AI creations</div>

            <div className="flex flex-col">
                {ai_quizs.length !== 0 ? (
                    ai_quizs.map((q) => (
                        <RecentAICreatedCard
                            key={q.id}
                            theme={q.theme}
                            title={q.title}
                            difficulty={5}
                        />
                    ))
                ) : (
                    <div
                        className={cn(
                            'w-full flex justify-center items-center text-xs text-neutral-500',
                            'p-4',
                        )}
                    >
                        {"You haven't started creating quiz using AI"}
                    </div>
                )}
            </div>
        </>
    );
}
