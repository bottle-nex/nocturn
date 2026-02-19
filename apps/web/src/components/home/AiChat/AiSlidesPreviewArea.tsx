import PreviewCanvas from '@/components/canvas/PreviewCanvas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FaBrush } from 'react-icons/fa6';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { TemplateType } from '@nocturn/types';

interface AiSlidesPreviewAreaProps {
    onContinue: () => void;
    onClose: () => void;
    selectedTemplate: TemplateType;
}

export default function AiSlidesPreviewArea({
    onContinue,
    onClose,
    selectedTemplate,
}: AiSlidesPreviewAreaProps) {
    const { quiz } = useAiChatStore();

    return (
        <div className="flex-1 h-full bg-light-alpha dark:bg-dark-alpha overflow-hidden flex flex-col items-center justify-center w-full">
            <section className="flex items-center justify-between w-full px-8 py-4">
                <div className="flex itcems-center justify-center text-dark-base/90 dark:text-light-alpha/90 text-sm cursor-pointer">
                    <FaBrush className="mr-2 mt-0.75" />
                    <span>change theme</span>
                </div>
                <h1 className="dark:text-light-alpha text-dark-alpha">{quiz?.title}</h1>
                <div className="flex items-center gap-x-2">
                    <Button
                        onClick={onClose}
                        className={cn(
                            'rounded-full',
                            'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-800/80',
                            'text-dark-alpha dark:text-light-alpha',
                        )}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onContinue}
                        className={cn(
                            'rounded-full',
                            'bg-dark-alpha/90 dark:bg-light-base hover:bg-dark-alpha dark:hover:bg-light-base/80',
                            'text-light-alpha dark:text-dark-alpha',
                        )}
                    >
                        Continue
                    </Button>
                </div>
            </section>
            <div
                className="flex-1 flex flex-col items-center text-center text-neutral-500 px-10 py-5 w-full mx-auto overflow-y-auto custom-scrollbar gap-y-8"
                data-lenis-prevent
            >
                {quiz?.questions &&
                    quiz?.questions?.length > 0 &&
                    quiz?.questions.map((question, index) => (
                        <div key={index} className="w-full flex justify-center">
                            <PreviewCanvas
                                orderIndex={question.orderIndex}
                                backgroundColor={selectedTemplate?.backgroundColor || ''}
                                accentType={selectedTemplate?.accentType || ''}
                                accentColor={selectedTemplate?.accentColor || ''}
                                question={question}
                                textColor={selectedTemplate?.textColor || ''}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
}
