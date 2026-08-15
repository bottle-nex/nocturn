import { Button } from '@/components/ui/button';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { HostScreenEnum } from '@nocturn/types';

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
                className="bg-green-600 dark:bg-green-600 text-white dark:text-white dark:hover:-translate-y-0.5 hover:bg-green-700 dark:hover:bg-green-700 z-20 cursor-pointer"
                onClick={handleQuestionPreviewPageChange}
            >
                Get Started
            </Button>
        </div>
    );
}
