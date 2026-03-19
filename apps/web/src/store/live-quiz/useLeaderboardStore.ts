import { create } from 'zustand';

export interface LeaderboardEntry {
    id: string;
    totalScore: number;
    rank: number;
    nickname: string;
    avatar: string | null;
}

interface LeaderboardStoreProps {
    topLeaderboard: LeaderboardEntry[];
    setTopLeaderboard: (top: LeaderboardEntry[]) => void;

    myRank: number | null;
    myScore: number | null;
    totalParticipants: number;
    setMyRank: (rank: number, score: number, total: number) => void;

    resetLeaderboard: () => void;
}

export const useLeaderboardStore = create<LeaderboardStoreProps>((set) => ({
    topLeaderboard: [],
    setTopLeaderboard: (top) => set({ topLeaderboard: top }),

    myRank: null,
    myScore: null,
    totalParticipants: 0,
    setMyRank: (rank, score, total) =>
        set({ myRank: rank, myScore: score, totalParticipants: total }),

    resetLeaderboard: () =>
        set({
            topLeaderboard: [],
            myRank: null,
            myScore: null,
            totalParticipants: 0,
        }),
}));
