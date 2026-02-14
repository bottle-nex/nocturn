'use client';
import { cn } from '@/lib/utils';
import { JSX, useEffect, useRef, useState } from 'react';

import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import CanvasAccents from '../utility/CanvasAccents';
import CanvasHeading from './CanvasHeading';
import Image from 'next/image';
import CanvasOptions from './CanvasOptions';
import { getImageContainerWidth, useWidth } from '@/hooks/useWidth';
import { SELECTION_MODE, useCanvasSelectionStore } from '@/store/new-quiz/useCanvasSelectionStore';

interface CanvasProps {
    className?: string;
}

export default function Canvas({ className }: CanvasProps): JSX.Element {
    const { currentOn, setCurrentOn } = useCanvasSelectionStore();
    const selectedStyles = 'border-2 border-indigo-800/60';
    const [copied, setCopied] = useState<boolean>(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const { currentQuestionIndex, quiz } = useNewQuizStore();
    const currentQ = quiz.questions[currentQuestionIndex];

    const canvasWidth = useWidth(canvasRef);

    useEffect(() => {
        if (copied) {
            const t = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(t);
        }
    }, [copied]);

    function canvasTapHandler() {
        setCurrentOn(SELECTION_MODE.CANVAS);
    }

    const theme = quiz.template;

    return (
        <div
            ref={canvasRef}
            style={{
                color: theme?.textColor ?? '#000',
                boxSizing: 'border-box',
            }}
            onClick={canvasTapHandler}
            className={cn(
                'w-full md:max-w-5xl aspect-video rounded-lg relative overflow-hidden',
                currentOn === SELECTION_MODE.CANVAS && selectedStyles,
                className,
            )}
        >
            <CanvasAccents design={theme?.accentType} accentColor={theme?.accentColor} />

            <div
                style={{
                    backgroundColor: theme?.backgroundColor ?? '#196cff',
                }}
                className="h-full rounded-md relative flex flex-col"
            >
                {/* <JoinQuizCodeTicker /> */}
                <CanvasHeading currentQ={currentQ} />

                <div className="flex-1 flex items-end justify-center mb-8">
                    <CanvasOptions />

                    {currentQ?.imageUrl && (
                        <div
                            className={cn(
                                'h-full flex flex-col justify-end p-2 sm:p-4 relative mb-15',
                                getImageContainerWidth(canvasWidth),
                            )}
                        >
                            <div className="w-full overflow-hidden relative rounded-sm">
                                <Image
                                    src={currentQ.imageUrl}
                                    alt="Question reference image"
                                    className="object-contain w-full h-auto"
                                    width={500}
                                    height={500}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
