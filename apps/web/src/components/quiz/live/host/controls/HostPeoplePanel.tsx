'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import HostSpectatorsPanel from './HostSpectatorsPanel';
import HostParticipantsPanel from './HostParticipantPanel';

export enum PeopleViewType {
    SPECTATORS = 'SPECTATORS',
    PARTICIPANTS = 'PARTICIPANTS',
}

export default function HostPeoplePanel() {
    const [view, setView] = useState<PeopleViewType>(PeopleViewType.SPECTATORS);

    const renderPanel = () => {
        switch (view) {
            case PeopleViewType.SPECTATORS:
                return <HostSpectatorsPanel />;
            case PeopleViewType.PARTICIPANTS:
                return <HostParticipantsPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden py-2 overflow-y-auto custom-scrollbar relative">
            <div className="flex-1">{renderPanel()}</div>
            <div className="sticky top-0 z-10 w-full px-6 py-2">
                <div className="grid grid-cols-2 gap-3 dark:bg-neutral-800 backdrop-blur-md rounded-xl border shadow-md">
                    {Object.values(PeopleViewType).map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => setView(tab)}
                            className={cn(
                                'px-4 py-2 rounded-xl text-xs font-medium transition-all bg-transparent dark:bg-transparent col-span-1 lowercase  cursor-pointer',
                                {
                                    'bg-white/30 dark:bg-neutral-950/50 text-dark-base dark:text-white shadow':
                                        view === tab,
                                    'text-neutral-500 dark:text-neutral-400': view !== tab,
                                },
                            )}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
