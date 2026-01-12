'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoPeopleSharp, IoSettingsSharp } from 'react-icons/io5';
import { HiChartBar, HiDocumentText } from 'react-icons/hi';
import { MdHomeFilled } from 'react-icons/md';
import { cn } from '@/lib/utils';
import AppLogo from '../app/AppLogo';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';
import DarkModeToggle from '../base/DarkModeToggle';

export enum SidebarTab {
    HOME = 'home',
    TEAM = 'team',
    ANALYTICS = 'analytics',
    DOCUMENTS = 'documents',
    SETTINGS = 'settings',
    TRASH = 'trash',
    CHATS = 'chats',
}

interface SidebarItem {
    tab: SidebarTab;
    label: string;
    icon?: React.ReactNode;
    className?: string;
}

const sidebarItems: SidebarItem[] = [
    {
        tab: SidebarTab.HOME,
        label: 'Home',
        icon: <MdHomeFilled size={20} />,
        className: 'text-black bg-[#93BD57]',
    },
    {
        tab: SidebarTab.TEAM,
        label: 'Team',
        icon: <IoPeopleSharp size={20} />,
        className: 'text-black bg-[#5C6BC0]',
    },
    {
        tab: SidebarTab.ANALYTICS,
        label: 'Analytics',
        icon: <HiChartBar size={20} />,
        className: 'text-black bg-[#F6C90E]',
    },
    {
        tab: SidebarTab.DOCUMENTS,
        label: 'Documents',
        icon: <HiDocumentText size={20} />,
        className: 'text-black bg-[#FF7043]',
    },
    {
        tab: SidebarTab.SETTINGS,
        label: 'Settings',
        icon: <IoSettingsSharp size={20} />,
        className: 'text-black bg-[#9E9E9E]',
    },
];

const bottomItems: SidebarItem[] = [
    { tab: SidebarTab.CHATS, label: 'Chats' },
    { tab: SidebarTab.TRASH, label: 'Trash' },
];

export default function HomeSidebar() {
    const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.HOME);
    const searchParams = useSearchParams();
    const { session } = useUserSessionStore();

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && Object.values(SidebarTab).includes(tab as SidebarTab)) {
            setActiveTab(tab as SidebarTab);
        }
    }, [searchParams]);

    function handleTabChange(tab: SidebarTab) {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
        setActiveTab(tab);
    }

    return (
        <aside className="w-72 h-full bg-white dark:bg-zinc-900 text-neutral-500 dark:text-neutral-400 overflow-y-auto rounded-sm pt-4 flex flex-col justify-between">
            <section>
                <AppLogo withText className="px-4" />
                <span className="block px-4 text-xs font-bold mt-4 text-neutral-500 dark:text-neutral-400">
                    MENU
                </span>
                <section className="flex flex-col gap-y-1 mt-2 px-4">
                    {sidebarItems.map((item: SidebarItem) => (
                        <div
                            onClick={() => handleTabChange(item.tab)}
                            className={cn(
                                'relative flex items-center gap-x-2 py-1 px-3 rounded cursor-pointer hover:text-black dark:hover:text-white',
                                'hover:bg-black/10 dark:hover:bg-white/10',
                            )}
                            key={item.tab}
                        >
                            {activeTab === item.tab && (
                                <div className="absolute left-px top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-black dark:bg-white shadow-[0_0_10px_2px_rgba(242, 235, 235, 0.843)] transition-all duration-500 ease-out" />
                            )}
                            <span className={cn('p-1 rounded', item.className)}>{item.icon}</span>
                            <span className="text-sm text-black dark:text-white">{item.label}</span>
                        </div>
                    ))}
                </section>
            </section>
            <section className="">
                <section className="flex flex-col mt-2 px-4">
                    {bottomItems.map((item: SidebarItem) => (
                        <div
                            onClick={() => handleTabChange(item.tab)}
                            className={cn(
                                'relative flex items-center gap-x-1 py-1.75 px-3 rounded cursor-pointer hover:text-black dark:hover:text-white',
                                'hover:bg-black/10 dark:hover:bg-white/10',
                            )}
                            key={item.tab}
                        >
                            {activeTab === item.tab && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(242, 235, 235, 0.843)] transition-all duration-500 ease-out" />
                            )}
                            <span className="text-[12px] text-black dark:text-white">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </section>
                {session?.user.email && (
                    <div className="border-t border-black/10 dark:border-white/10 mt-6 flex justify-between items-center">
                        <section className="flex items-center justify-start gap-x-2 text-black dark:text-white px-4 py-2">
                            <Image
                                src={session?.user.image}
                                width={28}
                                height={28}
                                alt="user-logo"
                                className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all rounded-full"
                            />
                            <span className="text-base font">{session.user.name}</span>
                        </section>
                        <section className="">
                            <DarkModeToggle />
                        </section>
                    </div>
                )}
            </section>
        </aside>
    );
}
