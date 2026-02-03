'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { MdOutlineFolderShared, MdOutlineHomeMax } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';
import DarkModeToggle from '../base/DarkModeToggle';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import { GoPeople } from 'react-icons/go';
import { PiChats, PiTrashSimple } from 'react-icons/pi';
import { RiSettings6Line } from 'react-icons/ri';
import { FaRegHeart } from 'react-icons/fa6';
import { useDragQuizStore } from '@/store/home/useDragQuizStore';

export interface SidebarItem {
    tab: SidebarTab;
    label: string;
    icon?: React.ReactNode;
    className?: string;
}

const sidebarItems: SidebarItem[] = [
    {
        tab: SidebarTab.HOME,
        label: 'Home',
        icon: <MdOutlineHomeMax size={18} />,
    },
    {
        tab: SidebarTab.MY_QUIZZES,
        label: 'My Quizzes',
        icon: <GoPeople size={18} />,
    },
    {
        tab: SidebarTab.SHARED_WITH_ME,
        label: 'Shared with me',
        icon: <MdOutlineFolderShared size={18} />,
    },
    {
        tab: SidebarTab.FAVORITES,
        label: 'Favorites',
        icon: <FaRegHeart size={17} />,
    },
    {
        tab: SidebarTab.SETTINGS,
        label: 'Settings',
        icon: <RiSettings6Line size={18} />,
    },
    { tab: SidebarTab.CHATS, label: 'Chats', icon: <PiChats size={18} /> },
    { tab: SidebarTab.TRASH, label: 'Trash', icon: <PiTrashSimple size={18} /> },
];

export default function HomeSidebar() {
    const { activeTab, setActiveTab } = useHomeSidebarStore();
    const searchParams = useSearchParams();
    const { session } = useUserSessionStore();

    const { isDragging, isOverTrash, setOverTrash } = useDragQuizStore();

    const trashRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && Object.values(SidebarTab).includes(tab as SidebarTab)) {
            setActiveTab(tab as SidebarTab);
        }
    }, [searchParams, setActiveTab]);

    useEffect(() => {
        if (!isDragging) {
            setOverTrash(false);
            return;
        }

        function handlePointerMove(e: PointerEvent) {
            if (!trashRef.current) return;

            const rect = trashRef.current.getBoundingClientRect();

            const over =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            setOverTrash(over);
        }

        window.addEventListener('pointermove', handlePointerMove);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
        };
    }, [isDragging, setOverTrash]);

    function handleTabChange(tab: SidebarTab) {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);

        setActiveTab(tab);
    }

    return (
        <aside
            className="w-90 h-full bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 overflow-y-auto custom-scrollbar pt-4 flex flex-col justify-between"
            data-lenis-prevent
        >
            <div>
                <section className="ml-4 mt-8">
                    <span className="block px-4 text-xs font-bold mt-4">MENU</span>

                    <section className="flex flex-col gap-y-2 mt-2 px-4">
                        {sidebarItems.slice(0, 3).map((item) => (
                            <div
                                onClick={() => handleTabChange(item.tab)}
                                className={cn(
                                    'relative flex items-center gap-x-2 py-1 px-3 rounded cursor-pointer w-4/5',
                                    'hover:bg-indigo-600/5 dark:hover:bg-indigo-600/10',
                                )}
                                key={item.tab}
                            >
                                {activeTab === item.tab && (
                                    <div className="absolute left-px top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-600 transition-all duration-500 ease-out" />
                                )}

                                <span className="p-1 rounded">{item.icon}</span>

                                <span className="text-[13px] dark:text-white/80 text-black/90 text-nowrap">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </section>
                </section>

                <section className="ml-4 mt-8">
                    <span className="block text-xs font-normal mt-2 px-8.25">utility</span>

                    <section className="flex flex-col gap-y-2 mt-2 px-4">
                        {sidebarItems.slice(3, 5).map((item) => (
                            <div
                                onClick={() => handleTabChange(item.tab)}
                                className={cn(
                                    'relative flex items-center gap-x-2 py-1 px-3 rounded cursor-pointer w-4/5',
                                    'hover:bg-indigo-600/5 dark:hover:bg-indigo-600/10',
                                )}
                                key={item.tab}
                            >
                                {activeTab === item.tab && (
                                    <div className="absolute left-px top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-600 transition-all duration-500 ease-out" />
                                )}

                                <span className="p-1 rounded">{item.icon}</span>

                                <span className="text-[13px] dark:text-white/80 text-black/90 text-nowrap">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </section>
                </section>
            </div>

            <section className="ml-4 mt-8">
                <section className="flex flex-col gap-y-2 mt-2 px-4">
                    <div
                        onClick={() => handleTabChange(SidebarTab.CHATS)}
                        className={cn(
                            'relative flex items-center gap-x-2 py-1 px-3 rounded cursor-pointer w-4/5',
                            'hover:bg-indigo-600/5 dark:hover:bg-indigo-600/10',
                        )}
                    >
                        {activeTab === SidebarTab.CHATS && (
                            <div className="absolute left-px top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-600 transition-all duration-500 ease-out" />
                        )}

                        <span className="p-1 rounded">
                            <PiChats size={18} />
                        </span>

                        <span className="text-sm dark:text-white/80 text-black/90">Chats</span>
                    </div>

                    <div
                        ref={trashRef}
                        onClick={() => handleTabChange(SidebarTab.TRASH)}
                        className={cn(
                            'relative flex items-center gap-x-2 py-1 px-3 rounded cursor-pointer w-3/5 transition-all duration-200',
                            'hover:bg-indigo-600/5 dark:hover:bg-indigo-600/10',
                            isDragging &&
                                'ring-2 ring-red-500/50 ring-offset-2 dark:ring-offset-neutral-950',
                            isOverTrash &&
                                isDragging &&
                                'bg-red-500/20 dark:bg-red-500/30 scale-110 ring-red-600',
                        )}
                    >
                        {activeTab === SidebarTab.TRASH && !isDragging && (
                            <div className="absolute left-px top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-indigo-600 dark:bg-indigo-600 shadow-[0_0_10px_2px_rgba(242,235,235,0.843)] transition-all duration-500 ease-out" />
                        )}

                        <span
                            className={cn(
                                'p-1 rounded transition-colors',
                                isOverTrash && isDragging && 'text-red-600 dark:text-red-400',
                            )}
                        >
                            <PiTrashSimple size={18} />
                        </span>

                        <span
                            className={cn(
                                'text-sm dark:text-white/80 text-black/90 transition-colors',
                                isOverTrash &&
                                    isDragging &&
                                    'text-red-600 dark:text-red-400 font-semibold',
                            )}
                        >
                            {isOverTrash && isDragging ? 'Drop here' : 'Trash'}
                        </span>
                    </div>
                </section>

                {session?.user.email && (
                    <div className="flex justify-between items-center my-3 mr-4">
                        <section className="flex items-center justify-start gap-x-3 text-black dark:text-white px-4 py-2">
                            <Image
                                src={session.user.image}
                                width={28}
                                height={28}
                                alt="user-logo"
                                className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all rounded-full"
                            />
                            <span className="text-base font">{session.user.name}</span>
                        </section>

                        <section>
                            <DarkModeToggle />
                        </section>
                    </div>
                )}
            </section>
        </aside>
    );
}
