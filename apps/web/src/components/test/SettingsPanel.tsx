'use client';

import { useSettingsStore, SETTINGS_TAB } from '@/store/home/useSettingsStore';
import ProfileSettingsComponent from '../revamp/SettingsPanelComponent/ProfileSettingsComponent';

export default function SettingsPanel() {
    const { activeSettingsTab, setActiveSettingsTab } = useSettingsStore();

    const renderContent = () => {
        switch (activeSettingsTab) {
            case SETTINGS_TAB.PROFILE:
                return <ProfileSettingsComponent />;
            case SETTINGS_TAB.THEME:
                return <div>Theme Component</div>;
            case SETTINGS_TAB.GAME:
                return <div>Game Component</div>;
            case SETTINGS_TAB.WALLET:
                return <div>Wallet Component</div>;
            default:
                return null;
        }
    };

    const tabClass = (tab: SETTINGS_TAB) =>
        `px-4 w-full h-full flex items-center rounded-sm cursor-pointer transition-colors
        ${
            activeSettingsTab === tab
                ? 'bg-alpha/20 text-dark-base dark:text-light-base'
                : 'hover:bg-alpha/10 hover:text-dark-base'
        }`;

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col overflow-y-auto custom-scrollbar" data-lenis-prevent>
            <div className="text-4xl text-dark-base dark:text-light-base">Settings</div>

            <div className="h-10 w-fit rounded-md flex gap-x-1 ring-1 ring-black/10 items-center p-1 text-dark-base/70 text-[13px] bg-light-base/30 mt-5">
                <div
                    onClick={() => setActiveSettingsTab(SETTINGS_TAB.PROFILE)}
                    className={tabClass(SETTINGS_TAB.PROFILE)}
                >
                    Profile
                </div>
                <div
                    onClick={() => setActiveSettingsTab(SETTINGS_TAB.THEME)}
                    className={tabClass(SETTINGS_TAB.THEME)}
                >
                    Theme
                </div>
                <div
                    onClick={() => setActiveSettingsTab(SETTINGS_TAB.GAME)}
                    className={tabClass(SETTINGS_TAB.GAME)}
                >
                    Game
                </div>
                <div
                    onClick={() => setActiveSettingsTab(SETTINGS_TAB.WALLET)}
                    className={tabClass(SETTINGS_TAB.WALLET)}
                >
                    Wallet
                </div>
            </div>

            <div className="mt-10 w-full flex-1 min-h-0 overflow-y-auto custom-scrollbar" data-lenis-prevent>
                {renderContent()}
            </div>
        </div>
    );
}
