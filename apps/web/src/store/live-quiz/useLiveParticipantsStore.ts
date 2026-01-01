import { ParticipantType, ResponseType } from '@nocturn/types';
import { create } from 'zustand';

interface LiveParticipantsStoreProps {
    participants: ParticipantType[];
    setParticipants: (participants: ParticipantType[]) => void;
    upsertParticipant: (participant: ParticipantType) => void;
    removeParticipant: (participantId: string) => void;
    getParticipant: (participantId: string) => ParticipantType | undefined;
    updateParticipants: (participants: Partial<ParticipantType>[]) => void;

    responses: Partial<ResponseType>[];
    setResponses: (responses: Partial<ResponseType>[]) => void;
    getResponse: (participantId: string) => Partial<ResponseType> | undefined;
    upsertResponse: (response: Partial<ResponseType>) => void;
    updateResponses: (responses: Partial<ResponseType>[]) => void;
    removeResponse: (participantId: string) => void;

    response: Partial<ResponseType> | null;
    setResponse: (response: Partial<ResponseType>) => void;
    updateResponse: (response: Partial<ResponseType>) => void;
    resetResponse: () => void;
}

export const useLiveParticipantsStore = create<LiveParticipantsStoreProps>((set, get) => ({
    // <----------------- Participants ----------------->
    participants: [],

    setParticipants: (participantsData) => set({ participants: participantsData }),

    upsertParticipant: (participant) => {
        set((state) => {
            const existingIndex = state.participants.findIndex((p) => p.id === participant.id);
            if (existingIndex !== -1) {
                const updated = [...state.participants];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    ...participant,
                    id: updated[existingIndex]!.id,
                };
                return { participants: updated };
            }
            return { participants: [...state.participants, participant] };
        });
    },

    removeParticipant: (participantId) =>
        set((state) => ({
            participants: state.participants.filter((p) => p.id !== participantId),
        })),

    getParticipant: (participantId) => get().participants.find((p) => p.id === participantId),

    updateParticipants: (participants) =>
        set((state) => {
            const updated = state.participants.map((p) => {
                const incoming = participants.find((up) => up.id === p.id);
                return incoming ? { ...p, ...incoming, id: p.id } : p;
            });
            return { participants: updated };
        }),

    // <----------------- Responses ----------------->
    responses: [],

    setResponses: (responses) => set({ responses }),

    getResponse: (participantId) => get().responses.find((r) => r.participantId === participantId),

    upsertResponse: (response) =>
        set((state) => {
            const existingIndex = state.responses.findIndex(
                (r) => r.participantId === response.participantId,
            );
            if (existingIndex !== -1) {
                const updated = [...state.responses];
                updated[existingIndex] = { ...updated[existingIndex], ...response };
                return { responses: updated };
            }
            return { responses: [...state.responses, response] };
        }),

    updateResponses: (responses) =>
        set((state) => {
            const updated = state.responses.map((r) => {
                const incoming = responses.find((up) => up.id === r.id);
                return incoming ? { ...r, ...incoming, id: r.id } : r;
            });
            return { responses: updated };
        }),

    removeResponse: (participantId) =>
        set((state) => ({
            responses: state.responses.filter((r) => r.participantId !== participantId),
        })),

    // <----------------- Single Response ----------------->
    response: null,

    setResponse: (response) => set({ response }),

    updateResponse: (response) =>
        set((state) => ({
            response: state.response ? { ...state.response, ...response } : response,
        })),

    resetResponse: () => set({ response: null }),
}));
