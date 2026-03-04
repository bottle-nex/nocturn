import { QuizType } from '@nocturn/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import moment from 'moment';

interface TrashPanelQuizImageAndTitleComponentProps {
    quiz: QuizType & { daysLeftUntilPermanentDeletion?: number | null };
}

export default function TrashPanelQuizImageAndTitleComponent({
    quiz,
}: TrashPanelQuizImageAndTitleComponentProps) {
    const formattedTime = quiz.deletedAt ? moment(quiz.deletedAt).format('MMM D, YYYY') : '';

    return (
        <div className="flex items-center gap-x-2.5 mt-3 w-full overflow-hidden">
            {quiz.host?.image && (
                <Image
                    src={quiz.host.image}
                    width={32}
                    height={32}
                    alt="user-logo"
                    className="rounded-full"
                />
            )}
            <div className="flex flex-col h-full">
                <span className="block text-normal text-dark-base dark:text-light-base truncate w-[50%]">
                    {quiz.title}
                </span>
                <div className="flex items-center gap-x-2">
                    <span className="block dark:text-white/60 text-black/60 text-[13px]">
                        Deleted {formattedTime}
                    </span>
                    {quiz.daysLeftUntilPermanentDeletion != null && (
                        <>
                            <span className="h-3 w-px bg-black/30 dark:bg-white/30" />
                            <span
                                className={cn(
                                    'text-[13px] font-medium',
                                    quiz.daysLeftUntilPermanentDeletion <= 3
                                        ? 'text-red-500 dark:text-red-400'
                                        : 'dark:text-light-base/60 text-dark-base/80',
                                )}
                            >
                                {quiz.daysLeftUntilPermanentDeletion} day
                                {quiz.daysLeftUntilPermanentDeletion !== 1 ? 's' : ''} left
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
