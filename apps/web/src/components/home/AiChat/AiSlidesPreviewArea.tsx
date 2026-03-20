import PreviewCanvas from '@/components/canvas/PreviewCanvas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FaBrush } from 'react-icons/fa6';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { TemplateType } from '@nocturn/types';
import { useRef, useState } from 'react';
import React from 'react';

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
    const { quiz, messages } = useAiChatStore();
    // const { templates } = useQuizTemplatesStore();
    const [showCancelPanel, setShowCancelPanel] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
            setShowCancelPanel(false);
        }
    }

    return (
        <div className="flex-1 h-full bg-light-alpha dark:bg-dark-alpha overflow-hidden flex flex-col items-center justify-center w-full relative">
            <section className="flex items-center justify-between w-full px-8 py-4">
                <div className="flex items-center justify-center text-dark-base/90 dark:text-light-alpha/90 text-sm cursor-pointer">
                    <FaBrush className="mr-2 mt-0.75" />
                    <span>change theme</span>
                </div>
                <h1 className="dark:text-light-alpha text-dark-alpha">{quiz?.title}</h1>
                <div className="flex items-center gap-x-2">
                    <Button
                        onClick={() => {
                            messages.length > 0 ? setShowCancelPanel(true) : onClose();
                        }}
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
                {(quiz?.questions?.length ?? 0) > 0 &&
                    quiz!.questions!.map((question, index) => (
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

            {showCancelPanel && messages.length > 0 && (
                <CancelConfirmationPanel
                    panelRef={panelRef}
                    onBackdropClick={handleBackdropClick}
                    onGoBack={() => setShowCancelPanel(false)}
                    onDiscard={onClose}
                />
            )}
        </div>
    );
}

interface CancelConfirmationPanelProps {
    panelRef: React.RefObject<HTMLDivElement | null>;
    onBackdropClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    onGoBack: () => void;
    onDiscard: () => void;
}

function CancelConfirmationPanel({
    panelRef,
    onBackdropClick,
    onGoBack,
    onDiscard,
}: CancelConfirmationPanelProps) {
    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={onBackdropClick}
        >
            <div
                ref={panelRef}
                className="bg-light-base dark:bg-dark-alpha border border-dark-alpha/10 dark:border-light-base/10 rounded-[8px] shadow-2xl p-6 w-80 flex flex-col gap-y-4"
            >
                <div className="flex flex-col gap-y-1">
                    <h2 className="text-dark-base dark:text-light-base font-semibold text-base">
                        Discard this chat?
                    </h2>
                    <p className="text-dark-alpha/50 dark:text-light-alpha/50 text-sm leading-relaxed">
                        You will not be able to reuse this chat again. This action cannot be undone.
                    </p>
                </div>
                <div className="flex items-center justify-end gap-x-2 mt-1">
                    <Button
                        onClick={onGoBack}
                        className={cn(
                            'rounded-sm',
                            'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-200/80 dark:hover:bg-neutral-800/80',
                            'text-dark-alpha dark:text-light-alpha',
                        )}
                    >
                        Go back
                    </Button>
                    <Button
                        onClick={onDiscard}
                        className={cn('rounded-sm', 'bg-red-500 hover:bg-red-600', 'text-white')}
                    >
                        Discard
                    </Button>
                </div>
            </div>
        </div>
    );
}
