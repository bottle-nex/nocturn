import { create } from 'zustand';

export type ClaimPageStatus =
    | 'loading'
    | 'pending'
    | 'connecting'
    | 'claiming'
    | 'claimed'
    | 'expired'
    | 'error'
    | 'not_found';

interface ClaimData {
    id: string;
    quizTitle: string;
    currency: string;
    participantName: string;
    participantAvatar: string | null;
    rank: number;
    amount: number;
    amountLamports: string;
    status: string;
    claimedAt: string | null;
    claimerWallet: string | null;
    txSignature: string | null;
    expiresAt: string;
}

interface ClaimStoreTypes {
    pageStatus: ClaimPageStatus;
    claimData: ClaimData | null;
    error: string | null;
    setPageStatus: (status: ClaimPageStatus) => void;
    setClaimData: (data: ClaimData) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useClaimStore = create<ClaimStoreTypes>((set) => ({
    pageStatus: 'loading',
    claimData: null,
    error: null,

    setPageStatus: (status) => set({ pageStatus: status }),
    setClaimData: (data) => set({ claimData: data }),
    setError: (error) => set({ error }),

    reset: () =>
        set({
            pageStatus: 'loading',
            claimData: null,
            error: null,
        }),
}));
