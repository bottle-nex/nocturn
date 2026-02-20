import { QuestionType, TemplateType } from '@nocturn/types';
import { IoCheckmark } from 'react-icons/io5';
import { RxCross1 } from 'react-icons/rx';

interface CanvasBarsProps {
    idx: number;
    option: string;
    votes: number[];
    currentQ: QuestionType;
    currentQTemplate: TemplateType | undefined;
    getBarHeight: (voteValue: number) => string;
}

export default function CanvasBars({
    idx,
    option,
    votes,
    currentQ,
    currentQTemplate,
    getBarHeight,
}: CanvasBarsProps) {
    const barColor = currentQTemplate?.bars?.[idx] ?? '#4F46E5';

    return (
        <div
            key={idx}
            className="flex flex-col items-center justify-end h-full flex-1 min-w-0 px-1"
        >
            <div className="flex items-center justify-center gap-x-1 mb-1 sm:mb-2 w-full">
                <div className="shrink-0">
                    {currentQ.correctAnswer === idx ? (
                        <IoCheckmark className="w-3 h-3 sm:w-5.5 sm:h-5.5 p-1.25 text-dark-alpha bg-[#cae8ce] rounded-full" />
                    ) : (
                        <RxCross1 className="w-3 h-3 sm:w-5.5 sm:h-5.5 p-1.5 text-dark-alpha bg-red-200 rounded-full" />
                    )}
                </div>
                <span className="text-xs sm:text-sm lg:text-base font-medium">
                    {Math.round(votes[idx]!)}
                </span>
            </div>

            <div
                className="w-full rounded-tr-md sm:rounded-tr-2xl transition-all duration-1000 ease-in-out border border-white/20 z-20"
                style={{
                    height: getBarHeight(votes[idx]!),
                    backgroundColor: barColor,
                }}
            />

            <div className="mt-1 sm:mt-2 min-h-6 sm:min-h-8 flex items-center justify-center w-full">
                <div className="text-xs sm:text-sm text-center px-0.5 sm:px-1 leading-tight font-light wrap-break-words">
                    <span className="hidden sm:inline">{option}</span>
                </div>
            </div>
        </div>
    );
}
