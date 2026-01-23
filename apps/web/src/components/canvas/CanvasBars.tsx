import { Template } from '@/lib/templates';
import { QuestionType } from '@nocturn/types';
import { IoIosCheckmark } from 'react-icons/io';
import { RxCross2 } from 'react-icons/rx';

interface CanvasBarsProps {
    idx: number;
    option: string;
    votes: number[];
    currentQ: QuestionType;
    currentQTemplate: Template | undefined;
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
    return (
        <div
            key={idx}
            className="flex flex-col items-center justify-end h-full flex-1 min-w-0 px-1"
        >
            <div className="flex items-center justify-center gap-x-1 mb-1 sm:mb-2 w-full">
                <div className="flex-shrink-0">
                    {currentQ.correctAnswer === idx ? (
                        <IoIosCheckmark className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 bg-green-200 rounded-full border-[0.5px] border-green-500" />
                    ) : (
                        <RxCross2 className="bg-red-300 rounded-full p-0.5 sm:p-1 text-red-950 w-3 h-3 sm:w-4 sm:h-4" />
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
                    backgroundColor: `${currentQTemplate?.bars[idx]}` || '#4F46E5',
                }}
            />

            <div className="mt-1 sm:mt-2 min-h-[1.5rem] sm:min-h-[2rem] flex items-center justify-center w-full">
                <div className="text-xs sm:text-sm text-center px-0.5 sm:px-1 leading-tight font-light break-words">
                    <span className="hidden sm:inline">{option}</span>
                </div>
            </div>
        </div>
    );
}
