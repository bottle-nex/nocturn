import EmptyCanvas from "@/components/canvas/EmptyCanvas";
import { templates } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { useAiChatStore } from "@/store/home/useAiChatStore";
import { AiMessageElement, QuizType } from "@nocturn/types";

interface SystemMessageProps {
    type: AiMessageElement;
    content?: string;
}

export default function SystemMessage({ type, content }: SystemMessageProps) {

    const { quiz } = useAiChatStore();

    switch (type) {
        case AiMessageElement.QUIZ:
            return <QuizMessage quiz={quiz!} />;
        case AiMessageElement.TITLE:
            return <TitleMessage title={content!} />;
    }
}

function TitleMessage({ title }: { title: string }) {
    return (
        <div className="flex justify-start items-start w-full text-sm ">
            <div className="flex items-start gap-x-2 max-w-[70%]">
                <div
                    className={cn(
                        'px-4 py-2 rounded-tr-[8px] rounded-b-[8px] text-sm font-normal',
                        'bg-linear-to-b from-[#111212] to-[#121313] border border-neutral-800',
                        'text-light/80 text-left tracking-wider mt-2.5',
                        'max-w-full min-w-0',
                    )}
                >
                    <div className="w-full min-w-0 break-words whitespace-pre-wrap">
                        {title}
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuizMessage({ quiz }: { quiz: QuizType }) {

    const template = templates.find((t) => t.id == quiz?.theme);

    return (
        <div className="max-w-[400px] w-full ">
            <EmptyCanvas
                onClick={() => {}}
                question={quiz?.questions[0].question}
                options={quiz?.questions[0].options}
                className={cn(
                    'w-full aspect-video rounded-[10px] outline-2 select-none',
                    'outline-black/40 dark:outline-white/40',
                )}
                template={template!}
            />
        </div>
    );
}