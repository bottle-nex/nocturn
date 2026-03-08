import { Session } from 'next-auth';
import { create } from 'zustand';

interface UserSessionStoreType {
    session: Session | null;
    openSigninModal: boolean;
    openLogoutModal: boolean;

    
    setOpenLogoutModal: (open: boolean) => void;
    setSession: (data: Session | null) => void;
    setOpenSigninModal: (open: boolean) => void;
}

export const useUserSessionStore = create<UserSessionStoreType>((set) => ({
    session: null,
    openSigninModal: false,
    openLogoutModal: false,
    setSession: (data: Session | null) => set({ session: data }),
    setOpenSigninModal: (open: boolean) => set({ openSigninModal: open }),
    setOpenLogoutModal: (open: boolean) => set({ openLogoutModal: open }),
}));
