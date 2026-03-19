import { create } from 'zustand';

export enum SETTINGS_TAB {
    PROFILE = 'PROFILE',
    THEME = 'THEME',
    WALLET = 'WALLET',
    GAME = 'GAME',
}

interface SettingsStoreData {
    activeSettingsTab: SETTINGS_TAB;
    setActiveSettingsTab: (tab: SETTINGS_TAB) => void;
}

export const useSettingsStore = create<SettingsStoreData>((set) => ({
    activeSettingsTab: SETTINGS_TAB.PROFILE,
    setActiveSettingsTab: (tab: SETTINGS_TAB) => set({ activeSettingsTab: tab }),
}));
