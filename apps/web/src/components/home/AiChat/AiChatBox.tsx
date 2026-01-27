import AnimatedFolderIcon from "@/components/ui/animated-icons/AnimatedFolderIcon";
import { Input } from "@/components/ui/input";
import MicIcon from "@/components/ui/svg/MicIcon";
import UploadPDFButton from "@/components/ui/UploadPDFButton";
import ToolTipComponent from "@/components/utility/TooltipComponent";
import AiBackendAction from "@/lib/backend/home/start-with-ai-action";
import { cn } from "@/lib/utils";
import { useAiChatStore } from "@/store/home/useAiChatStore";
import { useUserSessionStore } from "@/store/user/useUserSessionStore";
import { AiQuizChatRole, AiQuizMessage } from "@nocturn/types";
import { useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { IoMdArrowRoundUp } from "react-icons/io";
import { v4 as uuid } from "uuid";
import MessagesRenderer from "./MessagesRenderer";
import { FaSquare } from "react-icons/fa6";


export default function AiChatBox() {

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [prompt, setPrompt] = useState<string>('');
    const { appendMessage, loading } = useAiChatStore();
    const { session } = useUserSessionStore();

    function handleOnKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleSubmit() {
        if (!prompt.trim()) return;

        // temporary session-id
        const sessionId = uuid();

        // create the user message
        const message: AiQuizMessage = {
            id: uuid(),
            aiQuizChatSessionId: sessionId,
            role: AiQuizChatRole.USER,
            content: prompt,
            createdAt: new Date(),
        };

        // append the message in client side
        appendMessage(message);

        // send the prompt
        AiBackendAction.create_quiz(session?.user.token, sessionId, prompt);

        setPrompt('');
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                'absolute bottom-10 right-10 max-w-87.5 w-full h-11 rounded-full px-2 ',
                'border border-neutral-800 dark:border-neutral-800 dark:bg-dark-alpha dark:text-white',
                'flex justify-center items-center',
            )}
        >

            <div className={cn(
                'flex justify-center items-center rounded-full p-1.5 cursor-pointer ',
                'hover:bg-neutral-800 transition'
            )}>
                <GoPlus
                    size={16}
                    className="text-neutral-700 dark:text-neutral-400"
                />
            </div>

            <Input
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Start creating quiz with AI..."
                className={cn(
                    'h-full w-full text-xs',
                    'placeholder:text-gamma/40 dark:placeholder:text-neutral-500',
                    'bg-transparent! border-none'
                )}
                onKeyDown={handleOnKeyDown}
            />

            <ToolTipComponent
                content={prompt ? "" : "Dictate"}
                className="cursor-pointer"
                side="top"
            >
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full cursor-pointer',
                        'w-7 h-7 aspect-square leading-none',
                        loading ? 'bg-neutral-800' : 'bg-light-alpha'
                    )}
                >

                    {loading ? (
                        <FaSquare
                            size={13}
                            className="text-neutral-300"
                        />
                    ) : prompt ? (
                        <IoMdArrowRoundUp
                            size={16}
                            className="text-neutral-800"
                        />
                    ) : (
                        <MicIcon size={16} />
                    )}
                </div>

            </ToolTipComponent>

            <MessagesRenderer
                className="absolute bottom-12 "
            />

        </div>

    );
}