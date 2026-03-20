'use client';

import { useSettingsStore, SETTINGS_TAB } from '@/store/home/useSettingsStore';
import ProfileSettingsComponent from '../revamp/SettingsPanelComponent/ProfileSettingsComponent';
import ThemeSettingsComponent from '../revamp/SettingsPanelComponent/ThemeSettingsComponent';
import { cn } from '@/lib/utils';

export default function SettingsPanel() {
    const { activeSettingsTab, setActiveSettingsTab } = useSettingsStore();

    const renderContent = () => {
        switch (activeSettingsTab) {
            case SETTINGS_TAB.PROFILE:
                return <ProfileSettingsComponent />;
            case SETTINGS_TAB.THEME:
                return <ThemeSettingsComponent />;
            case SETTINGS_TAB.GAME:
                return <div>Game Component</div>;
            case SETTINGS_TAB.WALLET:
                return <div>Wallet Component</div>;
            default:
                return null;
        }
    };
    const tabClass = (tab: SETTINGS_TAB) =>
        `px-4 w-full h-full flex items-center rounded-sm cursor-pointer transition-all duration-150
  ${
      activeSettingsTab === tab
          ? 'bg-white ring-1 ring-black/[0.05] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.09)] text-dark-base dark:bg-[#1a1a1a] dark:ring-white/[0.06] dark:shadow-[0_1px_3px_rgba(0,0,0,0.5)] dark:text-light-base'
          : 'hover:bg-white/50 hover:text-dark-base dark:hover:bg-white/[0.04] dark:hover:text-light-base'
  }`;

    return (
        <div
            className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col overflow-y-auto custom-scrollbar"
            data-lenis-prevent
        >
            <div className="text-4xl text-dark-base dark:text-light-base">Settings</div>

            <div
                className={cn(
                    'h-10 w-fit rounded-md flex items-center',
                    'ring-1 ring-black/10 dark:ring-white/[0.06]',
                    'p-1 gap-x-1 mt-5 ml-1',
                    'text-dark-base/70 dark:text-light-base/40 text-[13px]',
                    'bg-light-base dark:bg-[#0f0f0f]',
                    'shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_5px_rgba(0,0,0,0.4)]',
                )}
            >
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

            <div
                className="mt-5 w-full flex-1 min-h-0 overflow-y-auto custom-scrollbar p-1 max-w-[50rem]"
                data-lenis-prevent
            >
                {renderContent()}
            </div>
        </div>
    );
}
