'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoPeopleSharp, IoSettingsSharp } from 'react-icons/io5';
import { HiChartBar, HiDocumentText } from 'react-icons/hi';
import { MdHomeFilled } from "react-icons/md";
import { cn } from '@/lib/utils';


export enum SidebarTab {
    HOME = 'home',
    TEAM = 'team',
    ANALYTICS = 'analytics',
    DOCUMENTS = 'documents',
    SETTINGS = 'settings',
}

interface SidebarItem {
    tab: SidebarTab;
    label: string;
    icon: React.ReactNode;
    className?: string;
}

const sidebarItems: SidebarItem[] = [
    { tab: SidebarTab.HOME, label: 'Home', icon: <MdHomeFilled size={20} />, className: "text-black bg-[#93BD57]" },
    { tab: SidebarTab.TEAM, label: 'Team', icon: <IoPeopleSharp size={20} />, className: "text-black bg-[#5C6BC0]" },
    { tab: SidebarTab.ANALYTICS, label: 'Analytics', icon: <HiChartBar size={20} />, className: "text-black bg-[#F6C90E]" },
    { tab: SidebarTab.DOCUMENTS, label: 'Documents', icon: <HiDocumentText size={20} />, className: "text-black bg-[#FF7043]" },
    { tab: SidebarTab.SETTINGS, label: 'Settings', icon: <IoSettingsSharp size={20} />, className: "text-black bg-[#9E9E9E]" },
];

export default function HomeSidebar() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.HOME);

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
        <aside className="w-60 h-full bg-gamma overflow-y-auto rounded-sm pt-4 text-neutral-500">
            <span className='px-4 text-xs font-bold'>MENU</span>
            <section className='flex flex-col gap-y-1 mt-2 px-4'>
                {sidebarItems.map((item: SidebarItem) => (
                    <div
                        onClick={() => handleTabChange(item.tab)}
                        className={cn('flex items-center gap-x-2 hover:bg-neutral-300 py-2 px-2 rounded cursor-pointer hover:text-black border',
                            activeTab === item.tab ? "border-black shadow-[2px_2px_0_0_#000000]" : "border-transparent"
                        )} key={item.tab}>
                        <span className={cn("p-1 rounded-sm", item.className)}>{item.icon}</span>
                        <span className='text-sm'>{item.label}</span>
                    </div>
                ))}
            </section>
        </aside>
    );
}
