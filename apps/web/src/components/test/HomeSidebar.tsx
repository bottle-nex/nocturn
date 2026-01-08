"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IoHomeSharp, IoPeopleSharp, IoSettingsSharp } from "react-icons/io5";
import { HiChartBar, HiDocumentText } from "react-icons/hi";
import { Button } from "../ui/button";

export enum SidebarTab {
    HOME = "home",
    TEAM = "team",
    ANALYTICS = "analytics",
    DOCUMENTS = "documents",
    SETTINGS = "settings",
}

interface SidebarItem {
    tab: SidebarTab;
    label: string;
    icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
    { tab: SidebarTab.HOME, label: "Home", icon: <IoHomeSharp size={20} /> },
    { tab: SidebarTab.TEAM, label: "Team", icon: <IoPeopleSharp size={20} /> },
    { tab: SidebarTab.ANALYTICS, label: "Analytics", icon: <HiChartBar size={20} /> },
    { tab: SidebarTab.DOCUMENTS, label: "Documents", icon: <HiDocumentText size={20} /> },
    { tab: SidebarTab.SETTINGS, label: "Settings", icon: <IoSettingsSharp size={20} /> },
];

export default function HomeSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<SidebarTab>(SidebarTab.HOME);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && Object.values(SidebarTab).includes(tab as SidebarTab)) {
            setActiveTab(tab as SidebarTab);
        }
    }, [searchParams]);

    const handleTabClick = (tab: SidebarTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`${pathname}?${params.toString()}`);
    };

    // const renderContent = () => {
    //     switch (activeTab) {
    //         case SidebarTab.HOME:
    //             return "Home Content";
    //         case SidebarTab.TEAM:
    //             return "Team Content";
    //         case SidebarTab.ANALYTICS:
    //             return "Analytics Content";
    //         case SidebarTab.DOCUMENTS:
    //             return "Documents Content";
    //         case SidebarTab.SETTINGS:
    //             return "Settings Content";
    //         default:
    //             return "Select a tab";
    //     }
    // };
    const renderContent = () => {
        switch (activeTab) {
            case SidebarTab.HOME:
                return "Home Content";
            case SidebarTab.TEAM:
                return "Team Content";
            case SidebarTab.ANALYTICS:
                return "Analytics Content";
            case SidebarTab.DOCUMENTS:
                return "Documents Content";
            case SidebarTab.SETTINGS:
                return "Settings Content";
            default:
                return "Select a tab";
        }
    };

    return (
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-light-prime dark:bg-dark-prime border-r">
            <nav className="flex flex-col p-4 gap-1">
                {sidebarItems.map((item) => {
                    const isActive = activeTab === item.tab;
                    return (
                        <Button
                            key={item.tab}
                            onClick={() => handleTabClick(item.tab)}
                            className={`
                                flex items-center justify-start gap-3 px-4 py-2.5 rounded-sm font-medium text-sm bg-transparent hover:bg-transparent shadow-none
                                transition-colors duration-150
                                ${isActive
                                    ? 'text-prime border border-prime'
                                    : 'text-dark-prime dark:text-light-prime hover:bg-light-base dark:hover:bg-dark-base'
                                }
                            `}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Button>
                    );
                })}
            </nav>
        </aside>
    );
}