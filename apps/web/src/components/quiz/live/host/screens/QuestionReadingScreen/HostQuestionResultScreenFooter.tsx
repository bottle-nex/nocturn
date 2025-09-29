import { Button } from '@/components/ui/button';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { HostScreenEnum } from '@/types/prisma-types';

export default function HostQuestionResultScreenFooter() {
    const { updateGameSession } = useLiveQuizStore();
    function handleQuestionPreviewPageChange() {
        updateGameSession({
            hostScreen: HostScreenEnum.QUESTION_PREVIEW,
        });
    }

    return (
        <div className="absolute bottom-4 left-4 z-100 flex items-center justify-start gap-x-4 w-fit">
            <Button
                className="dark:bg-dark-base dark:text-neutral-100 bg-neutral-300 text-black dark:hover:-translate-y-0.5 z-20 cursor-pointer"
                onClick={handleQuestionPreviewPageChange}
            >
                Get Started
            </Button>
        </div>
    );
}
