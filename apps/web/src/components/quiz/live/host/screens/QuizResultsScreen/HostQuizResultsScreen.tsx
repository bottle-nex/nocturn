import HostQuizResultsScreensRenderer from './HostQuizResultsScreensRenderer';
import PrizeFinalizationPanel from '../../PrizeFinalizationPanel';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';

export default function HostQuizResultsScreen() {
    const { quiz } = useLiveQuizStore();

    return (
        <div className="flex h-full w-full relative">
            <HostQuizResultsScreensRenderer />
            {quiz.prizePool > 0 && <PrizeFinalizationPanel quizId={quiz.id} />}
        </div>
    );
}
