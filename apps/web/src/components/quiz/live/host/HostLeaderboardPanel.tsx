import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';
import LeaderboardPanelComponent, { Player } from '../common/LeaderboardPanelComponent';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { QuizPhaseEnum } from '@nocturn/types';

export default function HostLeaderboardPanel() {
    const { topLeaderboard, myRank, myScore } = useLeaderboardStore();
    const { gameSession } = useLiveQuizStore();
    console.log("top leaderboard is : ", topLeaderboard);
    console.log("my rank is : ", myRank);
    console.log("my score is : ", myScore);
    const emptyScoreBoard = topLeaderboard.length > 0 && topLeaderboard[0]?.totalScore === 0;

    const players: Player[] = topLeaderboard.map((entry) => ({
        id: entry.id,
        imageUrl: entry.avatar ?? '/default-avatar.png',
        name: entry.nickname,
        rank: entry.rank,
        score: entry.totalScore,
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
