import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import LeaderboardPanelComponent, { Player } from '../common/LeaderboardPanelComponent';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { QuizPhaseEnum } from '@nocturn/types';

export default function HostLeaderboardPanel() {
    const { participants } = useLiveParticipantsStore();
    const { gameSession } = useLiveQuizStore();

    const sortedParticipants = [...participants].sort((p1, p2) => p2.totalScore - p1.totalScore);

    const emptyScoreBoard =
        sortedParticipants.length > 0 && sortedParticipants[0]?.totalScore === 0;

    const players: Player[] = sortedParticipants.map((p, index) => ({
        id: p.id,
        imageUrl: p.avatar!,
        name: p.nickname,
        rank: index + 1,
        score: p.totalScore,
    }));

    return (
        <>
            {emptyScoreBoard || gameSession?.currentPhase !== QuizPhaseEnum.SHOW_RESULTS ? (
                <div className="h-full w-full flex justify-center items-center dark:text-neutral-500 text-sm">
                    No one has attempted the question yet
                </div>
            ) : (
                <LeaderboardPanelComponent players={players} />
            )}
        </>
    );
}
