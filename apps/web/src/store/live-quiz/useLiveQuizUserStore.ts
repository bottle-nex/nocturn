import { ParticipantType, SpectatorType, USER_TYPE, UserType } from '@nocturn/types';
import { create } from 'zustand';

// ---------------------------------------------------------------------------------------------->
interface LiveHostStore {
    hostData: UserType | null;
    updateHostData: (updatedFields: Partial<UserType>) => void;
    setHostData: (data: UserType) => void;
}

export const useLiveHostStore = create<LiveHostStore>((set) => ({
    hostData: null,
    updateHostData: (updatedFields: Partial<UserType>) => {
        set((state) => ({
            hostData: state.hostData
                ? {
                      ...state.hostData,
                      ...updatedFields,
                  }
                : (updatedFields as UserType),
        }));
    },
    setHostData: (data: UserType) => {
        set({ hostData: data });
    },
}));

// ---------------------------------------------------------------------------------------------->
interface LiveParticipantStore {
    participantData: ParticipantType | null;
    updateParticipantData: (updatedFields: Partial<ParticipantType>) => void;
    setParticipantData: (data: ParticipantType) => void;
    removeParticipantData: () => void;
}

export const useLiveParticipantStore = create<LiveParticipantStore>((set) => ({
    participantData: null,
    updateParticipantData: (updatedFields: Partial<ParticipantType>) => {
        set((state) => {
            if (
                state.participantData &&
                updatedFields.id &&
                state.participantData.id === updatedFields.id
            ) {
                return {
                    participantData: {
                        ...state.participantData,
                        ...updatedFields,
                    },
                };
            }

            return state;
        });
    },
    setParticipantData: (data: ParticipantType) => {
        set({ participantData: data });
    },
    removeParticipantData: () => {
        set({ participantData: null });
    },
}));

// ---------------------------------------------------------------------------------------------->
interface LiveSpectatorStore {
    spectatorData: SpectatorType | null;
    updateSpectatorData: (updatedFields: Partial<SpectatorType>) => void;
    setSpectatorData: (data: SpectatorType) => void;
}

export const useLiveSpectatorStore = create<LiveSpectatorStore>((set) => ({
    spectatorData: null,
    updateSpectatorData: (updatedFields: Partial<SpectatorType>) => {
        set((state) => ({
            spectatorData: state.spectatorData
                ? {
                      ...state.spectatorData,
                      ...updatedFields,
                  }
                : (updatedFields as SpectatorType),
        }));
    },
    setSpectatorData: (data: SpectatorType) => {
        set({ spectatorData: data });
    },
}));

// ---------------------------------------------------------------------------------------------->
interface UserRoleStore {
    currentUserType: USER_TYPE | null;
    setCurrentUserType: (userType: USER_TYPE) => void;
    clearCurrentUserType: () => void;
    isHost: () => boolean;
    isParticipant: () => boolean;
    isSpectator: () => boolean;
}

export const useUserRoleStore = create<UserRoleStore>((set, get) => ({
    currentUserType: null,
    setCurrentUserType: (userType: USER_TYPE) => {
        set({ currentUserType: userType });
    },
    clearCurrentUserType: () => {
        set({ currentUserType: null });
    },
    isHost: () => get().currentUserType === USER_TYPE.HOST,
    isParticipant: () => get().currentUserType === USER_TYPE.PARTICIPANT,
    isSpectator: () => get().currentUserType === USER_TYPE.SPECTATOR,
}));
