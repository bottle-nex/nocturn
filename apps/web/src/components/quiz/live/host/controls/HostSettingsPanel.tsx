'use client';

import { useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import OnOffToggle from '../../common/OnOffToggle';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';

enum SettingsView {
    HOST = 'HOST',
    SPECTATOR = 'SPECTATOR',
    PARTICIPANT = 'PARTICIPANT',
}

interface QuizSetting {
    liveChat: boolean;
    interactionMode: boolean;
    watchLeaderBoard: boolean;
    allowNewSpectator: boolean;
}

export default function HostSettingsPanel() {
    const [view, setView] = useState<SettingsView>(SettingsView.HOST);
    const [leaderboardEnabled, setLeaderboardEnabled] = useState<boolean>(false);
    const [participantsLeaderboardEnabled, setParticipantsLeaderboardEnabled] =
        useState<boolean>(false);
    const [interactionsForMeEnabled, setInteractionsForMeEnabled] = useState<boolean>(false);
    const { handleSettingsChangeEvent } = useWebSocket();
    const { quiz, updateQuiz } = useLiveQuizStore();
    const [settings, setSettings] = useState<QuizSetting>({
        liveChat: quiz.liveChat,
        interactionMode: false,
        watchLeaderBoard: false,
        allowNewSpectator: quiz.allowNewSpectator,
    });

    function handleSettingsChange<K extends keyof QuizSetting>(key: K, value: QuizSetting[K]) {
        setSettings((prev: QuizSetting) => {
            const newSettings = { ...prev, [key]: value };
            handleSettingsChangeEvent({
                liveChat: newSettings.liveChat,
                allowNewSpectator: newSettings.allowNewSpectator,
            });
            return newSettings;
        });

        updateQuiz({
            [key]: value,
        });
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden py-2 overflow-y-auto custom-scrollbar relative">
            <div className="sticky top-0 z-10 w-full px-6 py-2">
                <div className="grid grid-cols-3 gap-3 dark:bg-neutral-800 backdrop-blur-md rounded-xl border shadow-md">
                    {Object.values(SettingsView).map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => setView(tab)}
                            className={cn(
                                'px-4 py-2 rounded-xl text-xs font-medium transition-all bg-transparent dark:bg-transparent col-span-1 lowercase',
                                {
                                    'bg-white/30 dark:bg-neutral-950/50 text-dark-base dark:text-white shadow':
                                        view === tab,
                                    'text-neutral-500 dark:text-neutral-400': view !== tab,
                                },
                            )}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="px-5 py-2 text-dark-base dark:text-light-base">
                {view === SettingsView.HOST && (
                    <div className="space-y-6 px-4 mt-3">
                        <SettingRow
                            title="View Interactions"
                            description="Allow interaction visibility"
                            tooltip="Enable/Disable interactions directed towards me"
                            value={interactionsForMeEnabled}
                            onChange={setInteractionsForMeEnabled}
                        />
                    </div>
                )}

                {view === SettingsView.SPECTATOR && (
                    <div className="space-y-6 px-4 mt-3">
                        <SettingRow
                            title="Chats"
                            description="Chat for spectators"
                            tooltip="Enable/Disable chat-option for spectators"
                            value={settings.liveChat}
                            onChange={(val) => handleSettingsChange('liveChat', val)}
                        />
                        <SettingRow
                            title="Leaderboard"
                            description="Leaderboard for spectators"
                            tooltip="Enable/Disable leaderboard view for spectators"
                            value={leaderboardEnabled}
                            onChange={setLeaderboardEnabled}
                        />
                        <SettingRow
                            title="Allow new spectators"
                            description="Join quiz for spectators"
                            tooltip="Enable/Disable join for new spectators"
                            value={settings.allowNewSpectator}
                            onChange={(val) => handleSettingsChange('allowNewSpectator', val)}
                        />
                    </div>
                )}

                {view === SettingsView.PARTICIPANT && (
                    <div className="space-y-6 px-4 mt-3">
                        <SettingRow
                            title="Leaderboard"
                            description="Leaderboard for participants"
                            tooltip="Enable/Disable leaderboard view for participants"
                            value={participantsLeaderboardEnabled}
                            onChange={setParticipantsLeaderboardEnabled}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

interface SettingsRowProps {
    title: string;
    description: string;
    tooltip: string;
    value?: boolean;
    onChange: (val: boolean) => void;
}

export function SettingRow({
    title,
    description,
    tooltip,
    value = false,
    onChange,
}: SettingsRowProps) {
    return (
        <div className="flex justify-between items-center">
            <div className="flex flex-col gap-y-0.5">
                <div className="flex items-center gap-x-1">
                    <span className="text-sm font-normal text-dark-primary dark:text-light-base">
                        {title}
                    </span>
                    <ToolTipComponent content={tooltip}>
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <span className="text-xs pt-2 text-neutral-500 dark:text-neutral-400">
                    {description}
                </span>
            </div>

            <OnOffToggle value={value} onChange={onChange} />
        </div>
    );
}
