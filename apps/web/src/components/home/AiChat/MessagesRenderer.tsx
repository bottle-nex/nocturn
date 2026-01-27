import { cn } from "@/lib/utils";
import { useAiChatStore } from "@/store/home/useAiChatStore";
import Message from "./Message";

interface MessagesRendererProps {
    className?: string;
}

export default function MessagesRenderer({ className = '' }: MessagesRendererProps) {

    const { messages } = useAiChatStore();

    return (
        <div className={cn(
            'max-w-87.5 w-full h-130 border bg-dark-alpha border-neutral-800 rounded-xl ',
            'overflow-hidden',
            'flex flex-col p-2 overflow-y-auto ',
            className,
        )}>

        {messages.map((m, i) => (
            <Message
                message={m}
                loading={false}
                key={i}
            />
        ))}

        </div>
    );
}